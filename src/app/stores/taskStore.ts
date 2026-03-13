import { create } from "zustand";

// ─── Task UI State ─────────────────────────────────────────────────────────────

type TaskStore = {
  // Which task's detail panel is open
  selectedTaskId: string | null;

  // Whether the "create task" form is open, and which list it belongs to
  isCreatingTask: boolean;
  creatingInListId: string | null;

  // Filter toggles
  showArchived: boolean;
  showCompleted: boolean;

  // Actions
  setSelectedTaskId: (id: string | null) => void;
  openCreateTask: (listId: string) => void;
  closeCreateTask: () => void;
  // toggleShowArchived: () => void;
  // toggleShowCompleted: () => void;
};

export const useTaskStore = create<TaskStore>((set) => ({
  selectedTaskId: null,
  isCreatingTask: false,
  creatingInListId: null,
  showArchived: false,
  showCompleted: false,

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  openCreateTask: (listId) =>
    set({ isCreatingTask: true, creatingInListId: listId }),
  closeCreateTask: () =>
    set({ isCreatingTask: false, creatingInListId: null }),

  // toggleShowArchived: () => set((state) => ({ showArchived: !state.showArchived })),
  // toggleShowCompleted: () => set((state) => ({ showCompleted: !state.showCompleted })),
}));
