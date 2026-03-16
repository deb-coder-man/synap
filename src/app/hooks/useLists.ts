"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLists, getList, createList, updateList, deleteList } from "@/lib/api/lists";
import { taskKeys } from "@/app/hooks/useTasks";
import type { CreateListInput, UpdateListInput, List, Task } from "@/lib/types";

// Query key factory — keeps cache keys consistent across the app
export const listKeys = {
  all: ["lists"] as const,
  detail: (id: string) => ["lists", id] as const,
};

type ListWithTasks = List & { tasks: Task[] };

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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      const previous = queryClient.getQueryData<ListWithTasks[]>(listKeys.all);

      const tempList: ListWithTasks = {
        id: `temp-${Date.now()}`,
        name: data.name,
        colour: data.colour,
        order: data.order ?? 9999,
        userId: "",
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ListWithTasks[]>(listKeys.all, (old) =>
        [...(old ?? []), tempList]
      );

      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKeys.all, context.previous);
      }
    },
    onSettled: () => {
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
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      const previous = queryClient.getQueryData<ListWithTasks[]>(listKeys.all);

      queryClient.setQueryData<ListWithTasks[]>(listKeys.all, (old) =>
        old?.map((list) =>
          list.id === id ? { ...list, ...data } : list
        )
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.archived });
    },
  });
}

// ─── Delete a list ────────────────────────────────────────────────────────────
export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteList(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      const previous = queryClient.getQueryData<ListWithTasks[]>(listKeys.all);

      queryClient.setQueryData<ListWithTasks[]>(listKeys.all, (old) =>
        old?.filter((list) => list.id !== id)
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}
