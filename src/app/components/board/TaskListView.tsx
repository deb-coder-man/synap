"use client";

import { useState } from "react";
import { GripVertical, Clock, Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateTask } from "@/app/hooks/useTasks";
import { toast } from "sonner";
import type { List, Task, Priority } from "@/lib/types";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";

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

type ListWithTasks = List & { tasks: Task[] };

// ─── Sortable row ─────────────────────────────────────────────────────────────

function TaskListRow({
  task,
  list,
  onOpen,
}: {
  task: Task;
  list: List;
  onOpen: (task: Task) => void;
}) {
  const { mutate: updateTask } = useUpdateTask();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const priority = PRIORITY_STYLES[task.priority];

  function toggleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    const completing = !task.completed;
    updateTask({
      id: task.id,
      data: { completed: completing, completedAt: completing ? new Date().toISOString() : null },
    });
    toast.success(completing ? "Task completed" : "Marked incomplete");
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`group flex items-center gap-3 rounded-lg bg-background px-3 py-3 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md sm:px-4 ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-foreground/20 transition-colors hover:text-foreground/50 active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>

      {/* Title */}
      <p
        onClick={() => onOpen(task)}
        className={`min-w-0 flex-1 cursor-pointer truncate font-[family-name:var(--font-delius)] text-sm transition-colors hover:text-foreground/70 ${
          task.completed ? "text-foreground/40 line-through" : "text-foreground"
        }`}
      >
        {task.title}
      </p>

      {/* Group chip — desktop */}
      <div
        className="hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 sm:flex"
        style={{ backgroundColor: list.colour + "28" }}
      >
        <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: list.colour }} />
        <span className="max-w-[80px] truncate font-[family-name:var(--font-delius)] text-xs text-foreground/70">
          {list.name}
        </span>
      </div>

      {/* Group dot — mobile */}
      <div
        className="h-2 w-2 shrink-0 rounded-full sm:hidden"
        style={{ backgroundColor: list.colour }}
        title={list.name}
      />

      {/* Priority badge */}
      <div
        className={`hidden shrink-0 items-center justify-center rounded-md px-2.5 py-0.5 sm:flex ${priority.bg} ${
          task.completed ? "opacity-40" : ""
        }`}
      >
        <span className="font-[family-name:var(--font-delius)] text-[11px]">{priority.label}</span>
      </div>

      {/* Hours */}
      <div className="hidden w-14 shrink-0 items-center justify-end gap-1 sm:flex">
        {task.estimatedHours != null && (
          <span className="flex items-center gap-1 font-[family-name:var(--font-delius)] text-xs text-foreground/50">
            <Clock size={11} />
            {task.estimatedHours}h
          </span>
        )}
      </div>

      {/* Due date */}
      <div className="hidden w-16 shrink-0 justify-end sm:flex">
        {task.dueDate && (
          <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="hidden w-48 shrink-0 sm:block lg:w-64">
        {task.description ? (
          <span className="truncate font-[family-name:var(--font-delius)] text-xs text-foreground/40 block">
            {task.description}
          </span>
        ) : (
          <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/20 italic">—</span>
        )}
      </div>

      {/* Complete circle */}
      <button
        onClick={toggleComplete}
        className={`ml-1 flex size-[20px] shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-75 ${
          task.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-foreground/20 bg-transparent opacity-0 group-hover:opacity-100 hover:border-green-400 hover:bg-green-50"
        }`}
        title={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg viewBox="0 0 10 8" className="h-[7px] w-[9px]">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

type Props = {
  lists: ListWithTasks[];
};

export default function TaskListView({ lists }: Props) {
  const [addTaskOpen, setAddTaskOpen]   = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const allTasks       = lists.flatMap((l) => l.tasks);
  const activeTasks    = allTasks.filter((t) => !t.completed);
  const completedTasks = allTasks.filter((t) => t.completed);
  const taskIds        = [...activeTasks, ...completedTasks].map((t) => t.id);

  function getList(task: Task): List {
    return lists.find((l) => l.id === task.listId) ?? lists[0];
  }

  const selectedTaskList = selectedTask
    ? lists.find((l) => l.id === selectedTask.listId) ?? null
    : null;

  return (
    <>
      <div className="w-full px-4 py-6 sm:px-6">
        {/* Column headers — desktop only */}
        <div className="mb-2 hidden items-center gap-3 sm:flex">
          <div className="w-4 shrink-0" />
          <span className="flex-1 font-[family-name:var(--font-delius)] text-[10px] uppercase tracking-wider text-foreground/35">Task</span>
          <span className="w-[108px] font-[family-name:var(--font-delius)] text-[10px] uppercase tracking-wider text-foreground/35">Group</span>
          <span className="w-[72px] font-[family-name:var(--font-delius)] text-[10px] uppercase tracking-wider text-foreground/35">Priority</span>
          <span className="flex w-14 justify-end font-[family-name:var(--font-delius)] text-[10px] uppercase tracking-wider text-foreground/35">Hours</span>
          <span className="flex w-16 justify-end font-[family-name:var(--font-delius)] text-[10px] uppercase tracking-wider text-foreground/35">Due</span>
          <span className="w-48 font-[family-name:var(--font-delius)] text-[10px] uppercase tracking-wider text-foreground/35 lg:w-64">Description</span>
          <div className="ml-1 w-5 shrink-0" />
        </div>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {activeTasks.map((task) => (
              <TaskListRow key={task.id} task={task} list={getList(task)} onOpen={setSelectedTask} />
            ))}

            {completedTasks.length > 0 && (
              <>
                <div className="my-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-foreground/10" />
                  <span className="font-[family-name:var(--font-delius)] text-[10px] uppercase tracking-wider text-foreground/30">Completed</span>
                  <div className="h-px flex-1 bg-foreground/10" />
                </div>
                {completedTasks.map((task) => (
                  <TaskListRow key={task.id} task={task} list={getList(task)} onOpen={setSelectedTask} />
                ))}
              </>
            )}

            {allTasks.length === 0 && (
              <p className="py-16 text-center font-[family-name:var(--font-delius)] text-foreground/30">
                No tasks yet — add one below.
              </p>
            )}
          </div>
        </SortableContext>

        {/* Add task */}
        <button
          onClick={() => setAddTaskOpen(true)}
          className="mt-4 flex w-full items-center gap-2 rounded-lg border border-dashed border-foreground/20 px-4 py-3 font-[family-name:var(--font-delius)] text-sm text-foreground/40 transition-colors hover:border-foreground/40 hover:text-foreground/60"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>

      <CreateTaskModal
        lists={lists}
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
      />

      <TaskDetailModal
        task={selectedTask}
        listName={selectedTaskList?.name ?? ""}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}
