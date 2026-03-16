"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, getArchivedTasks, getTask, createTask, updateTask, deleteTask } from "@/lib/api/tasks";
import type { CreateTaskInput, UpdateTaskInput, Task, List } from "@/lib/types";

export const taskKeys = {
  all: ["tasks"] as const,
  archived: ["tasks", { archived: true }] as const,
  byList: (listId: string) => ["tasks", { listId }] as const,
  detail: (id: string) => ["tasks", id] as const,
};

type ListWithTasks = List & { tasks: Task[] };

// ─── Fetch all tasks (optionally filtered by list) ────────────────────────────
export function useTasks(listId?: string) {
  return useQuery({
    queryKey: listId ? taskKeys.byList(listId) : taskKeys.all,
    queryFn: () => getTasks(listId),
  });
}

// ─── Fetch archived tasks ─────────────────────────────────────────────────────
export function useArchivedTasks() {
  return useQuery({
    queryKey: taskKeys.archived,
    queryFn: getArchivedTasks,
  });
}

// ─── Fetch a single task ──────────────────────────────────────────────────────
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    enabled: !!id,
  });
}

// ─── Create a task ────────────────────────────────────────────────────────────
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["lists"] });
      const previous = queryClient.getQueryData<ListWithTasks[]>(["lists"]);

      const tempTask: Task = {
        id: `temp-${Date.now()}`,
        listId: data.listId,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? "LOW",
        estimatedHours: data.estimatedHours ?? null,
        dueDate: data.dueDate ?? null,
        order: data.order ?? 9999,
        urgent: data.urgent ?? false,
        important: data.important ?? false,
        completed: false,
        completedAt: null,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ListWithTasks[]>(["lists"], (old) =>
        old?.map((list) =>
          list.id === data.listId
            ? { ...list, tasks: [...list.tasks, tempTask] }
            : list
        )
      );

      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lists"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

// ─── Update a task ────────────────────────────────────────────────────────────
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["lists"] });
      const previous = queryClient.getQueryData<ListWithTasks[]>(["lists"]);

      queryClient.setQueryData<ListWithTasks[]>(["lists"], (old) =>
        old?.map((list) => ({
          ...list,
          tasks: list.tasks.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lists"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

// ─── Delete a task permanently ────────────────────────────────────────────────
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["lists"] });
      const previous = queryClient.getQueryData<ListWithTasks[]>(["lists"]);

      queryClient.setQueryData<ListWithTasks[]>(["lists"], (old) =>
        old?.map((list) => ({
          ...list,
          tasks: list.tasks.filter((t) => t.id !== id),
        }))
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lists"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: taskKeys.archived });
    },
  });
}
