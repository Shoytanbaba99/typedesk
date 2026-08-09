import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TerminalContainer } from "./components/terminal/TerminalContainer";
import { TerminalHeader } from "./components/terminal/TerminalHeader";
import { TypingArea } from "./components/terminal/TypingArea";
import { StatsBar } from "./components/terminal/StatsBar";
import { ModeSelector, type ModeSettings } from "./components/settings/ModeSelector";
import { CustomTextModal } from "./components/settings/CustomTextModal";
import { BootSequence } from "./components/terminal/BootSequence";
import { ResultsModal } from "./components/analytics/ResultsModal";
import type { WpmHistoryPoint } from "./components/analytics/WpmPolylineGraph";
import { useKeystrokeEngine, type WordMatrixState } from "./hooks/useKeystrokeEngine";
import { usePerformanceTimer } from "./hooks/usePerformanceTimer";
import { useSoundEffects } from "./hooks/useSoundEffects";
import {
  generateWords,
  getQuoteByTier,
  quoteToWords,
  MAX_CUSTOM_WORDS,
} from "./utils/wordGenerator";

function App() {
  const [modeSettings, setModeSettings] = useState<ModeSettings>({
    category: "time",
    time: 30,
    words: 25,
    quote: "medium",
  });
  const [sessionKey, setSessionKey] = useState<number>(0);
  const [customWords, setCustomWords] = useState<string[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isResultsModalDismissed, setIsResultsModalDismissed] = useState<boolean>(false);
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [truncationNotice, setTruncationNotice] = useState<string | null>(null);
  const [wpmHistory, setWpmHistory] = useState<WpmHistoryPoint[]>([]);
  const lastSampleSecondRef = useRef<number>(-1);

  // Web Audio API sound effects synthesizer hook (dynamically inspects live DOM data-theme)
  const { isMuted, toggleMute, playKeyClick, playErrorSound, playCarriageBell } = useSoundEffects();

  // Compute active word list matching mode selection or custom input
  const wordsList = useMemo(() => {
    if (customWords && customWords.length > 0) {
      return customWords;
    }
    if (modeSettings.category === "quote") {
      const quote = getQuoteByTier(modeSettings.quote);
      return quoteToWords(quote);
    }
    const count = modeSettings.category === "words" ? modeSettings.words : 50;
    return generateWords(count);
  }, [modeSettings, customWords]);

  // Target test duration (0 for word count or quote mode)
  const targetDuration = modeSettings.category === "time" ? modeSettings.time : 0;

  // Keystroke event engine hook
  const {
    wordMatrix,
    currentWordIdx,
    currentCharIdx,
    isTestStarted,
    isTestFinished,
    keyErrorMap,
    resetEngine,
    finishEngine,
  } = useKeystrokeEngine({
    wordsList,
    sessionKey,
    isModalOpen: isModalOpen || isBooting,
    modeCategory: modeSettings.category,
    onFirstKeystroke: () => startTimer(),
    onRestart: () => restartTest(),
    onKeyClick: playKeyClick,
    onErrorSound: playErrorSound,
    onCompleteSound: playCarriageBell,
  });

  // Derived state: Results modal is open when test is finished and user has not dismissed it
  const isResultsModalOpen = isTestFinished && !isResultsModalDismissed;

  // High-precision monotonic timer hook
  const {
    elapsedSeconds,
    remainingSeconds,
    isPaused,
    startTimer,
    resumeTimer,
    resetTimer,
  } = usePerformanceTimer({
    duration: targetDuration,
    onExpire: finishEngine,
  });

  // Reset entire test session (defined AFTER resetEngine & resetTimer are initialized)
  const restartTest = useCallback(() => {
    resetTimer();
    resetEngine();
    setWpmHistory([]);
    lastSampleSecondRef.current = -1;
    setIsResultsModalDismissed(false);
    setSessionKey((prev) => prev + 1);
  }, [resetTimer, resetEngine]);

  // Hydrate initial mode settings from localStorage on mount (state-only, no restart side-effects)
  const handleHydrate = useCallback((initialSettings: ModeSettings) => {
    setModeSettings(initialSettings);
  }, []);

  // Handle user-initiated ModeSelector changes (updates settings AND restarts test)
  const handleSettingsChange = useCallback(
    (newSettings: ModeSettings) => {
      setModeSettings(newSettings);
      setCustomWords(null);
      setTruncationNotice(null);
      restartTest();
    },
    [restartTest],
  );

  // Handle Custom Text Ingestion
  const handleApplyCustomText = useCallback(
    (words: string[], truncated: boolean) => {
      setCustomWords(words);
      if (truncated) {
        setTruncationNotice(
          `[NOTICE] Custom text exceeded ${MAX_CUSTOM_WORDS} words. Truncated to ${MAX_CUSTOM_WORDS} words.`,
        );
      } else {
        setTruncationNotice(null);
      }
      restartTest();
    },
    [restartTest],
  );

  // Derived live WPM, Raw WPM, and Accuracy metrics (PRD Section 5)
  const { wpm, rawWpm, accuracy } = useMemo(() => {
    return computeLiveStats(wordMatrix, elapsedSeconds);
  }, [wordMatrix, elapsedSeconds]);

  // Sample second-by-second WPM trajectory for SVG graph
  useEffect(() => {
    if (isTestStarted && !isTestFinished && elapsedSeconds > 0) {
      const currentSec = Math.floor(elapsedSeconds);
      if (currentSec > lastSampleSecondRef.current) {
        lastSampleSecondRef.current = currentSec;
        setWpmHistory((prev) => [
          ...prev,
          { second: currentSec, wpm, rawWpm, errors: 0 },
        ]);
      }
    }
  }, [isTestStarted, isTestFinished, elapsedSeconds, wpm, rawWpm]);

  return (
    <main className="min-h-dvh bg-(--bg-main) flex flex-col items-center justify-start sm:justify-center p-2 sm:p-6 md:p-8 transition-colors duration-200 relative">
      {/* Subtle CRT 60Hz Refresh Micro Flicker Overlay (pointer-events-none) */}
      <div className="fixed inset-0 crt-flicker pointer-events-none z-40" aria-hidden={true} />

      {/* RobCo Power-On Cathode Boot Sequence */}
      {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}

      <TerminalContainer>
        <TerminalHeader isMuted={isMuted} onToggleMute={toggleMute} />

        {/* Mode Selector & Custom Ingestion Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <ModeSelector
            disabled={isTestStarted && !isTestFinished}
            onHydrate={handleHydrate}
            onSettingsChange={handleSettingsChange}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restartTest}
              className="px-3 py-1.5 rounded text-xs font-mono text-(--text-untyped) hover:text-(--text-correct) border border-(--border-accent) hover:border-(--text-correct) transition-all hover:crt-glow"
              title="Restart test session and shuffle words (Shortcut: Tab + Enter)"
            >
              RESTART ⟳
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isTestStarted && !isTestFinished}
              className="px-3 py-1.5 rounded text-xs font-mono text-(--text-untyped) hover:text-(--text-correct) border border-(--border-accent) hover:border-(--text-correct) transition-all disabled:opacity-40"
            >
              + CUSTOM TEXT
            </button>
          </div>
        </div>

        {/* Truncation Notice Banner */}
        {truncationNotice && (
          <div className="bg-(--border-accent)/40 border border-(--text-correct) rounded p-2 mb-3 text-xs font-mono text-(--text-correct) crt-glow flex items-center justify-between">
            <span>{truncationNotice}</span>
            <button
              onClick={() => setTruncationNotice(null)}
              className="text-xs hover:underline text-(--text-untyped) ml-2"
            >
              [DISMISS]
            </button>
          </div>
        )}

        {/* Live Metrics Display Bar */}
        <StatsBar
          wpm={wpm}
          rawWpm={rawWpm}
          accuracy={accuracy}
          remainingSeconds={remainingSeconds}
          isTestStarted={isTestStarted}
        />

        {/* Live Terminal Typing Engine Viewport */}
        <TypingArea
          wordMatrix={wordMatrix}
          currentWordIdx={currentWordIdx}
          currentCharIdx={currentCharIdx}
          isTestStarted={isTestStarted}
          isTestFinished={isTestFinished}
          isPaused={isPaused}
          onResume={resumeTimer}
        />
      </TerminalContainer>

      {/* Custom Text Ingestion Modal */}
      <CustomTextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyCustomText={handleApplyCustomText}
      />

      {/* Test Completion Diagnostic Results Modal */}
      <ResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalDismissed(true)}
        onRestart={restartTest}
        wpm={wpm}
        rawWpm={rawWpm}
        accuracy={accuracy}
        elapsedSeconds={elapsedSeconds}
        historyData={wpmHistory}
        keyErrorMap={keyErrorMap}
        wordMatrix={wordMatrix}
      />
    </main>
  );
}

/**
 * computeLiveStats
 * Computes standard 5-character Net WPM, Raw WPM, and Accuracy percentage (PRD Section 5).
 */
function computeLiveStats(matrix: WordMatrixState[], elapsedSeconds: number) {
  let correctChars = 0;
  let totalTypedChars = 0;

  for (const word of matrix) {
    for (const charObj of word.characters) {
      if (charObj.status === "correct") {
        correctChars++;
        totalTypedChars++;
      } else if (charObj.status === "incorrect" || charObj.status === "extra") {
        totalTypedChars++;
      }
    }
  }

  const elapsedMinutes = Math.max(0.001, elapsedSeconds / 60);
  const wpm = Math.round(correctChars / 5 / elapsedMinutes);
  const rawWpm = Math.round(totalTypedChars / 5 / elapsedMinutes);
  const accuracy = totalTypedChars > 0 ? (correctChars / totalTypedChars) * 100 : 100;

  return { wpm, rawWpm, accuracy };
}

export default App;
