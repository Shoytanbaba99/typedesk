import React from "react";
import { ThemeSwitcher } from "../settings/ThemeSwitcher";

/**
 * TerminalHeader
 * RobCo CRT Terminal header bar using explicit VT323 display font and aria-hidden={true}.
 */
export const TerminalHeader: React.FC = () => {
  return (
    <header
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b
  border-(--border-accent)"
    >
      <div className="flex items-center gap-3">
        <span
          className="w-2.5 h-2.5 rounded-full bg-(--text-correct) animate-pulse crt-glow"
          aria-
          hidden={true}
        />
        <h1
          className="font-vt323 text-2xl sm:text-3xl font-bold tracking-wider text-(--text-correct) crt-
  glow"
        >
          ROBCO TERMINAL{" "}
          <span
            className="font-jetbrains text-xs text-(--text-untyped) font-normal 
  tracking-normal"
          >
            [v4.0.1]
          </span>
        </h1>
      </div>

      <ThemeSwitcher />
    </header>
  );
};
