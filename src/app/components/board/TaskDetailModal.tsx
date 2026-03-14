"use client";

import { useState, useEffect } from "react";
import { X, Archive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTask } from "@/app/hooks/useTasks";
import type { Task, Priority } from "@/lib/types";

type Props = {
  task: Task | null;
  listName: string;
  open: boolean;
  onClose: () => void;
};

const PRIORITIES: { value: Priority; label: string; bg: string }[] = [
  { value: "LOW",    label: "Low",    bg: "bg-priority-low"    },
  { value: "MEDIUM", label: "Medium", bg: "bg-priority-medium" },
  { value: "HIGH",   label: "High",   bg: "bg-priority-high"   },
];

export default function TaskDetailModal({ task, listName, open, onClose }: Props) {
  const [title, setTitle]       = useState("");
  const [description, setDesc]  = useState("");
  const [priority, setPriority] = useState<Priority>("LOW");
  const [dueDate, setDueDate]   = useState("");
  const [estHours, setEstHours] = useState("");

  const { mutate: updateTask } = useUpdateTask();

  // Sync local state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description ?? "");
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "");
      setEstHours(task.estimatedHours?.toString() ?? "");
    }
  }, [task]);

  function save(patch: Partial<{ title: string; description: string; priority: Priority; dueDate: string; estimatedHours: number }>) {
    if (!task) return;
    updateTask({ id: task.id, data: patch });
  }

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-[700px] rounded-xl border-none bg-background p-0 shadow-2xl overflow-hidden">
        <DialogTitle className="sr-only">{task.title}</DialogTitle>

        <div className="flex flex-col gap-0">
          {/* Header: list name + close */}
          <div className="flex items-center justify-between border-b border-foreground/10 px-8 py-5">
            <span className="font-[family-name:var(--font-delius)] text-2xl font-bold text-foreground">
              {listName}
            </span>
            <button onClick={onClose} className="text-foreground/60 hover:text-foreground">
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col gap-6 px-8 py-6">
            {/* Task title — click to edit, save on blur */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== task.title && save({ title: title.trim() })}
              className="w-full border-0 border-b border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-5xl text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60"
            />

            {/* Priority buttons */}
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setPriority(p.value);
                    save({ priority: p.value });
                  }}
                  className={`flex h-[46px] flex-1 min-w-[90px] items-center justify-center rounded-[7px] font-[family-name:var(--font-delius)] text-lg transition-opacity ${p.bg} ${
                    priority === p.value ? "opacity-100 ring-2 ring-foreground/40" : "opacity-40"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Hours + due date row */}
            <div className="flex flex-wrap gap-6">
              {/* Estimated hours */}
              <div className="flex flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                  onBlur={() => save({ estimatedHours: estHours ? parseFloat(estHours) : undefined })}
                  className="w-20 border-b border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground outline-none focus:border-foreground/60"
                />
              </div>

              {/* Due date */}
              <div className="flex flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Due date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={() => save({ dueDate: dueDate || undefined })}
                  className="max-w-full border-b border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground outline-none focus:border-foreground/60"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-foreground/15" />

            {/* Description */}
            <Textarea
              placeholder="Add a description…"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => description !== (task.description ?? "") && save({ description })}
              rows={6}
              className="w-full resize-none border border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground placeholder:text-foreground/30 focus-visible:ring-foreground/30"
            />

            {/* Archive button + Complete toggle */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => { updateTask({ id: task.id, data: { archived: true, completed: true, completedAt: new Date().toISOString() } }); onClose(); }}
                className="flex h-8 items-center gap-2 rounded-full px-3 font-[family-name:var(--font-delius)] text-sm text-foreground/50 transition-colors hover:bg-foreground/8 hover:text-foreground"
              >
                <Archive size={14} />
                Archive
              </button>
              <button
                onClick={() => updateTask({ id: task.id, data: { completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null } })}
                className={`flex h-8 items-center gap-2 rounded-full px-4 font-[family-name:var(--font-delius)] text-sm transition-colors ${
                  task.completed
                    ? "bg-foreground text-background"
                    : "border border-foreground/30 text-foreground hover:bg-foreground/10"
                }`}
              >
                {task.completed ? "✓ Completed" : "Mark complete"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
