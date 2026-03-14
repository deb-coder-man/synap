"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask } from "@/app/hooks/useTasks";
import type { Priority } from "@/lib/types";

type Props = {
  listId: string;
  listName: string;
  open: boolean;
  onClose: () => void;
};

const PRIORITIES: { value: Priority; label: string; bg: string }[] = [
  { value: "LOW",    label: "Low",    bg: "bg-priority-low"    },
  { value: "MEDIUM", label: "Medium", bg: "bg-priority-medium" },
  { value: "HIGH",   label: "High",   bg: "bg-priority-high"   },
];

export default function CreateTaskModal({ listId, listName, open, onClose }: Props) {
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [priority, setPriority]     = useState<Priority>("LOW");
  const [dueDate, setDueDate]       = useState("");
  const [estHours, setEstHours]     = useState("");

  const { mutate: createTask, isPending } = useCreateTask();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createTask(
      {
        listId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        estimatedHours: estHours ? parseFloat(estHours) : undefined,
      },
      {
        onSuccess: () => {
          setTitle(""); setDesc(""); setPriority("LOW"); setDueDate(""); setEstHours("");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-[600px] rounded-xl border-none bg-background p-0 shadow-2xl">
        <DialogTitle className="sr-only">Add a task to {listName}</DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-foreground/10 px-8 py-5">
            <span className="font-[family-name:var(--font-delius)] text-2xl font-bold text-foreground">
              {listName}
            </span>
            <button type="button" onClick={onClose} className="text-foreground/60 hover:text-foreground">
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col gap-6 px-8 py-6">
            {/* Title input */}
            <Input
              autoFocus
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-0 border-b border-foreground/20 rounded-none bg-transparent px-0 font-[family-name:var(--font-delius)] text-4xl text-foreground placeholder:text-foreground/30 focus-visible:ring-0 focus-visible:border-foreground/60"
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
              disabled={!title.trim() || isPending}
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
