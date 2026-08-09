import React from "react";

export type LetterStatus = "pending" | "correct" | "incorrect" | "extra";

interface LetterProps {
  id: string;
  char: string;
  status: LetterStatus;
}

/**
 * Letter
 * Single-span character node (50% fewer DOM nodes).
 * Primitive props guarantee O(1) React.memo skipping.
 */
export const Letter: React.FC<LetterProps> = React.memo(({ char, status }) => {
  let colorClass = "text-(--text-untyped)";
  let extraStyling = "";

  if (status === "correct") {
    colorClass = "text-(--text-correct) crt-glow";
  } else if (status === "incorrect") {
    colorClass = "text-(--text-error) underline decoration-(--text-error) decoration-2";
  } else if (status === "extra") {
    colorClass = "text-(--text-error) opacity-80 underline decoration-(--text-error)";
    extraStyling = "bg-(--text-error)/10 px-[1px] rounded-[1px]";
  }

  return (
    <span
      className={`inline-block font-mono transition-colors duration-75 ${colorClass} ${extraStyling}`}
    >
      {char}
    </span>
  );
});

Letter.displayName = "Letter";
