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
 * RobCo CRT 1.2-second retro power-on cathode expansion & diagnostic boot animation.
 * Requires 0 engine logic changes and auto-dismisses on completion.
 */
export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < BOOT_LINES.length) {
        setDisplayedLines((prev) => [...prev, BOOT_LINES[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(onComplete, 350);
        }, 300);
      }
    }, 160);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-6 font-mono transition-opacity duration-300 ${
        isFinished ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="max-w-lg w-full bg-(--bg-panel) border-2 border-(--border-accent) rounded-lg p-6 shadow-2xl animate-power-on">
        <div className="flex flex-col gap-2 text-xs sm:text-sm text-(--text-correct) crt-glow">
          {displayedLines.map((line, i) => (
            <p key={i} className="tracking-wide">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
