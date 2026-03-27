import type { Task } from "@/lib/types";

export async function prioritiseTasks(
  hours: number,
  tasks: Task[]
): Promise<string[]> {
  const res = await fetch("/api/prioritisation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hours, tasks }),
  });

  const json = (await res.json()) as { orderedIds?: string[]; error?: string };
  if (!res.ok || !json.orderedIds) {
    throw new Error(json.error ?? "Failed to prioritise tasks");
  }

  return json.orderedIds;
}
