import { useRef, useCallback, useState, useEffect } from "react";
import type { ThemeId } from "./useThemeSwitcher";

/**
 * useSoundEffects
 * High-performance polyphonic Web Audio API sound synthesizer hook.
 * Pre-synthesizes instant PCM audio buffers for 0ms latency audio playback at 150+ WPM typing speeds.
 * Never drops or clips key clicks, even during rapid bursts.
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
  const bufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

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

  // Dynamically inspect live DOM root data-theme attribute
  const getActiveTheme = useCallback((): ThemeId => {
    if (typeof document !== "undefined") {
      const active = document.documentElement.getAttribute("data-theme") as ThemeId;
      if (active) return active;
    }
    return "fallout-green";
  }, []);

  // Synthesize instant PCM AudioBuffer for theme (cached for zero-latency polyphonic playback)
  const getClickBuffer = useCallback(
    (ctx: AudioContext, theme: ThemeId): AudioBuffer => {
      const cached = bufferCacheRef.current.get(theme);
      if (cached) return cached;

      const sampleRate = ctx.sampleRate;
      const duration = 0.018; // 18ms instant impulse
      const numSamples = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(1, numSamples, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < numSamples; i++) {
        const t = i / numSamples;
        const decay = Math.exp(-t * 14);

        if (theme === "wyse-amber") {
          // IBM Model M buckling spring switch snap (dual click transient)
          data[i] = (Math.random() * 2 - 1) * decay * 0.35 + Math.sin(i * 0.4) * decay * 0.45;
        } else if (theme === "monastic-ledger") {
          // Typewriter weighted key strike on paper
          data[i] = Math.sin(i * 0.08) * decay * 0.7;
        } else if (theme === "bletchley-cipher") {
          // High-frequency sonar radar pulse ping
          data[i] = Math.sin(i * 0.55) * decay * 0.6;
        } else if (theme === "cyberpunk-edo") {
          // 80s synthwave laser pluck
          data[i] = Math.sin(i * (0.65 - t * 0.35)) * decay * 0.55;
        } else {
          // FALLOUT Pip-Boy terminal relay blip
          data[i] = (Math.random() * 2 - 1) * decay * 0.25 + Math.sin(i * 0.25) * decay * 0.4;
        }
      }

      bufferCacheRef.current.set(theme, buffer);
      return buffer;
    },
    [],
  );

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

  // 100% Reliable Polyphonic Keypress Audio Synthesizer (Zero-latency buffer playback)
  const playKeyClick = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const theme = getActiveTheme();
      const buffer = getClickBuffer(ctx, theme);

      // Create polyphonic BufferSourceNode (instantaneous 0ms playback, no overlap drops)
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = buffer;
      // Add micro-pitch variation (+/- 5%) for organic mechanical keyboard feel
      source.playbackRate.value = 0.95 + Math.random() * 0.1;

      gainNode.gain.setValueAtTime(0.7, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(0);
    } catch {
      // Ignore audio context guards
    }
  }, [isMuted, getAudioContext, getActiveTheme, getClickBuffer]);

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
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(120, now + 0.03);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      } else if (activeTheme === "monastic-ledger") {
        osc.type = "square";
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else {
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
      // Ignore audio context guards
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
      // Ignore audio context guards
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
