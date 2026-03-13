import { create } from "zustand";
import type { UpdateSettingsInput } from "@/lib/types";

// ─── Settings UI State ─────────────────────────────────────────────────────────
// Holds in-progress edits before the user saves them to the server.

type SettingsStore = {
  // Unsaved changes accumulated in the settings panel
  pendingChanges: UpdateSettingsInput;

  // Whether the settings panel is open
  isPanelOpen: boolean;

  // Actions
  setPendingChange: (change: UpdateSettingsInput) => void;
  resetPendingChanges: () => void;
  setIsPanelOpen: (open: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  pendingChanges: {},
  isPanelOpen: false,

  // Merge a partial change into the pending set
  setPendingChange: (change) =>
    set((state) => ({
      pendingChanges: { ...state.pendingChanges, ...change },
    })),

  resetPendingChanges: () => set({ pendingChanges: {} }),
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
}));
