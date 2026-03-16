"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/api/settings";
import type { UpdateSettingsInput, UserSettings } from "@/lib/types";

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

// ─── Update settings ──────────────────────────────────────────────────────────
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => updateSettings(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.all });
      const previous = queryClient.getQueryData<UserSettings>(settingsKeys.all);

      queryClient.setQueryData<UserSettings>(settingsKeys.all, (old) =>
        old ? { ...old, ...data } : old
      );

      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
