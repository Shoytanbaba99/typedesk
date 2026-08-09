import React from "react";

interface CaretProps {
  x: number; // Left offset in pixels relative to relative container
  y: number; // Top offset in pixels relative to relative container
  width: number; // Exact measured charWidth in pixels
  height: number; // Exact measured lineHeight in pixels
  isIdle?: boolean; // True when user pauses typing (triggers 530ms blink)
  isVisible?: boolean; // False before test starts or on window blur
  disableTransition?: boolean; // True on line-wraps to prevent diagonal gliding
}

/**
 * Caret
 * Single persistent floating block cursor (█).
 * Glides horizontally on same-line keypresses and jumps instantly on line wraps.
 */
export const Caret: React.FC<CaretProps> = React.memo(
  ({ x, y, width, height, isIdle = true, isVisible = true, disableTransition = false }) => {
    return (
      <span
        className={`
            absolute top-0 left-0 bg-(--text-correct) crt-glow pointer-events-none z-20
            ${isVisible ? (isIdle ? "animate-caret-blink opacity-100" : "opacity-100") : "opacity-0"}
          `}
        style={{
          width: "2.5px",
          height: `${height}px`,
          transform: `translate3d(${x}px, ${y}px, 0)`,
          transition: disableTransition
            ? "none"
            : "transform 85ms cubic-bezier(0.2, 0, 0, 1), opacity 75ms ease",
        }}
        aria-hidden={true}
      />
    );
  },
);

Caret.displayName = "Caret";
