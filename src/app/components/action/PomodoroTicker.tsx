"use client";

import { useEffect, useRef, useCallback } from "react";
import { useActionStore, type PomodoroMode } from "@/app/stores/actionStore";

const DEFAULT_SECONDS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

/**
 * Invisible component that keeps the Pomodoro interval running
 * regardless of which page is active. Mount once in the dashboard layout.
 */
export default function PomodoroTicker() {
  const {
    pomodoroMode: mode,
    pomodoroRemaining: remaining,
    pomodoroCount: count,
    pomodoroRunning: running,
    setPomodoroMode,
    setPomodoroRemaining,
    setPomodoroTotal,
    setPomodoroCount,
    setPomodoroRunning,
  } = useActionStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef      = useRef(mode);
  const countRef     = useRef(count);
  const remainingRef = useRef(remaining);
  modeRef.current      = mode;
  countRef.current     = count;
  remainingRef.current = remaining;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advance = useCallback(
    (currentMode: PomodoroMode, currentCount: number) => {
      if (currentMode === "work") {
        const newCount = currentCount + 1;
        setPomodoroCount(newCount);
        const nextMode: PomodoroMode = newCount % 4 === 0 ? "long" : "short";
        const secs = DEFAULT_SECONDS[nextMode];
        setPomodoroMode(nextMode);
        setPomodoroTotal(secs);
        setPomodoroRemaining(secs);
        setPomodoroRunning(true);
      } else {
        const secs = DEFAULT_SECONDS.work;
        setPomodoroMode("work");
        setPomodoroTotal(secs);
        setPomodoroRemaining(secs);
        setPomodoroRunning(true);
      }
    },
    [setPomodoroCount, setPomodoroMode, setPomodoroRemaining, setPomodoroRunning, setPomodoroTotal]
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const next = remainingRef.current - 1;
        if (next <= 0) {
          clearTimer();
          setPomodoroRemaining(0);
          setPomodoroRunning(false);
          setTimeout(() => advance(modeRef.current, countRef.current), 0);
        } else {
          setPomodoroRemaining(next);
        }
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [running, clearTimer, setPomodoroRemaining, setPomodoroRunning, advance]);

  return null;
}
