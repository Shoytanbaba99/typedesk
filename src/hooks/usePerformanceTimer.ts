import { useState, useRef, useCallback, useEffect } from "react";

interface UsePerformanceTimerOptions {
  duration?: number; // Target test duration in seconds (0 = infinite / word mode)
  onExpire?: () => void; // Callback when timer hits target duration
}

/**
 * usePerformanceTimer
 * High-precision monotonic timer (performance.now()) fully compliant with React 19 Strict Rules.
 * Mutates refs strictly inside useEffect, keeping render passes 100% pure.
 */
export function usePerformanceTimer({ duration = 0, onExpire }: UsePerformanceTimerOptions = {}) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // High-precision timing refs
  const startTimeRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const tickRef = useRef<() => void>(() => {});
  const onExpireRef = useRef(onExpire);
  const durationRef = useRef(duration);

  // Keep value refs fresh inside useEffect (React 19 Compliant)
  useEffect(() => {
    onExpireRef.current = onExpire;
    durationRef.current = duration;
  }, [onExpire, duration]);

  // Pause timer function (defined first so tickRef effect can depend on it)
  const pauseTimer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (startTimeRef.current !== null) {
      const currentRunSeconds = (performance.now() - startTimeRef.current) / 1000;
      accumulatedTimeRef.current += currentRunSeconds;
      startTimeRef.current = null;
    }
    lastFrameTimeRef.current = null;

    setIsPaused(true);
  }, []);

  // Mutate tickRef inside useEffect (React 19 Pure Render Rule Compliant)
  useEffect(() => {
    tickRef.current = () => {
      if (startTimeRef.current === null) return;

      const now = performance.now();

      // OS Sleep Guard: If frame delta > 2s, force pause
      if (lastFrameTimeRef.current !== null && now - lastFrameTimeRef.current > 2000) {
        pauseTimer();
        return;
      }
      lastFrameTimeRef.current = now;

      const currentRunSeconds = (now - startTimeRef.current) / 1000;
      const totalElapsed = accumulatedTimeRef.current + currentRunSeconds;

      setElapsedSeconds(totalElapsed);

      const targetDuration = durationRef.current;
      if (targetDuration > 0 && totalElapsed >= targetDuration) {
        setElapsedSeconds(targetDuration);
        setIsRunning(false);
        setIsPaused(false);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (onExpireRef.current) onExpireRef.current();
        return;
      }

      animFrameRef.current = requestAnimationFrame(() => tickRef.current());
    };
  }, [pauseTimer]);

  // Consolidated run launcher
  const beginRun = useCallback(() => {
    const now = performance.now();
    startTimeRef.current = now;
    lastFrameTimeRef.current = now;
    animFrameRef.current = requestAnimationFrame(() => tickRef.current());
  }, []);

  // Start timer on first keystroke
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    beginRun();
  }, [beginRun]);

  // Resume timer from paused state
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    beginRun();
  }, [beginRun]);

  // Reset timer completely
  const resetTimer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    startTimeRef.current = null;
    lastFrameTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  // Automatic Pause-on-Blur via visibilitychange & window.blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isPaused) {
        pauseTimer();
      }
    };

    const handleWindowBlur = () => {
      if (isRunning && !isPaused) {
        pauseTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isRunning, isPaused, pauseTimer]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return {
    elapsedSeconds,
    remainingSeconds: duration > 0 ? Math.max(0, duration - elapsedSeconds) : elapsedSeconds,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
}
