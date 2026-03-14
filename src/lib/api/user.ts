import type { UserProfile, UpdateUserInput } from "@/lib/types";

const BASE = "/api/user";

export async function getUser(): Promise<UserProfile> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function updateUser(data: UpdateUserInput): Promise<UserProfile> {
  const res = await fetch(BASE, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to update user");
  }
  return res.json();
}

export async function deleteUser(): Promise<void> {
  const res = await fetch(BASE, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete account");
}
