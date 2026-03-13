import { create } from "zustand";

// ─── List UI State ─────────────────────────────────────────────────────────────
// Zustand manages LOCAL / UI state only.
// Server data (the actual list records) lives in TanStack Query — see hooks/useLists.ts.

type ListStore = {
  // Which list is currently focused / expanded
  selectedListId: string | null;

  // Whether the "create new list" form is open
  isCreatingList: boolean;

  // Id of the list currently being edited (null = none)
  editingListId: string | null;

  // Actions
  setSelectedListId: (id: string | null) => void;
  setIsCreatingList: (open: boolean) => void;
  setEditingListId: (id: string | null) => void;
};

export const useListStore = create<ListStore>((set) => ({
  selectedListId: null,
  isCreatingList: false,
  editingListId: null,

  setSelectedListId: (id) => set({ selectedListId: id }),
  setIsCreatingList: (open) => set({ isCreatingList: open }),
  setEditingListId: (id) => set({ editingListId: id }),
}));
