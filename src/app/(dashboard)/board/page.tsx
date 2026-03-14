"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useLists, listKeys } from "@/app/hooks/useLists";
import { useQueryClient } from "@tanstack/react-query";
import { reorderLists } from "@/lib/api/lists";
import { reorderTasks } from "@/lib/api/tasks";
import ListColumn from "@/app/components/board/ListColumn";
import TaskCard from "@/app/components/board/TaskCard";
import CreateListModal from "@/app/components/board/CreateListModal";
import type { List, Task } from "@/lib/types";

type ListWithTasks = List & { tasks: Task[] };

export default function BoardPage() {
  const { data: rawLists = [] } = useLists();
  const lists = rawLists as ListWithTasks[];

  const queryClient = useQueryClient();

  const [createListOpen, setCreateListOpen] = useState(false);
  const [activeList, setActiveList] = useState<ListWithTasks | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const listIds = lists.map((l) => l.id);

  // ─── Drag handlers ─────────────────────────────────────────────────────────

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "list") {
      setActiveList(lists.find((l) => l.id === event.active.id) ?? null);
    }
    if (data?.type === "task") {
      setActiveTask(data.task as Task);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData   = over.data.current;

    // Task dragged over a different list column — optimistically move it
    if (activeData?.type === "task" && overData?.type === "list") {
      const task = activeData.task as Task;
      if (task.listId !== over.id) {
        queryClient.setQueryData(listKeys.all, (old: ListWithTasks[]) =>
          old?.map((list) => {
            if (list.id === task.listId) {
              return { ...list, tasks: list.tasks.filter((t) => t.id !== task.id) };
            }
            if (list.id === over.id) {
              return { ...list, tasks: [...list.tasks, { ...task, listId: String(over.id) }] };
            }
            return list;
          })
        );
        setActiveTask((t) => (t ? { ...t, listId: String(over.id) } : t));
      }
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveList(null);
    setActiveTask(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData   = over.data.current;

    // ── Reorder lists ──────────────────────────────────────────────────────
    if (
      activeData?.type === "list" &&
      overData?.type === "list" &&
      active.id !== over.id
    ) {
      const oldIndex  = lists.findIndex((l) => l.id === active.id);
      const newIndex  = lists.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(lists, oldIndex, newIndex);

      queryClient.setQueryData(
        listKeys.all,
        reordered.map((l, i) => ({ ...l, order: i }))
      );
      const listUpdates = reordered
        .map((list, i) => ({ id: list.id, order: i }))
        .filter((_, i) => reordered[i].order !== i);
      if (listUpdates.length > 0) reorderLists(listUpdates);
      return;
    }

    // ── Move/reorder tasks ──────────────────────────────────────────────────
    if (activeData?.type === "task") {
      const movedTask    = activeData.task as Task;
      const targetListId =
        overData?.type === "list"
          ? String(over.id)
          : (overData?.task as Task | undefined)?.listId ?? movedTask.listId;

      const targetList = lists.find((l) => l.id === targetListId);
      if (!targetList) return;

      const tasks        = targetList.tasks;
      const overTaskId   = overData?.type === "task" ? String(over.id) : null;
      const overIndex    = overTaskId ? tasks.findIndex((t) => t.id === overTaskId) : tasks.length;
      const activeIndex  = tasks.findIndex((t) => t.id === movedTask.id);

      const newTasks: Task[] =
        activeIndex !== -1
          ? arrayMove(tasks, activeIndex, overIndex)
          : [
              ...tasks.slice(0, overIndex),
              { ...movedTask, listId: targetListId },
              ...tasks.slice(overIndex),
            ];

      queryClient.setQueryData(
        listKeys.all,
        lists.map((l) =>
          l.id === targetListId ? { ...l, tasks: newTasks } : l.id === movedTask.listId ? { ...l, tasks: l.tasks.filter((t) => t.id !== movedTask.id) } : l
        )
      );

      const taskUpdates = newTasks
        .map((task, i) => ({ id: task.id, order: i, listId: targetListId }))
        .filter((_, i) => newTasks[i].order !== i || newTasks[i].listId !== targetListId);
      if (taskUpdates.length > 0) reorderTasks(taskUpdates);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="scrollbar-themed flex min-h-[calc(100vh-120px)] items-start gap-8 overflow-x-auto px-6 pb-8 snap-x snap-mandatory scroll-smooth sm:gap-[25px]">
        <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
          {lists.map((list) => (
            <ListColumn key={list.id} list={list} />
          ))}
        </SortableContext>

        {/* Add a List */}
        <button
          onClick={() => setCreateListOpen(true)}
          className="flex w-[calc(100vw-3rem)] shrink-0 snap-center items-center justify-between rounded-[15px] bg-foreground px-[23px] py-[19px] font-[family-name:var(--font-delius)] text-[20px] text-background hover:opacity-80 sm:w-[328px] sm:snap-start"
        >
          <span>Add a List</span>
          <Plus size={28} />
        </button>
      </div>

      {/* Drag overlays */}
      <DragOverlay>
        {activeList && <ListColumn list={activeList} />}
        {activeTask && (
          <div className="w-[280px] scale-[1.03] rounded-lg bg-background shadow-2xl ring-1 ring-foreground/5">
            <TaskCard task={activeTask} listColour="#f6f0e6" onOpen={() => {}} />
          </div>
        )}
      </DragOverlay>

      <CreateListModal
        open={createListOpen}
        onClose={() => setCreateListOpen(false)}
        nextOrder={lists.length}
      />
    </DndContext>
  );
}
