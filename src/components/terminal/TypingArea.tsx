import React, { useRef, useState, useLayoutEffect, useMemo } from "react";
import { Word } from "./Word";
import { Caret } from "./Caret";
import type { WordMatrixState } from "../../hooks/useKeystrokeEngine";

interface TypingAreaProps {
  wordMatrix: WordMatrixState[];
  currentWordIdx: number;
  currentCharIdx: number;
  isTestStarted?: boolean;
  isTestFinished?: boolean;
  isPaused?: boolean;
  onResume?: () => void;
}

interface LineGroup {
  lineIndex: number;
  words: {
    wordData: WordMatrixState;
    wordIdx: number;
  }[];
}

// Shared typography classes to guarantee font size and line height match 100% between measurement span & line rows
const TERMINAL_TEXT_STYLE = "font-mono text-xl sm:text-2xl leading-relaxed";

/**
 * TypingArea
 * 100% Pure Zero-Reflow Terminal Viewport with Pre-Broken Line Rendering.
 * Guarantees DOM Layout === Arithmetic Caret Engine (0 reflows, 0 caret drift, 0 cascading renders).
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

  // Pre-measured font cell and container metrics
  const [metrics, setMetrics] = useState<{
    charWidth: number;
    lineHeight: number;
    maxCols: number;
  }>({
    charWidth: 14.4,
    lineHeight: 36,
    maxCols: 50,
  });
  const metricsRef = useRef(metrics);

  // 1. Measure font cell and container width ONCE on mount & resize
  useLayoutEffect(() => {
    const updateMetrics = () => {
      if (measureRef.current && containerRef.current) {
        const charRect = measureRef.current.getBoundingClientRect();
        const containerWidth = containerRef.current.clientWidth - 32; // Subtract p-4 padding (16px * 2)

        if (charRect.width > 0 && charRect.height > 0 && containerWidth > 0) {
          const charWidth = charRect.width;
          const lineHeight = charRect.height;
          const maxCols = Math.max(10, Math.floor(containerWidth / charWidth));

          if (
            charWidth !== metricsRef.current.charWidth ||
            lineHeight !== metricsRef.current.lineHeight ||
            maxCols !== metricsRef.current.maxCols
          ) {
            const nextMetrics = { charWidth, lineHeight, maxCols };
            metricsRef.current = nextMetrics;
            setMetrics(nextMetrics);
          }
        }
      }
    };

    updateMetrics();

    const resizeObserver = new ResizeObserver(updateMetrics);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 2. Pre-break word matrix into lines so DOM layout matches arithmetic engine perfectly
  const lineGroups = useMemo(() => {
    return breakMatrixIntoLines(wordMatrix, metrics.maxCols);
  }, [wordMatrix, metrics.maxCols]);

  // 3. Pure Arithmetic Caret Position Calculation derived in-render
  const { caretPos, line } = useMemo(() => {
    const { charWidth, lineHeight, maxCols } = metrics;

    const { x, y, line } = computeCaretCoordinates(
      wordMatrix,
      currentWordIdx,
      currentCharIdx,
      maxCols,
      charWidth,
      lineHeight,
    );

    return { caretPos: { x, y }, line };
  }, [wordMatrix, currentWordIdx, currentCharIdx, metrics]);

  // 4. Render-phase state adjustment pattern (0 refs read in render, 0 effects)
  const [prevLine, setPrevLine] = useState<number>(line);
  const disableCaretTransition = line !== prevLine;

  if (line !== prevLine) {
    setPrevLine(line);
  }

  const VISIBLE_LINES = 3;

  // Clamped vertical scrolling offset (keeps active line centered in 3-line viewport)
  const maxScrollOffset = Math.max(0, (lineGroups.length - VISIBLE_LINES) * metrics.lineHeight);
  const rawScrollOffset = Math.max(0, line - 1) * metrics.lineHeight;
  const lineScrollOffset = Math.min(rawScrollOffset, maxScrollOffset);
  const containerHeight = metrics.lineHeight * VISIBLE_LINES + 32; // 3 lines + 32px padding

  return (
    <div
      ref={containerRef}
      className="relative w-full p-4 font-mono select-none overflow-hidden"
      style={{ height: `${containerHeight}px` }}
      aria-label="Terminal typing workspace"
    >
      {/* Hidden character span used ONLY for initial font metric measurement */}
      <span
        ref={measureRef}
        className={`absolute top-0 left-0 opacity-0 pointer-events-none ${TERMINAL_TEXT_STYLE}`}
        aria-hidden={true}
      >
        M
      </span>

      {/* Smoothly Scrolling Line Workspace */}
      <div
        className="relative w-full"
        style={{
          transform: `translate3d(0, -${lineScrollOffset}px, 0)`,
          transition: disableCaretTransition
            ? "none"
            : "transform 85ms cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {/* Gliding Caret */}
        <Caret
          x={caretPos.x}
          y={caretPos.y}
          isIdle={!isTestStarted}
          isVisible={!isPaused && !isTestFinished}
          disableTransition={disableCaretTransition}
        />

        {/* Pre-Broken Lines Matrix Container */}
        <div className="flex flex-col">
          {lineGroups.map((group) => (
            <div
              key={`line-${group.lineIndex}`}
              className={`flex flex-row items-center ${TERMINAL_TEXT_STYLE}`}
            >
              {group.words.map((item, itemIdx) => (
                <React.Fragment key={item.wordData.wordId}>
                  {itemIdx > 0 && <span className="inline-block font-mono select-none"> </span>}
                  <Word
                    id={`w-${item.wordData.wordId}`}
                    characters={item.wordData.characters}
                    hasError={item.wordData.hasError}
                  />
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div
          onClick={onResume}
          className="absolute inset-0 bg-(--bg-panel)/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-3 cursor-pointer"
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
 * breakMatrixIntoLines
 * Pre-computes line row grouping using exact integer column counts.
 */
function breakMatrixIntoLines(matrix: WordMatrixState[], maxCols: number): LineGroup[] {
  if (matrix.length === 0 || maxCols <= 0) return [];

  const lines: LineGroup[] = [{ lineIndex: 0, words: [] }];
  let currentLine = 0;
  let col = 0;

  for (let w = 0; w < matrix.length; w++) {
    const wordLen = matrix[w].characters.length;
    const neededCols = col === 0 ? wordLen : wordLen + 1;

    if (col > 0 && col + neededCols > maxCols) {
      currentLine++;
      col = 0;
      lines.push({ lineIndex: currentLine, words: [] });
    } else if (col > 0) {
      col += 1;
    }

    lines[currentLine].words.push({ wordData: matrix[w], wordIdx: w });
    col += wordLen;
  }

  return lines;
}

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
