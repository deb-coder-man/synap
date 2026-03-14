"use client";

import { useState, useEffect, useRef } from "react";
import { useTasks, useUpdateTask } from "@/app/hooks/useTasks";
import MatrixQuadrant from "@/app/components/matrix/MatrixQuadrant";
import TaskDetailModal from "@/app/components/board/TaskDetailModal";
import type { Task } from "@/lib/types";

// ─── Quadrant config ──────────────────────────────────────────────────────────

type QuadrantConfig = {
  id: string;
  title: string;
  colour: string;
  urgent: boolean;
  important: boolean;
};

const DEFAULT_QUADRANTS: QuadrantConfig[] = [
  { id: "q1", title: "Do First",  colour: "#a65a4c", urgent: true,  important: true  },
  { id: "q2", title: "Schedule",  colour: "#5f7c95", urgent: false, important: true  },
  { id: "q3", title: "Delegate",  colour: "#6f8f6a", urgent: true,  important: false },
  { id: "q4", title: "Eliminate", colour: "#8b6f8f", urgent: false, important: false },
];

const STORAGE_KEY = "synap-matrix-quadrants";

function loadQuadrants(): QuadrantConfig[] {
  if (typeof window === "undefined") return DEFAULT_QUADRANTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<QuadrantConfig>[];
      return DEFAULT_QUADRANTS.map((def) => {
        const saved = parsed.find((p) => p.id === def.id);
        return saved ? { ...def, title: saved.title ?? def.title, colour: saved.colour ?? def.colour } : def;
      });
    }
  } catch { /* ignore */ }
  return DEFAULT_QUADRANTS;
}

function saveQuadrants(quadrants: QuadrantConfig[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(quadrants)); } catch { /* ignore */ }
}

// ─── Auto-placement algorithm ─────────────────────────────────────────────────
// Urgent:    due within 3 days
// Important: HIGH priority only

function computePlacement(task: Task): { urgent: boolean; important: boolean } {
  const isDueSoon =
    task.dueDate !== null &&
    new Date(task.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return {
    urgent:    isDueSoon,
    important: task.priority === "HIGH",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatrixPage() {
  const { data: allTasks = [] } = useTasks();
  const { mutate: updateTask } = useUpdateTask();

  const [quadrants, setQuadrants] = useState<QuadrantConfig[]>(DEFAULT_QUADRANTS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load persisted quadrant titles/colours from localStorage
  useEffect(() => {
    setQuadrants(loadQuadrants());
  }, []);

  // Auto-place tasks on page mount (runs once when tasks first load)
  const hasAutoPlaced = useRef(false);
  useEffect(() => {
    if (hasAutoPlaced.current || allTasks.length === 0) return;
    hasAutoPlaced.current = true;

    const active = (allTasks as Task[]).filter((t) => !t.archived && !t.completed);
    active.forEach((task) => {
      const { urgent, important } = computePlacement(task);
      if (task.urgent !== urgent || task.important !== important) {
        updateTask({ id: task.id, data: { urgent, important } });
      }
    });
  }, [allTasks, updateTask]);

  // Filter to active (non-archived, non-completed) tasks
  const activeTasks = (allTasks as Task[]).filter((t) => !t.archived && !t.completed);

  function getQuadrantTasks(q: QuadrantConfig): Task[] {
    return activeTasks.filter((t) => t.urgent === q.urgent && t.important === q.important);
  }

  // Find the quadrant a task belongs to (for modal header label)
  function taskQuadrantTitle(task: Task | null): string {
    if (!task) return "";
    return (
      quadrants.find((q) => q.urgent === task.urgent && q.important === task.important)
        ?.title ?? "Task"
    );
  }

  // ─── Quadrant config updates ───────────────────────────────────────────────

  function updateQuadrantConfig(id: string, title: string, colour: string) {
    const updated = quadrants.map((q) => (q.id === id ? { ...q, title, colour } : q));
    setQuadrants(updated);
    saveQuadrants(updated);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="grid grid-cols-1 gap-5 px-6 pb-6 sm:grid-cols-2 sm:grid-rows-2 sm:h-[calc(100vh-140px)]">
        {quadrants.map((q) => (
          <MatrixQuadrant
            key={q.id}
            id={q.id}
            title={q.title}
            colour={q.colour}
            tasks={getQuadrantTasks(q)}
            onTaskClick={setSelectedTask}
            onSaveConfig={(title, colour) => updateQuadrantConfig(q.id, title, colour)}
          />
        ))}
      </div>

      <TaskDetailModal
        task={selectedTask}
        listName={taskQuadrantTitle(selectedTask)}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}
