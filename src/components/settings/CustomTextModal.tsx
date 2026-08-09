import React, { useState } from "react";
import { parseCustomText, MAX_CUSTOM_WORDS } from "../../utils/wordGenerator";

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomText: (words: string[], truncated: boolean) => void;
}

/**
 * CustomTextModal
 * RobCo Terminal custom word list ingestion modal with defensive schema validation
 * and truncation notification forwarding.
 */
export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomText,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { words, error, truncated } = parseCustomText(inputText);

    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(null);
    onApplyCustomText(words, truncated);
    setInputText("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal={true}
      aria-labelledby="custom-text-title"
    >
      <div className="bg-(--bg-panel) border-2 border-(--border-accent) rounded-lg max-w-lg w-full p-6 shadow-2xl relative font-mono">
        <h2
          id="custom-text-title"
          className="text-xl font-bold text-(--text-correct) crt-glow mb-2"
        >
          [CUSTOM WORD LIST INGESTION]
        </h2>
        <p className="text-xs text-(--text-untyped) mb-4">
          Paste custom text or a JSON string array (e.g. `["react", "typescript", "vite"]`).
          Max {MAX_CUSTOM_WORDS} words.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder='Paste plain text or JSON array ["apple", "banana", "cherry"]...'
            rows={6}
            className="w-full bg-(--bg-main) border border-(--border-accent) rounded p-3 text-sm text-(--text-correct) placeholder:text-(--text-untyped)/50 focus:outline-none focus:border-(--text-correct) font-mono resize-none"
            autoFocus
          />

          {/* Defensive Schema Error Banner */}
          {errorMessage && (
            <div className="bg-(--text-error)/10 border border-(--text-error) rounded p-2 text-xs text-(--text-error) font-bold">
              [SCHEMA ERROR] {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs text-(--text-untyped) hover:text-(--text-correct) transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-(--border-accent) hover:bg-(--text-correct)/20 border border-(--text-correct) text-(--text-correct) font-bold rounded text-xs crt-glow transition-all"
            >
              INGEST TEXT_
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
