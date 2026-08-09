import React from "react";
import { ThemeSwitcher } from "../settings/ThemeSwitcher";
import { Volume2, VolumeX } from "lucide-react";

interface TerminalHeaderProps {
  isMuted?: boolean;
  onToggleMute?: () => void;
}

/**
 * TerminalHeader
 * RobCo CRT Terminal header bar with theme switcher and Web Audio sound toggle.
 */
export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ isMuted = false, onToggleMute }) => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-(--border-accent)">
      <div className="flex items-center gap-3">
        <span
          className="w-2.5 h-2.5 rounded-full bg-(--text-correct) animate-pulse crt-glow"
          aria-hidden={true}
        />
        <h1 className="font-vt323 text-2xl sm:text-3xl font-bold tracking-wider text-(--text-correct) crt-glow">
          ROBCO TERMINAL{" "}
          <span className="font-jetbrains text-xs text-(--text-untyped) font-normal tracking-normal">
            [v4.0.1]
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-(--text-untyped) hover:text-(--text-correct) border border-(--border-accent) hover:border-(--text-correct) transition-all hover:crt-glow"
            title={isMuted ? "Unmute audio sound effects" : "Mute audio sound effects"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" aria-hidden={true} />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-(--text-correct)" aria-hidden={true} />
            )}
            <span className="hidden sm:inline">{isMuted ? "MUTED" : "SOUND"}</span>
          </button>
        )}
        <ThemeSwitcher />
      </div>
    </header>
  );
};
