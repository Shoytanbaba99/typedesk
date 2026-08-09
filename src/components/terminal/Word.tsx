import React from "react";
import { Letter, type LetterStatus } from "./Letter";

export interface CharacterData {
  id: string;
  char: string;
  status: LetterStatus;
}

interface WordProps {
  id: string;
  characters: CharacterData[];
  hasError?: boolean;
}

/**
 * Word
 * Isolated word container mapping characters with clean keys and 0 caret duplication.
 */
export const Word: React.FC<WordProps> = React.memo(({ characters, hasError = false }) => {
  return (
    <span
      className={`
        inline-flex items-center transition-colors duration-150
        ${hasError ? "border-b border-(--text-error)/40" : ""}
      `}
    >
      {characters.map((letterData) => (
        <Letter
          key={letterData.id}
          id={letterData.id}
          char={letterData.char}
          status={letterData.status}
        />
      ))}
    </span>
  );
});

Word.displayName = "Word";
