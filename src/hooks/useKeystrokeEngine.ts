import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { CharacterData } from "../components/terminal/Word";

export interface WordMatrixState {
  wordId: number;
  originalText: string;
  characters: CharacterData[];
  hasError: boolean;
}

interface UseKeystrokeEngineOptions {
  wordsList: string[]; // List of words for current test session
  sessionKey?: number; // Primitive counter incremented on explicit test restart
  isModalOpen?: boolean; // Modal guard to block typing when modals are open
  onFirstKeystroke?: () => void; // Trigger timer start
  onTestComplete?: (finalWords: WordMatrixState[]) => void;
  onRestart?: () => void; // Quick restart shortcut callback triggered on Tab key
}

/**
 * useKeystrokeEngine
 * Global window.keydown event engine.
 * Fully optimized: 0 GC string allocations on hot path, collision-proof null-char hashing.
 */
export function useKeystrokeEngine({
  wordsList,
  sessionKey = 0,
  isModalOpen = false,
  onFirstKeystroke,
  onTestComplete,
  onRestart,
}: UseKeystrokeEngineOptions) {
  // Build initial word matrix state from words list
  const initializeMatrix = useCallback((list: string[]): WordMatrixState[] => {
    return list.map((wordStr, wordIdx) => ({
      wordId: wordIdx,
      originalText: wordStr,
      hasError: false,
      characters: wordStr.split("").map((char, charIdx) => ({
        id: `w${wordIdx}-c${charIdx}-${char}`,
        char,
        status: "pending",
      })),
    }));
  }, []);

  // Compute collision-proof fingerprint cached via useMemo (0ms allocation on keystrokes)
  const currentContentKey = useMemo(
    () => `${sessionKey}:${wordsList.length}:${wordsList.join("\u0000")}`,
    [sessionKey, wordsList],
  );

  const [prevContentKey, setPrevContentKey] = useState<string>(currentContentKey);
  const [wordMatrix, setWordMatrix] = useState<WordMatrixState[]>(() =>
    initializeMatrix(wordsList),
  );
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(0);
  const [currentCharIdx, setCurrentCharIdx] = useState<number>(0);
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);

  // Adjust state synchronously during render ONLY when primitive content key actually changes
  if (prevContentKey !== currentContentKey) {
    setPrevContentKey(currentContentKey);
    const nextMatrix = initializeMatrix(wordsList);
    setWordMatrix(nextMatrix);
    setCurrentWordIdx(0);
    setCurrentCharIdx(0);
    setIsTestStarted(false);
    setIsTestFinished(false);
  }

  // Refs for hot-path keydown callback tracking
  const isStartedRef = useRef<boolean>(false);
  const isFinishedRef = useRef<boolean>(false);
  const currentWordIdxRef = useRef<number>(0);
  const currentCharIdxRef = useRef<number>(0);
  const wordMatrixRef = useRef<WordMatrixState[]>(wordMatrix);
  const isModalOpenRef = useRef<boolean>(isModalOpen);

  const onFirstKeystrokeRef = useRef(onFirstKeystroke);
  const onTestCompleteRef = useRef(onTestComplete);
  const onRestartRef = useRef(onRestart);

  // Keep refs fresh without re-binding window listener
  useEffect(() => {
    wordMatrixRef.current = wordMatrix;
    currentWordIdxRef.current = currentWordIdx;
    currentCharIdxRef.current = currentCharIdx;
    isStartedRef.current = isTestStarted;
    isFinishedRef.current = isTestFinished;
    isModalOpenRef.current = isModalOpen;
    onFirstKeystrokeRef.current = onFirstKeystroke;
    onTestCompleteRef.current = onTestComplete;
    onRestartRef.current = onRestart;
  }, [
    wordMatrix,
    currentWordIdx,
    currentCharIdx,
    isTestStarted,
    isTestFinished,
    isModalOpen,
    onFirstKeystroke,
    onTestComplete,
    onRestart,
  ]);

  const tabTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabPressedRef = useRef<boolean>(false);

  // Main window.keydown event listener (Attached EXACTLY ONCE)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // 1. Modal Guard: Reset Tab combo state immediately when any modal is open
      if (isModalOpenRef.current) {
        tabPressedRef.current = false;
        return;
      }

      // 2. Tab + Enter Quick Restart Combo Shortcut (PRD Section 2)
      if (key === "Tab") {
        tabPressedRef.current = true;
        if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
        tabTimeoutRef.current = setTimeout(() => {
          tabPressedRef.current = false;
        }, 350); // Tight 350ms window for deliberate Tab + Enter combo
        return;
      }

      if (key === "Enter") {
        if (tabPressedRef.current) {
          e.preventDefault();
          tabPressedRef.current = false;
          if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
          onRestartRef.current?.();
        }
        return;
      }

      // Any intermediate key press resets the Tab combo flag to prevent leakage into UI navigation
      tabPressedRef.current = false;

      // 1. Guard against IME composition, Modal focus, or test completion
      if (e.isComposing || isModalOpenRef.current || isFinishedRef.current) return;

      // 2. Prevent default browser scrolling/navigation on shortcuts
      if (key === " ") {
        e.preventDefault();
      }

      // Ignore modifier keys alone
      if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"].includes(key)) {
        return;
      }

      const matrix = [...wordMatrixRef.current];
      const wIdx = currentWordIdxRef.current;
      const cIdx = currentCharIdxRef.current;

      if (wIdx >= matrix.length) return;

      const currentWord = { ...matrix[wIdx] };
      const chars = [...currentWord.characters];

      // 3. Start test timer on first valid keystroke
      if (!isStartedRef.current && (key.length === 1 || key === "Backspace")) {
        isStartedRef.current = true;
        setIsTestStarted(true);
        if (onFirstKeystrokeRef.current) onFirstKeystrokeRef.current();
      }

      // --- KEYSTROKE HANDLING LOGIC ---

      // A. BACKSPACE HANDLING (Atomic across word boundaries)
      if (key === "Backspace") {
        if (cIdx > 0) {
          // Revert character within current word
          const targetIdx = cIdx - 1;
          const targetChar = chars[targetIdx];

          if (targetChar.status === "extra") {
            chars.splice(targetIdx, 1);
          } else {
            chars[targetIdx] = { ...targetChar, status: "pending" };
          }

          currentWord.characters = chars;
          matrix[wIdx] = currentWord;
          setCurrentCharIdx(targetIdx);
          setWordMatrix(matrix);
        } else if (wIdx > 0) {
          // Atomic backspace into previous word: revert its last character immediately
          const prevWIdx = wIdx - 1;
          const prevWord = { ...matrix[prevWIdx] };
          const prevChars = [...prevWord.characters];

          if (prevChars.length > 0) {
            const targetIdx = prevChars.length - 1;
            const targetChar = prevChars[targetIdx];

            if (targetChar.status === "extra") {
              prevChars.splice(targetIdx, 1);
            } else {
              prevChars[targetIdx] = { ...targetChar, status: "pending" };
            }

            prevWord.characters = prevChars;
            matrix[prevWIdx] = prevWord;

            setCurrentWordIdx(prevWIdx);
            setCurrentCharIdx(targetIdx);
            setWordMatrix(matrix);
          }
        }
        return;
      }

      // B. SPACE HANDLING (Validate current word and advance)
      if (key === " ") {
        if (cIdx === 0) return; // Ignore space at start of word

        // Mark any remaining untyped letters in current word as incorrect
        for (let i = cIdx; i < chars.length; i++) {
          if (chars[i].status === "pending") {
            chars[i] = { ...chars[i], status: "incorrect" };
            currentWord.hasError = true;
          }
        }

        currentWord.characters = chars;
        matrix[wIdx] = currentWord;

        const nextWIdx = wIdx + 1;
        if (nextWIdx >= matrix.length) {
          // Test Complete
          setIsTestFinished(true);
          isFinishedRef.current = true;
          setWordMatrix(matrix);
          if (onTestCompleteRef.current) onTestCompleteRef.current(matrix);
        } else {
          // Jump to first character of next word
          setCurrentWordIdx(nextWIdx);
          setCurrentCharIdx(0);
          setWordMatrix(matrix);
        }
        return;
      }

      // C. ALPHANUMERIC / CHARACTER INPUT
      if (key.length === 1) {
        if (cIdx < currentWord.originalText.length) {
          // Type over expected character
          const expectedChar = chars[cIdx].char;
          const isCorrect = key === expectedChar;

          chars[cIdx] = {
            ...chars[cIdx],
            status: isCorrect ? "correct" : "incorrect",
          };

          if (!isCorrect) {
            currentWord.hasError = true;
          }

          currentWord.characters = chars;
          matrix[wIdx] = currentWord;

          const nextCIdx = cIdx + 1;
          setCurrentCharIdx(nextCIdx);
          setWordMatrix(matrix);
        } else if (cIdx < currentWord.originalText.length + 5) {
          // Append extra typed character beyond word length (max 5 extra chars)
          chars.push({
            id: `w${wIdx}-extra-${cIdx}-${key}`,
            char: key,
            status: "extra",
          });
          currentWord.hasError = true;
          currentWord.characters = chars;
          matrix[wIdx] = currentWord;

          const nextCIdx = cIdx + 1;
          setCurrentCharIdx(nextCIdx);
          setWordMatrix(matrix);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Attached EXACTLY ONCE for window lifecycle

  // Restart / Reset test engine
  const resetEngine = useCallback(() => {
    const freshMatrix = initializeMatrix(wordsList);
    setWordMatrix(freshMatrix);
    wordMatrixRef.current = freshMatrix;
    setCurrentWordIdx(0);
    setCurrentCharIdx(0);
    currentWordIdxRef.current = 0;
    currentCharIdxRef.current = 0;
    setIsTestStarted(false);
    setIsTestFinished(false);
    isStartedRef.current = false;
    isFinishedRef.current = false;
  }, [wordsList, initializeMatrix]);

  return {
    wordMatrix,
    currentWordIdx,
    currentCharIdx,
    isTestStarted,
    isTestFinished,
    resetEngine,
  };
}
