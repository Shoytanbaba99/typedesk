import React from "react";

export type KeyErrorMap = Record<string, number>;

interface QwertyHeatmapProps {
  keyErrorMap: KeyErrorMap;
}

const QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

/**
 * QwertyHeatmap
 * Physical QWERTY keyboard error heatmap component.
 * Shades keys according to relative error frequency in crimson phosphor intensity.
 */
export const QwertyHeatmap: React.FC<QwertyHeatmapProps> = ({ keyErrorMap }) => {
  const maxErrors = Math.max(...Object.values(keyErrorMap), 1);
  const totalErrors = Object.values(keyErrorMap).reduce((a, b) => a + b, 0);

  return (
    <div className="font-mono select-none w-full">
      <div className="flex items-center justify-between text-xs text-(--text-untyped) mb-2">
        <span className="font-bold text-(--text-correct) crt-glow">[QWERTY KEY ERROR HEATMAP]</span>
        <span>TOTAL MISTAKES: <strong className="text-(--text-error)">{totalErrors}</strong></span>
      </div>

      <div className="flex flex-col gap-1.5 items-center bg-(--bg-main) p-3 rounded-lg border border-(--border-accent)">
        {QWERTY_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((key) => {
              const lowerKey = key.toLowerCase();
              const errorCount = keyErrorMap[lowerKey] || 0;
              const intensity = errorCount > 0 ? errorCount / maxErrors : 0;

              return (
                <div
                  key={key}
                  className={`
                    relative flex flex-col items-center justify-center
                    w-7 h-8 sm:w-9 sm:h-10 rounded text-xs font-bold transition-all duration-200
                    border border-(--border-accent)
                  `}
                  style={{
                    backgroundColor:
                      intensity > 0
                        ? `rgba(255, 42, 75, ${0.15 + intensity * 0.55})`
                        : "var(--bg-panel)",
                    borderColor:
                      intensity > 0
                        ? `rgba(255, 42, 75, ${0.4 + intensity * 0.6})`
                        : "var(--border-accent)",
                    color: intensity > 0 ? "#ffffff" : "var(--text-untyped)",
                    boxShadow: intensity > 0 ? "0 0 8px rgba(255, 42, 75, 0.4)" : "none",
                  }}
                  title={errorCount > 0 ? `${key}: ${errorCount} mistake(s)` : `${key}: 0 mistakes`}
                >
                  <span>{key}</span>
                  {errorCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-(--text-error) text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-extrabold shadow">
                      {errorCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
