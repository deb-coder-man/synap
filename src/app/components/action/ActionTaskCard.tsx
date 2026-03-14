"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, SkipForward, Clock } from "lucide-react";
import type { Task, Priority } from "@/lib/types";

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: "bg-priority-low",
  MEDIUM: "bg-priority-medium",
  HIGH: "bg-priority-high",
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
  position: number;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onClick: (task: Task) => void;
};

export default function ActionTaskCard({ task, position, onComplete, onSkip, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 rounded-xl bg-foreground/5 px-4 py-3 transition-shadow hover:shadow-sm"
    >
      {/* Position number */}
      <span className="w-6 shrink-0 text-center font-[family-name:var(--font-delius)] text-sm text-foreground/40">
        {position}
      </span>

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-foreground/30 hover:text-foreground/60 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </button>

      {/* Task info — clickable */}
      <div
        className="flex flex-1 cursor-pointer flex-col gap-1 overflow-hidden"
        onClick={() => onClick(task)}
      >
        <p className="truncate font-[family-name:var(--font-delius)] text-sm text-foreground">
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

      {/* Skip */}
      <button
        onClick={() => onSkip(task.id)}
        title="Skip task"
        className="shrink-0 rounded-full p-1.5 text-foreground/30 transition-colors hover:bg-foreground/10 hover:text-foreground/60"
      >
        <SkipForward size={14} />
      </button>

      {/* Complete */}
      <button
        onClick={() => onComplete(task.id)}
        title="Mark complete"
        className="shrink-0 rounded-full border border-foreground/20 p-1.5 text-foreground/30 transition-colors hover:border-foreground/50 hover:text-foreground/60"
      >
        <Check size={14} />
      </button>
    </div>
  );
}
