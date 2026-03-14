"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock } from "lucide-react";
import type { Task, Priority } from "@/lib/types";
import { useUpdateTask } from "@/app/hooks/useTasks";

// ─── Priority helpers ─────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<Priority, { bg: string; label: string }> = {
  LOW:    { bg: "bg-priority-low",    label: "Low"    },
  MEDIUM: { bg: "bg-priority-medium", label: "Medium" },
  HIGH:   { bg: "bg-priority-high",   label: "High"   },
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  task: Task;
  listColour: string;
  onOpen: (task: Task) => void;
};

export default function TaskCard({ task, listColour, onOpen }: Props) {
  const { mutate: updateTask } = useUpdateTask();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const completedBg = task.completed
    ? { backgroundColor: hexToRgba("000000", 0.1) }
    : {};

  const priority = PRIORITY_STYLES[task.priority];
  const hasHours = task.estimatedHours != null;

  function toggleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    updateTask({
      id: task.id,
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
      },
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...dndStyle, ...completedBg }}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className="relative flex cursor-pointer flex-col gap-3 rounded-lg bg-background px-[17px] py-[15px] transition-colors"
    >
      {/* Complete toggle — top right */}
      <button
        onClick={toggleComplete}
        className={`absolute right-3 top-3 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-foreground/40 bg-transparent hover:border-foreground"
        }`}
        title={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg viewBox="0 0 10 8" className="h-[8px] w-[10px]">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Due date — above title */}
      {task.dueDate && (
        <p className={`font-[family-name:var(--font-delius)] text-[10px] ${task.completed ? "text-white opacity-60" : "text-foreground/50"}`}>
          Due {formatDate(task.dueDate)}
        </p>
      )}

      {/* Title — right padding to avoid overlapping the circle */}
      <p
        className={`pr-8 font-[family-name:var(--font-delius)] text-sm ${task.completed ? "text-white line-through" : "text-foreground"}`}
      >
        {task.title}
      </p>

      {/* Meta row: priority + hours chip (if present) */}
      <div className="flex items-center gap-[7px]">
        {/* Priority badge — full width when no hours chip */}
        <div
          className={`flex h-[33px] items-center justify-center rounded-[7px] ${priority.bg} ${task.completed ? "opacity-50" : ""} ${hasHours ? "w-[115px]" : "w-full"}`}
        >
          <span className="font-[family-name:var(--font-delius)] text-[15px] text-foreground">
            {priority.label}
          </span>
        </div>

        {/* Estimated hours chip */}
        {hasHours && (
          <div className={`flex h-[33px] w-[125px] items-center gap-2 rounded-[7px] bg-background px-[10px] ring-1 ring-foreground/10 ${task.completed ? "opacity-50" : ""}`}>
            <Clock size={14} className="shrink-0 text-foreground/60" />
            <span className="font-[family-name:var(--font-delius)] text-[12px] text-foreground">
              {task.estimatedHours}h
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
