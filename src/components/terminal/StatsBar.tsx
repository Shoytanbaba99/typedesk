import React from "react";

interface StatsBarProps {
  wpm: number;
  accuracy: number;
  remainingSeconds: number;
  isTestStarted: boolean;
}

/**
 * StatsBar
 * RobCo CRT Terminal live metrics display bar.
 * Displays real-time WPM, Accuracy %, and High-Precision Time readout.
 */
export const StatsBar: React.FC<StatsBarProps> = React.memo(
  ({ wpm, accuracy, remainingSeconds, isTestStarted }) => {
    return (
      <div className="flex items-center justify-between px-4 py-2 my-2 border-y border-(--border-accent)/40 font-mono text-sm sm:text-base select-none">
        {/* WPM Readout */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-(--text-untyped)">WPM:</span>
          <span className="font-bold text-(--text-correct) crt-glow text-base sm:text-lg">
            {isTestStarted ? wpm : "--"}
          </span>
        </div>

        {/* ACCURACY Readout */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-(--text-untyped)">ACC:</span>
          <span className="font-bold text-(--text-correct) crt-glow text-base sm:text-lg">
            {isTestStarted ? `${accuracy.toFixed(1)}%` : "100%"}
          </span>
        </div>

        {/* TIME Readout */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-(--text-untyped)">TIME:</span>
          <span className="font-bold text-(--text-correct) crt-glow text-base sm:text-lg">
            {remainingSeconds.toFixed(1)}s
          </span>
        </div>
      </div>
    );
  }
);

StatsBar.displayName = "StatsBar";
