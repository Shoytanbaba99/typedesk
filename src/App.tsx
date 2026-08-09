import { useState } from "react";
import { TerminalContainer } from "./components/terminal/TerminalContainer";
import { TerminalHeader } from "./components/terminal/TerminalHeader";
import { TypingArea } from "./components/terminal/TypingArea";
import { useKeystrokeEngine } from "./hooks/useKeystrokeEngine";

const DEFAULT_WORDS = [
  "the",
  "quick",
  "brown",
  "fox",
  "jumps",
  "over",
  "the",
  "lazy",
  "dog",
  "fallout",
  "terminal",
  "phosphor",
  "green",
  "wyse",
  "amber",
  "bletchley",
  "cipher",
  "keystroke",
  "engine",
  "monospaced",
  "arithmetic",
  "performance",
  "zero",
  "reflow",
  "interaction",
  "next",
  "paint",
  "submillisecond",
  "react",
];

function App() {
  const [wordsList] = useState<string[]>(DEFAULT_WORDS);

  const { wordMatrix, currentWordIdx, currentCharIdx, isTestStarted, isTestFinished } =
    useKeystrokeEngine({ wordsList });

  return (
    <main className="min-h-screen bg-(--bg-main) flex items-center justify-center p-2 sm:p-6 md:p-8 transition-colors duration-200">
      <TerminalContainer>
        <TerminalHeader />
        <TypingArea
          wordMatrix={wordMatrix}
          currentWordIdx={currentWordIdx}
          currentCharIdx={currentCharIdx}
          isTestStarted={isTestStarted}
          isTestFinished={isTestFinished}
        />
      </TerminalContainer>
    </main>
  );
}

export default App;
