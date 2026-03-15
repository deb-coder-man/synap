"use client";

import { useRef, useState, useEffect } from "react";
import { X, Pipette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateList, useUpdateList } from "@/app/hooks/useLists";
import type { List } from "@/lib/types";

// Pre-defined colour palette (from Figma)
const PRESETS = [
  { value: "#a65a4c", label: "Rust"   },
  { value: "#5f7c95", label: "Blue"   },
  { value: "#8b6f8f", label: "Purple" },
  { value: "#6f8f6a", label: "Green"  },
  { value: "#1f1a17", label: "Dark"   },
];

const PRESET_VALUES = new Set(PRESETS.map((c) => c.value));

type Props = {
  open: boolean;
  onClose: () => void;
  editingList?: List | null;
  nextOrder?: number;
};

export default function CreateListModal({ open, onClose, editingList, nextOrder = 0 }: Props) {
  const [name, setName]     = useState("");
  const [colour, setColour] = useState(PRESETS[0].value);
  const colourInputRef      = useRef<HTMLInputElement>(null);

  const { mutate: createList, isPending: isCreating } = useCreateList();
  const { mutate: updateList, isPending: isUpdating } = useUpdateList();

  useEffect(() => {
    if (editingList) {
      setName(editingList.name);
      setColour(editingList.colour);
    } else {
      setName("");
      setColour(PRESETS[0].value);
    }
  }, [editingList, open]);

  const isPending  = isCreating || isUpdating;
  const isCustom   = !PRESET_VALUES.has(colour);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingList) {
      updateList({ id: editingList.id, data: { name: name.trim(), colour } }, { onSuccess: onClose });
    } else {
      createList({ name: name.trim(), colour, order: nextOrder }, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-xl border-none bg-background p-0 shadow-2xl">
        <DialogTitle className="sr-only">
          {editingList ? "Edit list" : "Create a list"}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
            <span className="font-[family-name:var(--font-delius)] text-xl font-bold text-foreground">
              {editingList ? "Edit list" : "New list"}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-foreground/50 transition-colors hover:bg-foreground/8 hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
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

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Preset swatches */}
                {PRESETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setColour(c.value)}
                    className={`size-9 rounded-full transition-all hover:scale-110 ${
                      colour === c.value
                        ? "ring-2 ring-offset-2 ring-foreground scale-110"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}

                {/* Divider */}
                <div className="h-6 w-px bg-foreground/15" />

                {/* Custom colour button — wraps a hidden <input type="color"> */}
                <button
                  type="button"
                  title="Custom colour"
                  onClick={() => colourInputRef.current?.click()}
                  className={`relative flex size-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
                    isCustom
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "border-2 border-dashed border-foreground/25 hover:border-foreground/50"
                  }`}
                  style={isCustom ? { backgroundColor: colour } : {}}
                >
                  {isCustom ? (
                    // Show the chosen custom colour — clicking opens picker again
                    <Pipette size={13} className="text-white drop-shadow-sm" />
                  ) : (
                    // Rainbow gradient ring to signal "pick any colour"
                    <span
                      className="size-5 rounded-full"
                      style={{
                        background:
                          "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                        opacity: 0.7,
                      }}
                    />
                  )}

                  {/* Hidden native colour input */}
                  <input
                    ref={colourInputRef}
                    type="color"
                    value={colour}
                    onChange={(e) => setColour(e.target.value)}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                  />
                </button>

                {/* Show the hex value when a custom colour is active */}
                {isCustom && (
                  <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/50 uppercase tracking-wider">
                    {colour}
                  </span>
                )}
              </div>
            </div>

            {/* Preview */}
            <div
              className="flex h-10 items-center rounded-[10px] px-4 font-[family-name:var(--font-delius)] text-lg text-background transition-colors"
              style={{ backgroundColor: colour }}
            >
              {name || "Preview"}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-lg bg-foreground px-6 py-2 font-[family-name:var(--font-delius)] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {isPending ? "Saving…" : editingList ? "Save changes" : "Create list"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
