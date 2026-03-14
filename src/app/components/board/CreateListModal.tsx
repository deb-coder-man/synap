"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateList, useUpdateList } from "@/app/hooks/useLists";
import type { List } from "@/lib/types";

// Pre-defined colour palette (from Figma)
const COLOURS = [
  { value: "#a65a4c", label: "Rust"   },
  { value: "#5f7c95", label: "Blue"   },
  { value: "#8b6f8f", label: "Purple" },
  { value: "#6f8f6a", label: "Green"  },
  { value: "#1f1a17", label: "Dark"   },
];

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pass an existing list to edit it instead of creating */
  editingList?: List | null;
  /** Next order value when creating */
  nextOrder?: number;
};

export default function CreateListModal({ open, onClose, editingList, nextOrder = 0 }: Props) {
  const [name, setName]     = useState("");
  const [colour, setColour] = useState(COLOURS[0].value);

  const { mutate: createList, isPending: isCreating } = useCreateList();
  const { mutate: updateList, isPending: isUpdating } = useUpdateList();

  // Pre-fill when editing
  useEffect(() => {
    if (editingList) {
      setName(editingList.name);
      setColour(editingList.colour);
    } else {
      setName("");
      setColour(COLOURS[0].value);
    }
  }, [editingList, open]);

  const isPending = isCreating || isUpdating;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingList) {
      updateList(
        { id: editingList.id, data: { name: name.trim(), colour } },
        { onSuccess: onClose }
      );
    } else {
      createList(
        { name: name.trim(), colour, order: nextOrder },
        { onSuccess: onClose }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm rounded-xl border-none bg-background p-0 shadow-2xl">
        <DialogTitle className="sr-only">
          {editingList ? "Edit list" : "Create a list"}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
            <span className="font-[family-name:var(--font-delius)] text-xl font-bold text-foreground">
              {editingList ? "Edit list" : "New list"}
            </span>
            <button type="button" onClick={onClose} className="text-foreground/60 hover:text-foreground">
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/60">
                List name
              </label>
              <Input
                autoFocus
                placeholder="e.g. Work, Personal…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-transparent font-[family-name:var(--font-delius)] text-foreground focus-visible:ring-foreground/30"
              />
            </div>

            {/* Colour picker */}
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/60">
                Colour
              </label>
              <div className="flex gap-3">
                {COLOURS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setColour(c.value)}
                    className={`size-9 rounded-full transition-transform hover:scale-110 ${
                      colour === c.value ? "ring-2 ring-offset-2 ring-foreground" : ""
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div
              className="flex h-10 items-center rounded-[10px] px-4 font-[family-name:var(--font-delius)] text-lg text-background"
              style={{ backgroundColor: colour }}
            >
              {name || "Preview"}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-lg bg-foreground px-6 py-2 font-[family-name:var(--font-delius)] text-background hover:opacity-90 disabled:opacity-40"
            >
              {isPending ? "Saving…" : editingList ? "Save changes" : "Create list"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
