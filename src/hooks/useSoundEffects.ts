import { useRef, useCallback, useState, useEffect } from "react";
import type { ThemeId } from "./useThemeSwitcher";

/**
 * useSoundEffects
 * Pure Web Audio API sound synthesizer hook.
 * Dynamically checks document root data-theme attribute on every sound trigger,
 * ensuring instant real-time theme audio switching with 0 hard refreshes.
 *
 * Audio Profiles:
 * 1. FALLOUT: RobCo Pip-Boy terminal relay clicks & blips
 * 2. WYSE: IBM Model M buckling-spring mechanical switch
 * 3. RADAR: Cold War submarine sonar radar pulse ping
 * 4. CODEX: Heavy mechanical typewriter key strike & brass bell
 * 5. CYBER: Neo-Tokyo 80s synth-wave laser pluck & chord chime
 */
export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("typedesk-muted");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Lazy initialize AudioContext on user interaction
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Dynamically inspect live DOM root data-theme attribute (guarantees instant audio switching)
  const getActiveTheme = useCallback((): ThemeId => {
    if (typeof document !== "undefined") {
      const active = document.documentElement.getAttribute("data-theme") as ThemeId;
      if (active) return active;
    }
    return "fallout-green";
  }, []);

  // Save mute preference to localStorage
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("typedesk-muted", JSON.stringify(next));
      } catch {
        // Fallback for private browsing
      }
      return next;
    });
  }, []);

  // Theme-Specific Keypress Audio Synthesizer
  const playKeyClick = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const activeTheme = getActiveTheme();
      const now = ctx.currentTime;

      if (activeTheme === "monastic-ledger") {
        // CODEX: Heavy Mechanical Typewriter Key Strike on Paper (450Hz low snap)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(450 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
      } else if (activeTheme === "wyse-amber") {
        // WYSE: IBM Model M Buckling-Spring Switch (2200Hz snap + 600Hz spring thunk)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "square";
        osc1.frequency.setValueAtTime(2200, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.012);
        gain1.gain.setValueAtTime(0.09, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.012);
      } else if (activeTheme === "bletchley-cipher") {
        // RADAR: Cold War Sonar Radar Pulse Ping (2600Hz high-frequency blip)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(2600, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.018);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.018);
      } else if (activeTheme === "cyberpunk-edo") {
        // CYBER: Neo-Tokyo 80s Synthwave Pluck (1800Hz pitch-drop FM synth)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.02);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      } else {
        // FALLOUT (Default): RobCo Pip-Boy Terminal Cathode Relay Click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1300 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.015);
      }
    } catch {
      // Ignore audio context initialization guards
    }
  }, [isMuted, getAudioContext, getActiveTheme]);

  // Theme-Specific Error Audio Synthesizer
  const playErrorSound = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const activeTheme = getActiveTheme();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (activeTheme === "cyberpunk-edo") {
        // CYBER: Bit-crushed synth glitch
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(120, now + 0.03);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      } else if (activeTheme === "monastic-ledger") {
        // CODEX: Heavy typewriter ribbon jam thud
        osc.type = "square";
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else {
        // Default: Diagnostic error buzz
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore audio context initialization guards
    }
  }, [isMuted, getAudioContext, getActiveTheme]);

  // Theme-Specific Completion Bell / Chime Synthesizer
  const playCarriageBell = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const activeTheme = getActiveTheme();
      const now = ctx.currentTime;

      if (activeTheme === "monastic-ledger") {
        // CODEX: Authentic Typewriter Carriage Return Bell (1580Hz brass bell)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1580, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (activeTheme === "cyberpunk-edo") {
        // CYBER: Neo-Tokyo Retro Synthwave Chord Chime (Dual 880Hz + 1320Hz fifth chord)
        [880, 1320].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
        });
      } else {
        // Default: Retro terminal bell chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1480, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Ignore audio context initialization guards
    }
  }, [isMuted, getAudioContext, getActiveTheme]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    playKeyClick,
    playErrorSound,
    playCarriageBell,
  };
}
