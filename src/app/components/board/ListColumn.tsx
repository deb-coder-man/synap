"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import ListOptionsMenu from "./ListOptionsMenu";
import CreateListModal from "./CreateListModal";
import type { List, Task } from "@/lib/types";

type Props = {
  list: List & { tasks: Task[] };
};

export default function ListColumn({ list }: Props) {
  const [taskModalOpen, setTaskModalOpen]     = useState(false);
  const [editListOpen, setEditListOpen]       = useState(false);
  const [selectedTask, setSelectedTask]       = useState<Task | null>(null);

  // Separate active and completed tasks for visual grouping
  const activeTasks    = list.tasks.filter((t) => !t.completed);
  const completedTasks = list.tasks.filter((t) => t.completed);
  const taskIds        = list.tasks.map((t) => t.id);

  // Make the column itself sortable (for dragging lists)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, data: { type: "list" } });

  const columnStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...columnStyle, backgroundColor: list.colour }}
        className="flex w-[328px] shrink-0 flex-col gap-[13px] rounded-[15px] px-[23px] py-[19px]"
      >
        {/* Column header — drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex cursor-grab items-center justify-between px-[6px] py-[3px] active:cursor-grabbing"
        >
          <p className="font-[family-name:var(--font-delius)] text-[32px] text-background">
            {list.name}
          </p>
          <ListOptionsMenu list={list} onEditList={() => setEditListOpen(true)} />
        </div>

        {/* Task cards */}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} listColour={list.colour} onOpen={setSelectedTask} />
          ))}

          {/* Completed tasks (greyed out, below separator) */}
          {completedTasks.length > 0 && (
            <>
              <div className="h-px bg-background/20" />
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} listColour={list.colour} onOpen={setSelectedTask} />
              ))}
            </>
          )}
        </SortableContext>

        {/* Add a card button */}
        <button
          onClick={() => setTaskModalOpen(true)}
          className="mt-2 flex items-center justify-between rounded-[10px] px-[10px] py-[6px] font-[family-name:var(--font-delius)] text-[20px] text-background transition-colors hover:bg-background/15 hover:text-background"
        >
          <span>Add a card</span>
          <Plus size={24} />
        </button>
      </div>

      {/* Modals */}
      <CreateTaskModal
        listId={list.id}
        listName={list.name}
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />

      <CreateListModal
        open={editListOpen}
        onClose={() => setEditListOpen(false)}
        editingList={list}
      />

      <TaskDetailModal
        task={selectedTask}
        listName={list.name}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}
