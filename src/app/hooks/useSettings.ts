"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/api/settings";
import type { UpdateSettingsInput } from "@/lib/types";

export const settingsKeys = {
  all: ["settings"] as const,
};

// ─── Fetch current user's settings ───────────────────────────────────────────
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: getSettings,
  });
}

// ─── Update settings — try this one yourself! ────────────────────────────────
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
