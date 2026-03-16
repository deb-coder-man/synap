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
import { toast } from "sonner";
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
  const [dueTime, setDueTime]   = useState("");
  const [estHours, setEstHours] = useState("");

  const { mutate: updateTask } = useUpdateTask();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description ?? "");
      setPriority(task.priority);
      if (task.dueDate) {
        const iso = new Date(task.dueDate).toISOString();
        setDueDate(iso.slice(0, 10));
        setDueTime(iso.slice(11, 16));
      } else {
        setDueDate("");
        setDueTime("");
      }
      setEstHours(task.estimatedHours?.toString() ?? "");
    }
  }, [task]);

  function buildDueDate(): string | undefined {
    if (!dueDate) return undefined;
    return dueTime ? `${dueDate}T${dueTime}` : `${dueDate}T00:00`;
  }

  function save(patch: Partial<{ title: string; description: string; priority: Priority; dueDate: string; estimatedHours: number }>) {
    if (!task) return;
    updateTask({ id: task.id, data: patch });
  }

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent showCloseButton={false} className="w-full sm:max-w-[850px] max-h-[90vh] rounded-xl border-none bg-background p-0 shadow-2xl overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{task.title}</DialogTitle>

        <div className="flex flex-col gap-0 overflow-hidden flex-1 min-h-0">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-foreground/10 px-4 py-4 sm:px-8 sm:py-5">
            <span className="font-[family-name:var(--font-delius)] text-xl font-bold text-foreground sm:text-2xl">
              {listName}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-foreground/50 transition-colors hover:bg-foreground/8 hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:gap-6 sm:px-8 sm:py-6">
            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title.trim() && title !== task.title) {
                  save({ title: title.trim() });
                  toast.success("Task updated");
                }
              }}
              className="w-full cursor-text border-0 border-b border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-3xl text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60 sm:text-5xl"
            />

            {/* Priority */}
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setPriority(p.value);
                    save({ priority: p.value });
                    toast.success("Priority updated");
                  }}
                  className={`flex h-[46px] flex-1 min-w-[90px] items-center justify-center rounded-[7px] font-[family-name:var(--font-delius)] text-lg transition-all ${p.bg} ${
                    priority === p.value
                      ? "opacity-100 ring-2 ring-foreground/40 shadow-sm"
                      : "opacity-35 hover:opacity-60"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Hours + due date/time */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                  onBlur={() => save({ estimatedHours: estHours ? parseFloat(estHours) : undefined })}
                  className="w-20 border-b border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground outline-none transition-colors focus:border-foreground/60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={() => save({ dueDate: buildDueDate() })}
                  className="border-b border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground outline-none transition-colors focus:border-foreground/60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Time</label>
                <input
                  type="time"
                  value={dueTime}
                  disabled={!dueDate}
                  onChange={(e) => setDueTime(e.target.value)}
                  onBlur={() => dueDate && save({ dueDate: buildDueDate() })}
                  className="border-b border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground outline-none transition-colors focus:border-foreground/60 disabled:opacity-30"
                />
              </div>
            </div>

            <div className="h-px bg-foreground/10" />

            {/* Description */}
            <Textarea
              placeholder="Add a description…"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => description !== (task.description ?? "") && save({ description })}
              rows={6}
              className="w-full resize-none border border-foreground/15 bg-transparent font-[family-name:var(--font-delius)] text-foreground placeholder:text-foreground/30 focus-visible:ring-foreground/20"
            />

            {/* Archive + Complete */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  updateTask({ id: task.id, data: { archived: true, completed: true, completedAt: new Date().toISOString() } });
                  toast.success("Task archived");
                  onClose();
                }}
                className="flex h-8 items-center gap-2 rounded-full px-3 font-[family-name:var(--font-delius)] text-sm text-foreground/40 transition-colors hover:bg-foreground/8 hover:text-foreground/70"
              >
                <Archive size={14} />
                Archive
              </button>
              <button
                onClick={() => {
                  const completing = !task.completed;
                  updateTask({ id: task.id, data: { completed: completing, completedAt: completing ? new Date().toISOString() : null } });
                  toast.success(completing ? "Task completed" : "Marked incomplete");
                }}
                className={`flex h-8 items-center gap-2 rounded-full px-4 font-[family-name:var(--font-delius)] text-sm transition-colors ${
                  task.completed
                    ? "bg-foreground text-background"
                    : "border border-foreground/25 text-foreground hover:bg-foreground/8"
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
