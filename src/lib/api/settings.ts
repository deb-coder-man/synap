import type { UserSettings, UpdateSettingsInput } from "@/lib/types";

const BASE = "/api/settings";

// ─── GET the current user's settings ─────────────────────────────────────────
export async function getSettings(): Promise<UserSettings> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

// ─── PATCH — update (or create on first save) user settings ──────────────────
export async function updateSettings(
  data: UpdateSettingsInput
) : Promise<UserSettings> {
  const res = await fetch(BASE, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  )
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
} 
