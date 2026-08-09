import React, { useEffect, useState } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  "ROBCO UNIFIED OPERATING SYSTEM (v1.15)",
  "INITIALIZING 640KB RAM... OK",
  "BAUD: 9600 BPS | PROTOCOL: VT-100",
  "CRT PHOSPHOR TUBE WARMUP COMPLETE",
  "STATUS: SYSTEM READY_",
];

/**
 * BootSequence
 * Retro character-by-character typewriter RobCo CRT diagnostic boot sequence.
 * Auto-dismisses on completion.
 */
export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState<string>("");
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (currentLineIndex >= BOOT_LINES.length) {
      const finishTimeout = setTimeout(() => {
        setIsFinished(true);
        setTimeout(onComplete, 350);
      }, 400);
      return () => clearTimeout(finishTimeout);
    }

    const fullText = BOOT_LINES[currentLineIndex];
    let charIdx = 0;

    const charTimer = setInterval(() => {
      if (charIdx <= fullText.length) {
        setCurrentLineText(fullText.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(charTimer);
        setTimeout(() => {
          setCompletedLines((prev) => [...prev, fullText]);
          setCurrentLineText("");
          setCurrentLineIndex((prev) => prev + 1);
        }, 120);
      }
    }, 22);

    return () => clearInterval(charTimer);
  }, [currentLineIndex, onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-6 font-mono transition-opacity duration-300 ${
        isFinished ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="max-w-lg w-full bg-(--bg-panel) border-2 border-(--border-accent) rounded-lg p-6 shadow-2xl animate-power-on">
        <div className="flex flex-col gap-2 text-xs sm:text-sm text-(--text-correct) crt-glow">
          {completedLines.map((line, i) => (
            <p key={i} className="tracking-wide">
              {line}
            </p>
          ))}
          {currentLineIndex < BOOT_LINES.length && (
            <p className="tracking-wide flex items-center">
              <span>{currentLineText}</span>
              <span className="inline-block w-2 h-4 bg-(--text-correct) ml-0.5 animate-pulse" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
