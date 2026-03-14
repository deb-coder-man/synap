"use client";

import { Clock } from "lucide-react";
import type { Task, Priority } from "@/lib/types";

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: "bg-priority-low",
  MEDIUM: "bg-priority-medium",
  HIGH: "bg-priority-high",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

type Props = {
  task: Task;
  boardName: string;
  onClick: (task: Task) => void;
};

export default function ArchiveTaskCard({ task, boardName, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(task)}
      className="flex cursor-pointer flex-col gap-2.5 rounded-lg bg-background px-4 py-3.5 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
    >
      <p
        className={`font-[family-name:var(--font-delius)] text-sm text-foreground ${
          task.completed ? "line-through opacity-50" : ""
        }`}
      >
        {task.title}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
        <span className="font-[family-name:var(--font-delius)] text-[11px] text-foreground/50">
          {PRIORITY_LABEL[task.priority]}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1 font-[family-name:var(--font-delius)] text-[11px] text-foreground/40">
            <Clock size={11} />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.estimatedHours != null && (
          <span className="font-[family-name:var(--font-delius)] text-[11px] text-foreground/40">
            {task.estimatedHours}h
          </span>
        )}
      </div>

      {/* Board badge */}
      <span className="self-start rounded-full bg-foreground/10 px-2.5 py-0.5 font-[family-name:var(--font-delius)] text-[11px] font-medium text-foreground/60">
        {boardName}
      </span>
    </div>
  );
}
