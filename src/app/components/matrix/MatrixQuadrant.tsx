"use client";

import MasonryGrid from "masonry-grid";
import MatrixTaskCard from "./MatrixTaskCard";
import QuadrantOptionsMenu from "./QuadrantOptionsMenu";
import type { Task } from "@/lib/types";

type Props = {
  id: string;
  title: string;
  colour: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onSaveConfig: (title: string, colour: string) => void;
};

export default function MatrixQuadrant({
  id,
  title,
  colour,
  tasks,
  onTaskClick,
  onSaveConfig,
}: Props) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[15px]"
      style={{ backgroundColor: colour }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4">
        <h2 className="font-[family-name:var(--font-delius)] text-2xl font-bold text-background">
          {title}
        </h2>
        <QuadrantOptionsMenu title={title} colour={colour} onSave={onSaveConfig} />
      </div>

      {/* Scrollable task grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tasks.length === 0 ? (
          <div className="flex h-full items-center justify-center py-8">
            <p className="font-[family-name:var(--font-delius)] text-sm text-background/40">
              No tasks
            </p>
          </div>
        ) : (
          // minWidth=185 → Math.round(containerWidth / 185)
          // gives 3 columns for drop-zone widths of 510–695px
          // (typical on 1280–1440px viewport screens)
          <MasonryGrid gap="8px" minWidth={185}>
            {tasks.map((task) => (
              <MatrixTaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
          </MasonryGrid>
        )}
      </div>
    </div>
  );
}
