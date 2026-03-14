"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const COLOURS = [
  { name: "Rust",   hex: "#a65a4c" },
  { name: "Blue",   hex: "#5f7c95" },
  { name: "Purple", hex: "#8b6f8f" },
  { name: "Green",  hex: "#6f8f6a" },
  { name: "Dark",   hex: "#1f1a17" },
];

type Props = {
  title: string;
  colour: string;
  onSave: (title: string, colour: string) => void;
};

export default function QuadrantOptionsMenu({ title, colour, onSave }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftColour, setDraftColour] = useState(colour);

  function handleOpen() {
    setDraftTitle(title);
    setDraftColour(colour);
    setEditOpen(true);
  }

  function handleSave() {
    onSave(draftTitle.trim() || title, draftColour);
    setEditOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-background/70 transition-colors hover:text-background">
          <MoreVertical size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem onClick={handleOpen}>
            Edit title & colour
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={(v) => !v && setEditOpen(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl"
        >
          <DialogTitle className="sr-only">Edit quadrant</DialogTitle>

          <div className="flex flex-col gap-6 px-8 py-6">
            {/* Title input */}
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/60">
                Title
              </label>
              <Input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="rounded-none border-0 border-b bg-transparent px-0 font-[family-name:var(--font-delius)] text-xl text-foreground focus-visible:border-foreground/60 focus-visible:ring-0"
              />
            </div>

            {/* Colour picker */}
            <div className="flex flex-col gap-3">
              <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/60">
                Colour
              </label>
              <div className="flex gap-3">
                {COLOURS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setDraftColour(c.hex)}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      draftColour === c.hex ? "ring-2 ring-foreground ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="font-[family-name:var(--font-delius)] text-sm text-foreground/60 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-foreground px-4 py-1.5 font-[family-name:var(--font-delius)] text-sm text-background hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
