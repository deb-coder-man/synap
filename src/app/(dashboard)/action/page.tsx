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
import { toast } from "sonner";
import { useState } from "react";
import { useTasks, useUpdateTask } from "@/app/hooks/useTasks";
import { useActionStore } from "@/app/stores/actionStore";
import ActionTaskCard from "@/app/components/action/ActionTaskCard";
import PomodoroTimer from "@/app/components/action/PomodoroTimer";
import TaskDetailModal from "@/app/components/board/TaskDetailModal";
import type { Task } from "@/lib/types";

export default function ActionPage() {
  const { data: allTasks = [] } = useTasks();
  const { mutate: updateTask } = useUpdateTask();

  const {
    orderedTaskIds,
    skippedIds,
    generated,
    hours,
    setOrderedTaskIds,
    removeTaskId,
    reorderTaskIds,
    addSkippedId,
    setGenerated,
    setHours,
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

  function handleGenerate() {
    if (activeTasks.length === 0) return;
    setGenerating(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const PRIORITY_WEIGHT: Record<string, number> = { HIGH: 6, MEDIUM: 3, LOW: 1 };

    function urgencyWeight(dueDate: string | null): number {
      const due = dueDate
        ? new Date(dueDate)
        : new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000); // assume 5 days if missing
      due.setHours(0, 0, 0, 0);
      const days = Math.max(0, Math.ceil((due.getTime() - today.getTime()) / 86_400_000));
      if (days <= 1)  return 5;
      if (days <= 3)  return 4;
      if (days <= 7)  return 3;
      if (days <= 14) return 2;
      if (days <= 30) return 1;
      return 0;
    }

    // Score each task, then fit within available hours (highest score first)
    const scored = activeTasks
      .map((t) => ({
        id: t.id,
        score: PRIORITY_WEIGHT[t.priority] + urgencyWeight(t.dueDate ?? null),
        dueMs: t.dueDate ? new Date(t.dueDate).getTime() : Infinity,
        hours: t.estimatedHours ?? 0.5,
      }))
      .sort((a, b) => b.score - a.score || a.dueMs - b.dueMs);

    let remaining = hours;
    const ordered: string[] = [];
    const overflow: string[] = [];
    for (const t of scored) {
      if (t.hours <= remaining) {
        ordered.push(t.id);
        remaining -= t.hours;
      } else {
        overflow.push(t.id);
      }
    }

    setOrderedTaskIds([...ordered, ...overflow]);
    setGenerated(true);
    setGenerating(false);
    toast.success("Work plan generated");
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
    <div className="flex flex-col gap-6 px-6 pb-6 sm:flex-row sm:h-[calc(100vh-140px)]">
      {/* Timer panel — top on mobile, right on desktop */}
      <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl bg-foreground/5 px-6 py-8 sm:order-last sm:w-72">
        <PomodoroTimer />
      </div>

      {/* Task list panel */}
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

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || activeTasks.length === 0}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 font-[family-name:var(--font-delius)] text-sm text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:opacity-40"
          >
            <Sparkles size={14} />
            {generating ? "Generating\u2026" : generated ? "Regenerate" : "Generate plan"}
          </button>
        </div>

        {/* Task list */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {!generated ? (
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
            <div className="animate-page-content-in flex flex-col gap-2">
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
            </div>
          )}
        </div>
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
