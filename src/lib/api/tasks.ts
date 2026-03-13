import type { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/types";

const BASE = "/api/tasks";

// ─── GET all tasks for the current user ───────────────────────────────────────
// Pass a listId to filter to a specific list.
export async function getTasks(listId?: string): Promise<Task[]> {
  const url = listId ? `${BASE}?listId=${listId}` : BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

// ─── GET a single task by id ──────────────────────────────────────────────────
export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch task ${id}`);
  return res.json();
}

// ─── POST — create a new task ─────────────────────────────────────────────────
export async function createTask(data: CreateTaskInput): Promise<Task> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

// ─── PATCH — update an existing task ─────────────────────────────────────────
export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<Task> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update task ${id}`);
  return res.json();
}

// ─── DELETE — try this one yourself! ─────────────────────────────────────────
// Hint: send a DELETE request to `${BASE}/${id}`. A 204 means success.
// export async function deleteTask(id: string): Promise<void> {
//   ...
// }
export async function deleteTask(
  id: string
) : Promise<void> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to delete task ${id}`);
  return res.json();
}
