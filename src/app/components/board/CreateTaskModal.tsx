"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask } from "@/app/hooks/useTasks";
import type { Priority } from "@/lib/types";

type ListOption = { id: string; name: string; colour: string };

// Called from a list column: pass listId + listName (fixed)
// Called from list view: pass lists array (user picks)
type Props =
  | { listId: string; listName: string; lists?: never; open: boolean; onClose: () => void }
  | { listId?: never; listName?: never; lists: ListOption[]; open: boolean; onClose: () => void };

const PRIORITIES: { value: Priority; label: string; bg: string }[] = [
  { value: "LOW",    label: "Low",    bg: "bg-priority-low"    },
  { value: "MEDIUM", label: "Medium", bg: "bg-priority-medium" },
  { value: "HIGH",   label: "High",   bg: "bg-priority-high"   },
];

export default function CreateTaskModal({ listId, listName, lists, open, onClose }: Props) {
  const [title, setTitle]               = useState("");
  const [description, setDesc]          = useState("");
  const [priority, setPriority]         = useState<Priority>("LOW");
  const [dueDate, setDueDate]           = useState("");
  const [estHours, setEstHours]         = useState("");
  const [selectedListId, setSelectedListId] = useState<string>("");

  const { mutate: createTask, isPending } = useCreateTask();

  // Resolve the effective listId and name
  const effectiveListId   = listId ?? selectedListId ?? (lists?.[0]?.id ?? "");
  const effectiveListName = listName ?? lists?.find((l) => l.id === effectiveListId)?.name ?? "";
  const selectedListColour = lists?.find((l) => l.id === effectiveListId)?.colour;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !effectiveListId) return;

    createTask(
      {
        listId: effectiveListId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        estimatedHours: estHours ? parseFloat(estHours) : undefined,
      },
      {
        onSuccess: () => {
          setTitle(""); setDesc(""); setPriority("LOW"); setDueDate(""); setEstHours(""); setSelectedListId("");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent showCloseButton={false} className="w-full sm:max-w-[860px] max-h-[90vh] rounded-xl border-none bg-background p-0 shadow-2xl overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Add a task to {listName}</DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0 overflow-hidden flex-1 min-h-0">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-foreground/10 px-4 py-4 sm:px-8 sm:py-5">
            {lists ? (
              /* List selector — shown when opened from list view */
              <div className="relative flex items-center gap-2">
                {selectedListColour && (
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: selectedListColour }}
                  />
                )}
                <select
                  value={effectiveListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  required
                  className="cursor-pointer appearance-none bg-transparent font-[family-name:var(--font-delius)] text-xl font-bold text-foreground outline-none sm:text-2xl"
                >
                  <option value="" disabled>
                    Choose group…
                  </option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none shrink-0 text-foreground/40" />
              </div>
            ) : (
              <span className="font-[family-name:var(--font-delius)] text-xl font-bold text-foreground sm:text-2xl">
                {effectiveListName}
              </span>
            )}
            <button type="button" onClick={onClose} className="text-foreground/60 hover:text-foreground">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:gap-6 sm:px-8 sm:py-6">
            {/* Title input */}
            <Input
              autoFocus
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-0 border-b border-foreground/20 rounded-none bg-transparent px-0 font-[family-name:var(--font-delius)] text-2xl text-foreground placeholder:text-foreground/30 focus-visible:ring-0 focus-visible:border-foreground/60 sm:text-4xl"
            />

            {/* Priority selector */}
            <div className="flex gap-3">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex h-[54px] flex-1 items-center justify-center rounded-[7px] font-[family-name:var(--font-delius)] text-xl transition-opacity ${p.bg} ${
                    priority === p.value ? "opacity-100 ring-2 ring-foreground/40" : "opacity-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Date + hours row */}
            <div className="flex gap-6">
              <div className="flex flex-1 flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/60">
                  Due date
                </label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border-0 border-b border-foreground/20 rounded-none bg-transparent px-0 font-[family-name:var(--font-delius)] text-foreground focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/60">
                  Estimated hours
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 2"
                  value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                  className="border-0 border-b border-foreground/20 rounded-none bg-transparent px-0 font-[family-name:var(--font-delius)] text-foreground placeholder:text-foreground/30 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-foreground/15" />

            {/* Description */}
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="resize-none border border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground placeholder:text-foreground/30 focus-visible:ring-foreground/30"
            />

            {/* Save button */}
            <button
              type="submit"
              disabled={!title.trim() || !effectiveListId || isPending}
              className="ml-auto rounded-lg bg-foreground px-6 py-2 font-[family-name:var(--font-delius)] text-background hover:opacity-90 disabled:opacity-40"
            >
              {isPending ? "Adding…" : "Add task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
