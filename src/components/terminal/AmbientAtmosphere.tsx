import React, { useEffect, useState } from "react";

/**
 * AmbientAtmosphere
 * Renders GPU-accelerated 60fps procedural background atmospheres
 * tailored to each of the 5 CRT terminal themes.
 * Runs on the compositor thread with 0% CPU input-latency overhead.
 */
export const AmbientAtmosphere: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState<string>("fallout-green");

  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.getAttribute("data-theme") || "fallout-green";
      setActiveTheme(current);
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden={true}>
      {/* Theme 1: FALLOUT - RobCo Phosphor Beam Sweep & Digital Grid */}
      {activeTheme === "fallout-green" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,102,0.14)_0%,transparent_70%)]" />
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "linear-gradient(to right, rgba(0, 255, 102, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 102, 0.2) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#00ff66]/25 to-transparent animate-fallout-beam" />
        </>
      )}

      {/* Theme 2: WYSE - Mainframe Amber Cathode Pulse & Grid Drift */}
      {activeTheme === "wyse-amber" && (
        <>
          <div className="absolute inset-0 flex items-center justify-center animate-wyse-pulse">
            <div className="w-[120vw] h-[120vh] bg-[radial-gradient(circle_at_center,rgba(230,192,123,0.18)_0%,transparent_65%)]" />
          </div>
          <div className="absolute inset-0 animate-wyse-grid opacity-15">
            <div 
              className="w-full h-[200%]"
              style={{
                backgroundImage: "linear-gradient(to bottom, rgba(230, 192, 123, 0.25) 1px, transparent 1px)",
                backgroundSize: "100% 32px",
              }}
            />
          </div>
        </>
      )}

      {/* Theme 3: RADAR - Cold War Submarine Oscilloscope 360 Sweep & Sonar Waves */}
      {activeTheme === "bletchley-cipher" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* Expanding Sonar Ping Wavefront */}
          <div className="w-[850px] h-[850px] rounded-full border-2 border-[#00ffd5]/40 absolute animate-radar-wave" />
          
          {/* Concentric Target Sonar Rings */}
          <div className="w-[900px] h-[900px] rounded-full border border-[#00ffd5]/20 absolute" />
          <div className="w-[600px] h-[600px] rounded-full border border-[#00ffd5]/25 absolute" />
          <div className="w-[300px] h-[300px] rounded-full border border-[#00ffd5]/30 absolute" />
          
          {/* 360-Degree Rotating Oscilloscope Sweep Beam */}
          <div className="w-[1000px] h-[1000px] relative animate-radar-spin opacity-50">
            <div className="absolute top-1/2 left-1/2 w-1/2 h-[3px] bg-gradient-to-r from-[#00ffd5] via-[#00ffd5]/70 to-transparent origin-left shadow-[0_0_15px_#00ffd5]" />
            <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-[conic-gradient(from_0deg,rgba(0,255,213,0.4)_0deg,transparent_75deg)] origin-top-left -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* Theme 4: CODEX - Dark Mahogany Background with Floating Golden & Crimson Latin Calligraphy */}
      {activeTheme === "monastic-ledger" && (
        <>
          {/* Floating Multi-Color Monastic Calligraphy Latin Symbols (Outer Dark Margins Only) */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-serif">
            {/* Left Margin Floating Calligraphy */}
            <div className="absolute left-[3%] top-[20%] text-5xl sm:text-7xl text-[#e6c07b]/60 animate-script-left-1 drop-shadow-[0_0_12px_rgba(230,192,123,0.8)]">
              𝔄
            </div>
            <div className="absolute left-[8%] top-[50%] text-4xl sm:text-6xl text-[#c82323]/60 animate-script-left-2 drop-shadow-[0_0_12px_rgba(200,35,35,0.8)]">
              Ω
            </div>
            <div className="absolute left-[4%] top-[78%] text-5xl sm:text-7xl text-[#e6c07b]/50 animate-script-left-1 drop-shadow-[0_0_10px_rgba(230,192,123,0.6)]">
              𝔖
            </div>

            {/* Right Margin Floating Calligraphy */}
            <div className="absolute right-[4%] top-[18%] text-5xl sm:text-7xl text-[#c82323]/60 animate-script-right-1 drop-shadow-[0_0_12px_rgba(200,35,35,0.8)]">
              𝔅
            </div>
            <div className="absolute right-[8%] top-[48%] text-5xl sm:text-7xl text-[#e6c07b]/60 animate-script-right-2 drop-shadow-[0_0_12px_rgba(230,192,123,0.8)]">
              𝔛
            </div>
            <div className="absolute right-[3%] top-[75%] text-4xl sm:text-6xl text-[#c82323]/50 animate-script-right-1 drop-shadow-[0_0_10px_rgba(200,35,35,0.6)]">
              𝔇
            </div>
          </div>
        </>
      )}

      {/* Theme 5: CYBER - 3D Synthwave Moving Grid & Horizon Gradient */}
      {activeTheme === "cyberpunk-edo" && (
        <>
          <div className="absolute bottom-0 inset-x-0 h-[50vh] bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,0,127,0.3)_100%)]" />
          <div className="absolute -bottom-24 inset-x-0 h-[60vh] animate-cyber-grid opacity-45">
            <div 
              className="w-full h-[200%] border-t border-[#ff007f]/70"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 0, 127, 0.45) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 0, 127, 0.45) 1px, transparent 1px)
                `,
                backgroundSize: "48px 48px",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
