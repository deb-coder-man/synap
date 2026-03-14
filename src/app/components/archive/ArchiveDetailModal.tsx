"use client";

import { useState } from "react";
import { ArchiveRestore, Trash2, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUpdateTask, useDeleteTask } from "@/app/hooks/useTasks";
import { useCreateList } from "@/app/hooks/useLists";
import type { Task, List, Priority } from "@/lib/types";

const PRIORITY_COLOURS: Record<Priority, string> = {
  LOW: "bg-priority-low",
  MEDIUM: "bg-priority-medium",
  HIGH: "bg-priority-high",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  task: Task | null;
  lists: List[];
  open: boolean;
  onClose: () => void;
};

export default function ArchiveDetailModal({ task, lists, open, onClose }: Props) {
  const { mutate: updateTask, isPending: isUnarchiving } = useUpdateTask();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
  const { mutate: createList } = useCreateList();

  // List reassignment state (when original list is gone)
  const [pickingList, setPickingList] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const [newListName, setNewListName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  // Bind to a non-nullable const so closures below are type-safe
  const t = task;
  const originalList = lists.find((l) => l.id === t.listId);

  function handleClose() {
    setPickingList(false);
    setSelectedListId("");
    setNewListName("");
    setConfirmDelete(false);
    onClose();
  }

  function handleUnarchive() {
    if (originalList) {
      // List still exists — restore directly
      updateTask(
        { id: t.id, data: { archived: false } },
        { onSuccess: handleClose }
      );
    } else {
      // List was deleted — need to pick/create one
      setPickingList(true);
      setSelectedListId(lists[0]?.id ?? "");
    }
  }

  function handleConfirmUnarchive() {
    if (!selectedListId && !newListName.trim()) return;

    if (newListName.trim()) {
      // Create a new list then move the task into it
      createList(
        { name: newListName.trim(), colour: "#e5e7eb" },
        {
          onSuccess: (newList) => {
            updateTask(
              { id: t.id, data: { archived: false, listId: newList.id } },
              { onSuccess: handleClose }
            );
          },
        }
      );
    } else {
      updateTask(
        { id: t.id, data: { archived: false, listId: selectedListId } },
        { onSuccess: handleClose }
      );
    }
  }

  function handleDelete() {
    deleteTask(t.id, { onSuccess: handleClose });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md overflow-hidden rounded-2xl border-none bg-background p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Archived task</DialogTitle>

        <div className="flex flex-col gap-5 px-7 py-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <p className="font-[family-name:var(--font-delius)] text-xs text-foreground/40">
              {originalList?.name ?? "Board deleted"}
            </p>
            <h2
              className={`font-[family-name:var(--font-delius)] text-xl text-foreground ${
                t.completed ? "line-through opacity-60" : ""
              }`}
            >
              {t.title}
            </h2>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority */}
            <span className="flex items-center gap-1.5 font-[family-name:var(--font-delius)] text-xs text-foreground/60">
              <span className={`h-2 w-2 rounded-full ${PRIORITY_COLOURS[t.priority]}`} />
              {PRIORITY_LABELS[t.priority]}
            </span>

            {t.dueDate && (
              <span className="flex items-center gap-1 font-[family-name:var(--font-delius)] text-xs text-foreground/60">
                <Clock size={11} />
                {formatDate(t.dueDate)}
              </span>
            )}

            {t.estimatedHours != null && (
              <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/60">
                {t.estimatedHours}h estimated
              </span>
            )}

            {t.completed && (
              <span className="rounded-full bg-foreground/8 px-2 py-0.5 font-[family-name:var(--font-delius)] text-[10px] text-foreground/50">
                Completed {formatDate(t.completedAt)}
              </span>
            )}
          </div>

          {/* Description */}
          {t.description && (
            <p className="font-[family-name:var(--font-delius)] text-sm text-foreground/60">
              {t.description}
            </p>
          )}

          {/* List picker (shown when original list is deleted) */}
          {pickingList && (
            <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-foreground/40" />
                <p className="font-[family-name:var(--font-delius)] text-xs text-foreground/60">
                  The original board no longer exists. Choose where to restore this task.
                </p>
              </div>

              {lists.length > 0 && (
                <select
                  value={selectedListId}
                  onChange={(e) => {
                    setSelectedListId(e.target.value);
                    setNewListName("");
                  }}
                  disabled={!!newListName.trim()}
                  className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none focus:border-foreground/40 disabled:opacity-40"
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-foreground/10" />
                <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/30">
                  or create new
                </span>
                <div className="h-px flex-1 bg-foreground/10" />
              </div>

              <input
                value={newListName}
                onChange={(e) => {
                  setNewListName(e.target.value);
                  if (e.target.value.trim()) setSelectedListId("");
                }}
                placeholder="New board name…"
                className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/40"
              />
            </div>
          )}

          {/* Delete confirmation */}
          {confirmDelete && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
              <p className="font-[family-name:var(--font-delius)] text-sm text-foreground/70">
                This will permanently delete the task. This cannot be undone.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Delete side */}
            <div className="flex gap-2">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-[family-name:var(--font-delius)] text-sm text-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg px-3 py-1.5 font-[family-name:var(--font-delius)] text-sm text-foreground/50 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-lg bg-red-500 px-3 py-1.5 font-[family-name:var(--font-delius)] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {isDeleting ? "Deleting…" : "Confirm delete"}
                  </button>
                </>
              )}
            </div>

            {/* Right side */}
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="rounded-lg px-3 py-1.5 font-[family-name:var(--font-delius)] text-sm text-foreground/50 hover:text-foreground"
              >
                Close
              </button>

              {!pickingList ? (
                <button
                  onClick={handleUnarchive}
                  disabled={isUnarchiving}
                  className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 font-[family-name:var(--font-delius)] text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  <ArchiveRestore size={14} />
                  {isUnarchiving ? "Restoring…" : "Unarchive"}
                </button>
              ) : (
                <button
                  onClick={handleConfirmUnarchive}
                  disabled={isUnarchiving || (!selectedListId && !newListName.trim())}
                  className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 font-[family-name:var(--font-delius)] text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  <ArchiveRestore size={14} />
                  {isUnarchiving ? "Restoring…" : "Restore here"}
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
