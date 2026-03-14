"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUser, deleteUser } from "@/lib/api/user";
import type { UpdateUserInput } from "@/lib/types";

export const userKeys = {
  all: ["user"] as const,
};

export function useUser() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: getUser,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) => updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: deleteUser,
  });
}
