"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLists, getList, createList, updateList, deleteList } from "@/lib/api/lists";
import { taskKeys } from "@/app/hooks/useTasks";
import type { CreateListInput, UpdateListInput } from "@/lib/types";

// Query key factory — keeps cache keys consistent across the app
export const listKeys = {
  all: ["lists"] as const,
  detail: (id: string) => ["lists", id] as const,
};

// ─── Fetch all lists ──────────────────────────────────────────────────────────
export function useLists() {
  return useQuery({
    queryKey: listKeys.all,
    queryFn: getLists,
  });
}

// ─── Fetch a single list ──────────────────────────────────────────────────────
export function useList(id: string) {
  return useQuery({
    queryKey: listKeys.detail(id),
    queryFn: () => getList(id),
    enabled: !!id,
  });
}

// ─── Create a list ────────────────────────────────────────────────────────────
export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListInput) => createList(data),
    onSuccess: () => {
      // Invalidate the list cache so the UI refetches the updated list
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

// ─── Update a list ────────────────────────────────────────────────────────────
export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListInput }) =>
      updateList(id, data),
    onSuccess: () => {
      // listKeys.all = ["lists"] prefix-matches listKeys.detail too
      queryClient.invalidateQueries({ queryKey: listKeys.all });
      // archiveAllTasks changes archived tasks — refresh the archive page cache
      queryClient.invalidateQueries({ queryKey: taskKeys.archived });
    },
  });
}

// ─── Delete a list — try this one yourself! ───────────────────────────────────
export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}
