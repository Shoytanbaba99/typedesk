import React, { useEffect, useState, useCallback } from "react";

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

const BOOT_SEEN_KEY = "typedesk_boot_seen";

/**
 * BootSequence
 * Fast, skippable RobCo CRT diagnostic boot sequence.
 * - Plays ONCE per session (sessionStorage check).
 * - Instant tap / keypress skip supported.
 * - 12ms typing speed for snappy 800ms natural completion.
 */
export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState<string>("");
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Skip boot sequence instantly and persist session flag
  const skipBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_SEEN_KEY, "true");
    } catch {
      // Ignore quota/private browsing errors
    }
    setIsFinished(true);
    setTimeout(onComplete, 150);
  }, [onComplete]);

  // 1. Session Storage Guard: Skip instantly if boot was already seen this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_SEEN_KEY) === "true") {
        onComplete();
      }
    } catch {
      // Ignore errors
    }
  }, [onComplete]);

  // 2. Global Keydown & Click Skip Listeners
  useEffect(() => {
    const handleKeyOrClick = () => {
      skipBoot();
    };

    window.addEventListener("keydown", handleKeyOrClick);
    window.addEventListener("touchstart", handleKeyOrClick);

    return () => {
      window.removeEventListener("keydown", handleKeyOrClick);
      window.removeEventListener("touchstart", handleKeyOrClick);
    };
  }, [skipBoot]);

  // 3. Fast Typewriter Sequence (12ms / char)
  useEffect(() => {
    if (currentLineIndex >= BOOT_LINES.length) {
      const finishTimeout = setTimeout(() => {
        skipBoot();
      }, 250);
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
        }, 70);
      }
    }, 12);

    return () => clearInterval(charTimer);
  }, [currentLineIndex, skipBoot]);

  return (
    <div
      onClick={skipBoot}
      className={`fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 font-mono transition-opacity duration-200 cursor-pointer select-none ${
        isFinished ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="max-w-lg w-full bg-(--bg-panel) border-2 border-(--border-accent) rounded-lg p-6 shadow-2xl animate-power-on flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-(--text-correct) crt-glow">
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

        {/* Skip Hint Footer */}
        <div className="pt-2 border-t border-(--border-accent)/30 flex items-center justify-between text-[10px] text-(--text-untyped) uppercase tracking-wider">
          <span>[ROBCO SYSTEM BIOS]</span>
          <span className="animate-pulse">[TAP OR PRESS ANY KEY TO SKIP_]</span>
        </div>
      </div>
    </div>
  );
};
