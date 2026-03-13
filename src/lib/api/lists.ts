import type { List, CreateListInput, UpdateListInput } from "@/lib/types";

const BASE = "/api/lists";

// ─── GET all lists for the current user ───────────────────────────────────────
export async function getLists(): Promise<List[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch lists");
  return res.json();
}

// ─── GET a single list by id ──────────────────────────────────────────────────
export async function getList(id: string): Promise<List> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch list ${id}`);
  return res.json();
}

// ─── POST — create a new list ─────────────────────────────────────────────────
export async function createList(data: CreateListInput): Promise<List> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create list");
  return res.json();
}

// ─── PATCH — update an existing list ─────────────────────────────────────────
export async function updateList(
  id: string,
  data: UpdateListInput
): Promise<List> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update list ${id}`);
  return res.json();
}

// ─── DELETE — try this one yourself! ─────────────────────────────────────────
export async function deleteList(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to delete list ${id}`);
  return res.json();
}

