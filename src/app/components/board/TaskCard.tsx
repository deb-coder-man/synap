"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock } from "lucide-react";
import type { Task, Priority } from "@/lib/types";
import { useUpdateTask } from "@/app/hooks/useTasks";
import { toast } from "sonner";

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

type Props = {
  task: Task;
  listColour: string;
  onOpen: (task: Task) => void;
};

export default function TaskCard({ task, onOpen }: Props) {
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

  const priority = PRIORITY_STYLES[task.priority];
  const hasHours = task.estimatedHours != null;

  function toggleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    const completing = !task.completed;
    updateTask({
      id: task.id,
      data: {
        completed: completing,
        completedAt: completing ? new Date().toISOString() : null,
      },
    });
    toast(completing ? "Task completed" : "Marked incomplete");
  }

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className={`group flex cursor-pointer flex-col gap-3 rounded-lg bg-background px-[17px] py-[15px] shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md ${
        task.completed ? "opacity-70" : ""
      }`}
    >
      {/* Due date — above title row */}
      {task.dueDate && (
        <p className={`font-[family-name:var(--font-delius)] text-[10px] ${task.completed ? "text-foreground/40" : "text-foreground/50"}`}>
          Due {formatDate(task.dueDate)}
        </p>
      )}

      {/* Title row: circle slides in from left on hover (Trello-style) */}
      <div className="flex items-start">
        {/* Completed: always visible. Not completed: animates in on hover */}
        <div
          className={`overflow-hidden transition-all duration-150 ease-out ${
            task.completed ? "mr-2 w-[18px]" : "mr-0 w-0 group-hover:mr-2 group-hover:w-[18px]"
          }`}
        >
          <button
            onClick={toggleComplete}
            className={`mt-[1px] flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors active:scale-75 ${
              task.completed
                ? "border-green-500 bg-green-500 text-white"
                : "border-foreground/25 bg-transparent hover:border-green-400 hover:bg-green-50"
            }`}
            title={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed && (
              <svg viewBox="0 0 10 8" className="h-[7px] w-[9px]">
                <path
                  d="M1 4l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        <p
          className={`font-[family-name:var(--font-delius)] text-sm leading-snug ${
            task.completed ? "text-foreground/40 line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
      </div>

      {/* Meta row: priority + hours chip */}
      <div className="flex items-center gap-[7px]">
        <div
          className={`flex h-[33px] items-center justify-center rounded-[7px] ${priority.bg} ${task.completed ? "opacity-40" : ""} ${hasHours ? "w-[115px]" : "w-full"}`}
        >
          <span className="font-[family-name:var(--font-delius)] text-[15px] text-foreground">
            {priority.label}
          </span>
        </div>

        {hasHours && (
          <div className={`flex h-[33px] w-[125px] items-center gap-2 rounded-[7px] bg-background px-[10px] ring-1 ring-foreground/10 ${task.completed ? "opacity-40" : ""}`}>
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
