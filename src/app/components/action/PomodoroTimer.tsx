"use client";

import { useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { useActionStore, type PomodoroMode } from "@/app/stores/actionStore";

const DEFAULT_SECONDS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_LABELS: Record<PomodoroMode, string> = {
  work: "Focus",
  short: "Short Break",
  long: "Long Break",
};

export default function PomodoroTimer() {
  const {
    pomodoroMode: mode,
    pomodoroRemaining: remaining,
    pomodoroTotal: total,
    pomodoroCount: count,
    pomodoroRunning: running,
    setPomodoroMode,
    setPomodoroRemaining,
    setPomodoroTotal,
    setPomodoroRunning,
  } = useActionStore();

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function switchMode(m: PomodoroMode) {
    setPomodoroRunning(false);
    setPomodoroMode(m);
    const secs = DEFAULT_SECONDS[m];
    setPomodoroTotal(secs);
    setPomodoroRemaining(secs);
  }

  function handleReset() {
    setPomodoroRunning(false);
    setPomodoroRemaining(total);
  }

  function handleSkip() {
    // Delegate to the ticker's advance logic by resetting to 0 and letting ticker handle it
    setPomodoroRemaining(0);
  }

  function handleTimeClick() {
    if (running) return;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    setEditValue(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function handleTimeBlur() {
    const match = editValue.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const secs = parseInt(match[1]) * 60 + parseInt(match[2]);
      if (secs > 0) {
        setPomodoroTotal(secs);
        setPomodoroRemaining(secs);
      }
    }
    setEditing(false);
  }

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const progress = total > 0 ? remaining / total : 1;

  // SVG ring
  const R = 90;
  const C = 2 * Math.PI * R;
  const dash = C * progress;

  // 4-circle progress indicator (position within current cycle of 4)
  const cyclePosition = count % 4;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Mode tabs */}
      <div className="flex gap-1 rounded-xl bg-foreground/5 p-1">
        {(["work", "short", "long"] as PomodoroMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-lg px-3 py-1.5 font-[family-name:var(--font-delius)] text-sm transition-colors ${
              mode === m
                ? "bg-foreground text-background"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Ring + time */}
      <div className="relative flex items-center justify-center">
        <svg width="220" height="220" className="-rotate-90">
          <circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-foreground/10"
          />
          <circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className="text-foreground transition-all duration-1000"
          />
        </svg>

        {/* Time display */}
        <div className="absolute flex flex-col items-center gap-1">
          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleTimeBlur}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.blur()}
              className="w-32 bg-transparent text-center font-[family-name:var(--font-delius)] text-4xl text-foreground outline-none"
            />
          ) : (
            <button
              onClick={handleTimeClick}
              disabled={running}
              className="font-[family-name:var(--font-delius)] text-4xl text-foreground disabled:cursor-default"
            >
              {minutes}:{seconds}
            </button>
          )}
          <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/40">
            {MODE_LABELS[mode]}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={() => setPomodoroRunning(!running)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-opacity hover:opacity-80"
        >
          {running ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
        </button>

        <button
          onClick={handleSkip}
          className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Focus session dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < cyclePosition
                ? "bg-foreground"
                : mode === "work" && i === cyclePosition
                ? "bg-foreground/40"
                : "bg-foreground/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
