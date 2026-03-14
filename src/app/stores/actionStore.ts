import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PomodoroMode = "work" | "short" | "long";

type ActionStore = {
  // ─── Task list ────────────────────────────────────────────────────────────
  orderedTaskIds: string[];
  skippedIds: string[];
  generated: boolean;
  hours: number;
  deepWork: boolean;

  setOrderedTaskIds: (ids: string[]) => void;
  removeTaskId: (id: string) => void;
  reorderTaskIds: (ids: string[]) => void;
  addSkippedId: (id: string) => void;
  setGenerated: (v: boolean) => void;
  setHours: (h: number) => void;
  setDeepWork: (d: boolean) => void;

  // ─── Pomodoro ─────────────────────────────────────────────────────────────
  pomodoroMode: PomodoroMode;
  pomodoroRemaining: number; // seconds
  pomodoroTotal: number;     // seconds (for the ring progress)
  pomodoroCount: number;     // total focus sessions completed (ever)
  pomodoroRunning: boolean;  // NOT persisted — always restore as paused

  setPomodoroMode: (m: PomodoroMode) => void;
  setPomodoroRemaining: (s: number) => void;
  setPomodoroTotal: (s: number) => void;
  setPomodoroCount: (n: number) => void;
  setPomodoroRunning: (r: boolean) => void;
};

export const useActionStore = create<ActionStore>()(
  persist(
    (set) => ({
      // ─── Task list defaults ──────────────────────────────────────────────
      orderedTaskIds: [],
      skippedIds: [],
      generated: false,
      hours: 2,
      deepWork: false,

      setOrderedTaskIds: (ids) => set({ orderedTaskIds: ids }),
      removeTaskId: (id) =>
        set((s) => ({ orderedTaskIds: s.orderedTaskIds.filter((i) => i !== id) })),
      reorderTaskIds: (ids) => set({ orderedTaskIds: ids }),
      addSkippedId: (id) =>
        set((s) => ({ skippedIds: [...s.skippedIds, id] })),
      setGenerated: (v) => set({ generated: v }),
      setHours: (h) => set({ hours: h }),
      setDeepWork: (d) => set({ deepWork: d }),

      // ─── Pomodoro defaults ───────────────────────────────────────────────
      pomodoroMode: "work",
      pomodoroRemaining: 25 * 60,
      pomodoroTotal: 25 * 60,
      pomodoroCount: 0,
      pomodoroRunning: false,

      setPomodoroMode: (m) => set({ pomodoroMode: m }),
      setPomodoroRemaining: (s) => set({ pomodoroRemaining: s }),
      setPomodoroTotal: (s) => set({ pomodoroTotal: s }),
      setPomodoroCount: (n) => set({ pomodoroCount: n }),
      setPomodoroRunning: (r) => set({ pomodoroRunning: r }),
    }),
    {
      name: "synap-action",
      // Don't persist running state — always resume paused
      partialize: (s) => ({
        orderedTaskIds: s.orderedTaskIds,
        skippedIds: s.skippedIds,
        generated: s.generated,
        hours: s.hours,
        deepWork: s.deepWork,
        pomodoroMode: s.pomodoroMode,
        // pomodoroRemaining intentionally excluded — writing every second causes 1500+ localStorage writes per session
        pomodoroTotal: s.pomodoroTotal,
        pomodoroCount: s.pomodoroCount,
      }),
    }
  )
);
