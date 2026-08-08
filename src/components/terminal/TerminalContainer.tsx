import React from "react";

interface TerminalContainerProps {
  children: React.ReactNode;
}

/**
 * TerminalContainer
 * Recessed RobCo CRT monitor chassis with fluid 1080p/1440p/4K scaling.
 */
export const TerminalContainer: React.FC<TerminalContainerProps> = ({ children }) => {
  return (
    <div className="relative w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto p-2 sm:p-6 md:p-8">
      {/* Outer Chassis Frame */}
      <div
        className="relative overflow-hidden rounded-xl border-2 border-(--border-accent) bg-(--bg-panel)
  shadow-2xl transition-colors duration-200"
        style={{
          boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.8), 0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* CRT Scanlines Background Layer */}
        <div
          className="absolute inset-0 crt-scanlines opacity-40 z-0 pointer-events-none"
          aria-hidden={true}
        />

        {/* CRT Glass Vignette Background Layer */}
        <div className="absolute inset-0 crt-vignette z-0 pointer-events-none" aria-hidden={true} />

        {/* Foreground Content Layer with Accessible Live Region */}
        <div
          className="relative z-10 p-4 sm:p-8 md:p-10 font-mono text-(--text-correct)"
          role="status"
          aria-live="polite"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
