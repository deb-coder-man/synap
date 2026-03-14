"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, getArchivedTasks, getTask, createTask, updateTask, deleteTask } from "@/lib/api/tasks";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/types";

export const taskKeys = {
  all: ["tasks"] as const,
  archived: ["tasks", { archived: true }] as const,
  byList: (listId: string) => ["tasks", { listId }] as const,
  detail: (id: string) => ["tasks", id] as const,
};

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
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.byList(newTask.listId) });
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
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.archived });
      queryClient.invalidateQueries({ queryKey: taskKeys.byList(updatedTask.listId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(updatedTask.id) });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

// ─── Delete a task permanently ────────────────────────────────────────────────
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.archived });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}
