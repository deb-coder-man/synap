"use client";

import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateList, useDeleteList } from "@/app/hooks/useLists";
import type { List } from "@/lib/types";

type Props = {
  list: List;
  onEditList: () => void;
};

export default function ListOptionsMenu({ list, onEditList }: Props) {
  const { mutate: updateList } = useUpdateList();
  const { mutate: deleteList } = useDeleteList();

  function archiveAll() {
    updateList({ id: list.id, data: { archiveAllTasks: true } });
  }

  function handleDelete() {
    if (confirm(`Delete "${list.name}" and all its tasks? This cannot be undone.`)) {
      deleteList(list.id);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded p-1 text-background/80 hover:text-background focus:outline-none">
        <MoreVertical size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-[family-name:var(--font-delius)]">
        <DropdownMenuItem onClick={onEditList}>
          Edit name &amp; colour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={archiveAll}>
          Archive all tasks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-500 focus:text-red-500"
        >
          Delete list
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
