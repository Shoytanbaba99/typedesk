import { useState, useMemo } from "react";
import { TerminalContainer } from "./components/terminal/TerminalContainer";
import { TerminalHeader } from "./components/terminal/TerminalHeader";
import { TypingArea } from "./components/terminal/TypingArea";
import { StatsBar } from "./components/terminal/StatsBar";
import { useKeystrokeEngine, type WordMatrixState } from "./hooks/useKeystrokeEngine";
import { usePerformanceTimer } from "./hooks/usePerformanceTimer";

// Expanded terminal dictionary to ensure multi-line scrolling session (60 words)
const EXPANDED_WORDS = [
  "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
  "fallout", "terminal", "phosphor", "green", "wyse", "amber", "bletchley",
  "cipher", "keystroke", "engine", "monospaced", "arithmetic", "performance",
  "zero", "reflow", "interaction", "next", "paint", "submillisecond", "react",
  "typescript", "vite", "component", "isolation", "state", "immutability",
  "monotonic", "timer", "animation", "frame", "viewport", "scrolling",
  "matrix", "character", "precision", "tactile", "feedback", "glow",
  "scanline", "vignette", "theme", "switcher", "custom", "properties",
  "fallout", "robcop", "industrial", "console", "speed", "test", "session"
];

function App() {
  const [wordsList] = useState<string[]>(EXPANDED_WORDS);

  // High-precision monotonic timer hook
  const {
    elapsedSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    startTimer,
    resumeTimer,
  } = usePerformanceTimer({ duration: 30 }); // 30-second default test mode

  // Keystroke event engine hook
  const {
    wordMatrix,
    currentWordIdx,
    currentCharIdx,
    isTestStarted,
    isTestFinished,
  } = useKeystrokeEngine({
    wordsList,
    onFirstKeystroke: startTimer,
  });

  // Derived live WPM and Accuracy metrics
  const { wpm, accuracy } = useMemo(() => {
    return computeLiveStats(wordMatrix, elapsedSeconds);
  }, [wordMatrix, elapsedSeconds]);

  return (
    <main className="min-h-screen bg-(--bg-main) flex items-center justify-center p-2 sm:p-6 md:p-8 transition-colors duration-200">
      <TerminalContainer>
        <TerminalHeader />

        {/* Live Metrics Display Bar */}
        <StatsBar
          wpm={wpm}
          accuracy={accuracy}
          remainingSeconds={remainingSeconds}
          isTestStarted={isTestStarted && isRunning}
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
    </main>
  );
}

/**
 * computeLiveStats
 * Computes standard 5-character WPM and Accuracy percentage.
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
  const wpm = Math.round((correctChars / 5) / elapsedMinutes);
  const accuracy = totalTypedChars > 0 ? (correctChars / totalTypedChars) * 100 : 100;

  return { wpm, accuracy };
}

export default App;
