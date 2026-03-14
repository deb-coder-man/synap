"use client";

import { Clock } from "lucide-react";
import type { Task, Priority } from "@/lib/types";

const PRIORITY_DOT: Record<Priority, string> = {
  LOW:    "bg-priority-low",
  MEDIUM: "bg-priority-medium",
  HIGH:   "bg-priority-high",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

type Props = {
  task: Task;
  onClick: (task: Task) => void;
};

export default function MatrixTaskCard({ task, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(task)}
      className={`flex cursor-pointer flex-col gap-2 rounded-lg bg-background px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <p
        className={`font-[family-name:var(--font-delius)] text-sm text-foreground ${
          task.completed ? "line-through" : ""
        }`}
      >
        {task.title}
      </p>

      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
        {task.dueDate && (
          <span className="flex items-center gap-1 font-[family-name:var(--font-delius)] text-[11px] text-foreground/50">
            <Clock size={10} />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.estimatedHours != null && (
          <span className="font-[family-name:var(--font-delius)] text-[11px] text-foreground/50">
            {task.estimatedHours}h
          </span>
        )}
      </div>
    </div>
  );
}
