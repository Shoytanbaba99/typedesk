import React from "react";
import { WpmPolylineGraph, type WpmHistoryPoint } from "./WpmPolylineGraph";
import { QwertyHeatmap, type KeyErrorMap } from "./QwertyHeatmap";
import type { WordMatrixState } from "../../hooks/useKeystrokeEngine";

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  elapsedSeconds: number;
  historyData: WpmHistoryPoint[];
  keyErrorMap: KeyErrorMap;
  wordMatrix: WordMatrixState[];
}

/**
 * ResultsModal
 * RobCo CRT Terminal test completion diagnostic summary drawer.
 * Displays final speed metrics, SVG polyline graph, and QWERTY error heatmap.
 */
export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  wpm,
  rawWpm,
  accuracy,
  elapsedSeconds,
  historyData,
  keyErrorMap,
  wordMatrix,
}) => {
  if (!isOpen) return null;

  // Character breakdown math
  const charStats = computeCharacterBreakdown(wordMatrix);

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 font-mono"
      role="dialog"
      aria-modal={true}
      aria-labelledby="results-modal-title"
    >
      <div className="bg-(--bg-panel) border-2 border-(--border-accent) rounded-xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-(--border-accent) pb-3">
          <h2 id="results-modal-title" className="text-lg sm:text-xl font-bold text-(--text-correct) crt-glow">
            [SESSION DIAGNOSTIC SUMMARY]
          </h2>
          <span className="text-xs text-(--text-untyped)">ROBCO REVISION 1.15</span>
        </div>

        {/* Primary Metrics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-(--bg-main) border border-(--border-accent) rounded p-3 text-center">
            <p className="text-xs text-(--text-untyped) uppercase">WPM</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-(--text-correct) crt-glow">{wpm}</p>
          </div>
          <div className="bg-(--bg-main) border border-(--border-accent) rounded p-3 text-center">
            <p className="text-xs text-(--text-untyped) uppercase">RAW WPM</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-(--text-correct)/80">{rawWpm}</p>
          </div>
          <div className="bg-(--bg-main) border border-(--border-accent) rounded p-3 text-center">
            <p className="text-xs text-(--text-untyped) uppercase">ACCURACY</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-(--text-correct) crt-glow">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-(--bg-main) border border-(--border-accent) rounded p-3 text-center">
            <p className="text-xs text-(--text-untyped) uppercase">TIME</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-(--text-correct) crt-glow">{elapsedSeconds.toFixed(1)}s</p>
          </div>
        </div>

        {/* Detailed Character Stats */}
        <div className="flex items-center justify-between bg-(--bg-main) border border-(--border-accent) rounded p-3 text-xs text-(--text-untyped)">
          <span>CHARACTERS:</span>
          <span className="font-bold text-(--text-correct)">
            <span className="text-(--text-correct)">{charStats.correct}</span> /{" "}
            <span className="text-(--text-error)">{charStats.incorrect}</span> /{" "}
            <span className="text-(--text-error)/70">{charStats.extra}</span>
          </span>
          <span>(CORRECT / INCORRECT / EXTRA)</span>
        </div>

        {/* SVG Speed Polyline Graph Component */}
        <WpmPolylineGraph data={historyData} />

        {/* Physical QWERTY Keyboard Heatmap Component */}
        <QwertyHeatmap keyErrorMap={keyErrorMap} />

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-(--border-accent) pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded text-xs text-(--text-untyped) hover:text-(--text-correct) transition-colors"
          >
            DISMISS
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="px-4 py-2 bg-(--border-accent) hover:bg-(--text-correct)/20 border border-(--text-correct) text-(--text-correct) font-bold rounded text-xs crt-glow transition-all"
          >
            RETRY TEST (Tab + Enter)_
          </button>
        </div>
      </div>
    </div>
  );
};

function computeCharacterBreakdown(matrix: WordMatrixState[]) {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;

  for (const word of matrix) {
    for (const charObj of word.characters) {
      if (charObj.status === "correct") correct++;
      else if (charObj.status === "incorrect") incorrect++;
      else if (charObj.status === "extra") extra++;
    }
  }

  return { correct, incorrect, extra };
}
