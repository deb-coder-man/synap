"use client";

import { useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useTasks, useUpdateTask } from "@/app/hooks/useTasks";
import { useActionStore } from "@/app/stores/actionStore";
import { prioritiseTasks } from "@/lib/api/prioritisation";
import ActionTaskCard from "@/app/components/action/ActionTaskCard";
import PomodoroTimer from "@/app/components/action/PomodoroTimer";
import TaskDetailModal from "@/app/components/board/TaskDetailModal";
import type { Task } from "@/lib/types";

export default function ActionPage() {
  const { data: allTasks = [], isLoading } = useTasks();
  const { mutate: updateTask } = useUpdateTask();

  const {
    orderedTaskIds,
    skippedIds,
    generated,
    hours,
    deepWork,
    setOrderedTaskIds,
    removeTaskId,
    reorderTaskIds,
    addSkippedId,
    setGenerated,
    setHours,
    setDeepWork,
  } = useActionStore();

  const [generating, setGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Active non-archived, non-completed tasks
  const activeTasks = (allTasks as Task[]).filter((t) => !t.archived && !t.completed);

  // Rebuild ordered Task objects from persisted IDs
  const taskMap = new Map(activeTasks.map((t) => [t.id, t]));
  const orderedTasks = orderedTaskIds
    .map((id) => taskMap.get(id))
    .filter((t): t is Task => !!t);

  const skippedSet = new Set(skippedIds);
  const visibleTasks = orderedTasks.filter((t) => !skippedSet.has(t.id));

  async function handleGenerate() {
    if (activeTasks.length === 0) return;
    setGenerating(true);
    try {
      const orderedIds = await prioritiseTasks(hours, deepWork, activeTasks);

      // Build ordered list from returned IDs, append any missing as fallback
      const ordered: string[] = [];
      for (const id of orderedIds) {
        if (taskMap.has(id)) ordered.push(id);
      }
      for (const t of activeTasks) {
        if (!ordered.includes(t.id)) ordered.push(t.id);
      }
      setOrderedTaskIds(ordered);
      setGenerated(true);
    } catch (err) {
      console.error("Generate error:", err);
      // Fallback: sort by priority then due date
      const PRIO = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
      const fallback = [...activeTasks]
        .sort((a, b) => {
          if (PRIO[a.priority] !== PRIO[b.priority]) return PRIO[a.priority] - PRIO[b.priority];
          if (a.dueDate && b.dueDate)
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          return 0;
        })
        .map((t) => t.id);
      setOrderedTaskIds(fallback);
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  }

  function handleComplete(id: string) {
    updateTask({ id, data: { completed: true, completedAt: new Date().toISOString() } });
    removeTaskId(id);
  }

  function handleSkip(id: string) {
    addSkippedId(id);
  }

  // ─── DnD ──────────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = orderedTaskIds.indexOf(active.id as string);
      const newIndex = orderedTaskIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      reorderTaskIds(arrayMove(orderedTaskIds, oldIndex, newIndex));
    },
    [orderedTaskIds, reorderTaskIds]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 px-6 pb-6">
      {/* Left panel: task list */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        {/* Session config */}
        <div className="flex shrink-0 flex-wrap items-end gap-4 rounded-xl bg-foreground/5 px-5 py-4">
          {/* Hours */}
          <div className="flex flex-col gap-1">
            <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">
              Hours available
            </label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-24 rounded-lg border border-foreground/15 bg-transparent px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none focus:border-foreground/40"
            />
          </div>

          {/* Deep work toggle */}
          <label className="flex cursor-pointer items-center gap-2 pb-2 font-[family-name:var(--font-delius)] text-sm text-foreground/70">
            <div
              onClick={() => setDeepWork(!deepWork)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                deepWork ? "bg-foreground" : "bg-foreground/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
                  deepWork ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            Deep work
          </label>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || activeTasks.length === 0}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 font-[family-name:var(--font-delius)] text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <Sparkles size={14} />
            {generating ? "Generating\u2026" : generated ? "Regenerate" : "Generate plan"}
          </button>
        </div>

        {/* Task list */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="font-[family-name:var(--font-delius)] text-foreground/40">Loading\u2026</p>
            </div>
          ) : !generated ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-foreground/15">
              <p className="font-[family-name:var(--font-delius)] text-sm text-foreground/40">
                Configure your session above to generate a plan
              </p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-foreground/15">
              <p className="font-[family-name:var(--font-delius)] text-sm text-foreground/40">
                All tasks done or skipped
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={visibleTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {visibleTasks.map((task, i) => (
                  <ActionTaskCard
                    key={task.id}
                    task={task}
                    position={i + 1}
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                    onClick={setSelectedTask}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeTask && (
                  <div className="rounded-xl bg-foreground/5 px-4 py-3 shadow-xl opacity-90">
                    <p className="font-[family-name:var(--font-delius)] text-sm text-foreground">
                      {activeTask.title}
                    </p>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Right panel: Pomodoro timer */}
      <div className="flex w-72 shrink-0 flex-col items-center justify-center rounded-xl bg-foreground/5 px-6 py-8">
        <PomodoroTimer />
      </div>

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        listName="Action Plan"
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
