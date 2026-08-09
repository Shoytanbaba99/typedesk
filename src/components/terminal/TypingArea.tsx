import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Word, WordMatrixState } from "./Word";
import { Caret } from "./Caret";

interface TypingAreaProps {
  wordMatrix: WordMatrixState[];
  currentWordIdx: number;
  currentCharIdx: number;
  isTestStarted?: boolean;
  isTestFinished?: boolean;
  isPaused?: boolean;
  onResume?: () => void;
}

/**
 * TypingArea
 * 100% Pure Zero-Reflow Terminal Viewport.
 * Uses pre-measured monospace character cell math for instant, 0-reflow gliding caret coordinates.
 */
export const TypingArea: React.FC<TypingAreaProps> = ({
  wordMatrix,
  currentWordIdx,
  currentCharIdx,
  isTestStarted = false,
  isTestFinished = false,
  isPaused = false,
  onResume,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Caret coordinate state
  const [caretPos, setCaretPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [disableCaretTransition, setDisableCaretTransition] = useState<boolean>(false);
  const prevLineRef = useRef<number>(0);

  // Pre-measured font cell and container metrics
  const metricsRef = useRef<{ charWidth: number; lineHeight: number; maxCols: number }>({
    charWidth: 14.4,
    lineHeight: 36,
    maxCols: 50,
  });

  // 1. Measure font cell and container width ONCE on mount & resize
  useLayoutEffect(() => {
    const updateMetrics = () => {
      if (measureRef.current && containerRef.current) {
        const charRect = measureRef.current.getBoundingClientRect();
        const containerWidth = containerRef.current.clientWidth - 32; // Subtract padding

        if (charRect.width > 0 && charRect.height > 0 && containerWidth > 0) {
          const charWidth = charRect.width;
          const lineHeight = charRect.height;
          const maxCols = Math.max(10, Math.floor(containerWidth / charWidth));

          metricsRef.current = { charWidth, lineHeight, maxCols };
        }
      }
    };

    updateMetrics();

    // Listen to container resize to update maxCols on browser window resize
    const resizeObserver = new ResizeObserver(updateMetrics);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 2. Pure Arithmetic Caret Position Calculation on Keypress (0 DOM Reads!)
  useEffect(() => {
    const { charWidth, lineHeight, maxCols } = metricsRef.current;

    const { x, y, line } = computeCaretCoordinates(
      wordMatrix,
      currentWordIdx,
      currentCharIdx,
      maxCols,
      charWidth,
      lineHeight,
    );

    // If line index changed (line wrap), disable transition for 1 frame tick to avoid diagonal slide
    if (line !== prevLineRef.current) {
      setDisableCaretTransition(true);
      prevLineRef.current = line;
    } else {
      setDisableCaretTransition(false);
    }

    setCaretPos({ x, y });
  }, [wordMatrix, currentWordIdx, currentCharIdx]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[160px] p-4 font-mono select-none overflow-hidden"
    >
      {/* Hidden character span used ONLY for initial font metric measurement */}
      <span
        ref={measureRef}
        className="absolute top-0 left-0 opacity-0 pointer-events-none font-mono text-xl sm:text-2xl"
        aria-hidden={true}
      >
        M
      </span>

      {/* Gliding Caret */}
      <Caret
        x={caretPos.x}
        y={caretPos.y}
        isIdle={!isTestStarted}
        isVisible={!isPaused && !isTestFinished}
        disableTransition={disableCaretTransition}
      />

      {/* Word Matrix Container */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-xl sm:text-2xl leading-relaxed">
        {wordMatrix.map((wordData) => (
          <Word
            key={wordData.wordId}
            id={`w-${wordData.wordId}`}
            characters={wordData.characters}
            hasError={wordData.hasError}
          />
        ))}
      </div>

      {/* Pause Overlay (Appears on Tab Blur / Window Loss) */}
      {isPaused && (
        <div
          onClick={onResume}
          className="absolute inset-0 bg-(--bg-panel)/90 backdrop-blur-xs z-30 flex flex-col items-center
  justify-center gap-3 cursor-pointer"
        >
          <p className="text-xl sm:text-2xl font-bold text-(--text-correct) crt-glow animate-pulse">
            [TEST PAUSED]
          </p>
          <p className="text-xs sm:text-sm text-(--text-untyped) uppercase tracking-wider">
            Click or press any key to resume typing_
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * computeCaretCoordinates
 * Pure arithmetic coordinate generator.
 */
function computeCaretCoordinates(
  matrix: WordMatrixState[],
  wordIdx: number,
  charIdx: number,
  maxCols: number,
  charWidth: number,
  lineHeight: number,
): { x: number; y: number; line: number } {
  if (matrix.length === 0 || maxCols <= 0) {
    return { x: 0, y: 0, line: 0 };
  }

  let line = 0;
  let col = 0;

  for (let w = 0; w < matrix.length; w++) {
    const wordLen = matrix[w].characters.length;
    const neededCols = col === 0 ? wordLen : wordLen + 1;

    if (col > 0 && col + neededCols > maxCols) {
      line++;
      col = 0;
    } else if (col > 0) {
      col += 1;
    }

    if (w === wordIdx) {
      const activeCol = col + charIdx;
      return {
        x: activeCol * charWidth,
        y: line * lineHeight,
        line,
      };
    }

    col += wordLen;
  }

  return { x: 0, y: 0, line: 0 };
}
