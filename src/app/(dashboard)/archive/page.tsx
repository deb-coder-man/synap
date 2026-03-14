"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import MasonryGrid from "masonry-grid";
import { useArchivedTasks } from "@/app/hooks/useTasks";
import { useLists } from "@/app/hooks/useLists";
import ArchiveTaskCard from "@/app/components/archive/ArchiveTaskCard";
import ArchiveDetailModal from "@/app/components/archive/ArchiveDetailModal";
import type { Task, Priority } from "@/lib/types";

const PRIORITIES: Priority[] = ["HIGH", "MEDIUM", "LOW"];
const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

type SortOption = "" | "date-asc" | "date-desc" | "hours-asc" | "hours-desc";

export default function ArchivePage() {
  const { data: archivedTasks = [], isLoading } = useArchivedTasks();
  const { data: lists = [] } = useLists();

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [boardFilter, setBoardFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Build board name map (listId → name)
  const listMap = useMemo(
    () => new Map(lists.map((l) => [l.id, l.name])),
    [lists]
  );

  const filtered = useMemo(() => {
    let tasks = archivedTasks as Task[];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      tasks = tasks.filter((t) => priorityFilter.includes(t.priority));
    }

    // Board filter
    if (boardFilter) {
      tasks = tasks.filter((t) => t.listId === boardFilter);
    }

    // Sort
    if (sort === "date-asc") {
      tasks = [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sort === "date-desc") {
      tasks = [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });
    } else if (sort === "hours-asc") {
      tasks = [...tasks].sort((a, b) => (a.estimatedHours ?? 0) - (b.estimatedHours ?? 0));
    } else if (sort === "hours-desc") {
      tasks = [...tasks].sort((a, b) => (b.estimatedHours ?? 0) - (a.estimatedHours ?? 0));
    }

    return tasks;
  }, [archivedTasks, search, priorityFilter, boardFilter, sort]);

  function togglePriority(p: Priority) {
    setPriorityFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  // Unique boards from archived tasks (may include deleted boards not in lists)
  const archivedBoards = useMemo(() => {
    const seen = new Set<string>();
    const boards: { id: string; name: string }[] = [];
    for (const t of archivedTasks as Task[]) {
      if (!seen.has(t.listId)) {
        seen.add(t.listId);
        boards.push({ id: t.listId, name: listMap.get(t.listId) ?? "Deleted board" });
      }
    }
    return boards;
  }, [archivedTasks, listMap]);

  const hasFilters = search || priorityFilter.length > 0 || boardFilter || sort;

  function clearFilters() {
    setSearch("");
    setPriorityFilter([]);
    setBoardFilter("");
    setSort("");
  }

  return (
    <div className="flex flex-col gap-5 px-6 pb-6">
      {/* ── Search + filters ── */}
      <div className="flex flex-col gap-3">
        {/* Search bar */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived tasks…"
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 py-2.5 pl-9 pr-4 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority chips */}
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={`rounded-full px-3 py-1 font-[family-name:var(--font-delius)] text-xs transition-colors ${
                priorityFilter.includes(p)
                  ? "bg-foreground text-background"
                  : "bg-foreground/8 text-foreground/60 hover:bg-foreground/15"
              }`}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}

          {/* Board select */}
          {archivedBoards.length > 0 && (
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 font-[family-name:var(--font-delius)] text-xs text-foreground/60 outline-none focus:border-foreground/30"
            >
              <option value="">All boards</option>
              {archivedBoards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Sort select */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 font-[family-name:var(--font-delius)] text-xs text-foreground/60 outline-none focus:border-foreground/30"
          >
            <option value="">Sort by…</option>
            <option value="date-asc">Due date (earliest)</option>
            <option value="date-desc">Due date (latest)</option>
            <option value="hours-asc">Hours (fewest)</option>
            <option value="hours-desc">Hours (most)</option>
          </select>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full px-3 py-1 font-[family-name:var(--font-delius)] text-xs text-foreground/40 hover:text-foreground"
            >
              <X size={11} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <p className="font-[family-name:var(--font-delius)] text-foreground/40">Loading\u2026</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-foreground/15 py-24">
          <p className="font-[family-name:var(--font-delius)] text-sm text-foreground/40">
            {(archivedTasks as Task[]).length === 0
              ? "No archived tasks yet"
              : "No tasks match your filters"}
          </p>
        </div>
      ) : (
        <MasonryGrid gap="10px" minWidth={220}>
          {filtered.map((task) => (
            <ArchiveTaskCard
              key={task.id}
              task={task}
              boardName={listMap.get(task.listId) ?? "Deleted board"}
              onClick={setSelectedTask}
            />
          ))}
        </MasonryGrid>
      )}

      {/* Detail modal */}
      <ArchiveDetailModal
        task={selectedTask}
        lists={lists}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
