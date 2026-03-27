"use client";

import { useRef, useEffect, useState } from "react";
import { Check, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCreateTask } from "@/app/hooks/useTasks";
import { toast } from "sonner";
import type { Priority } from "@/lib/types";

type Props = {
  listId: string;
  onCancel: () => void;
};

const EST_HOURS_OPTIONS = [
  { label: "30 min", value: "0.5" },
  { label: "1 hour", value: "1" },
  { label: "2 hours", value: "2" },
  { label: "3 hours", value: "3" },
  { label: "4+ hours", value: "4" },
];

export default function InlineTaskCreator({ listId, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("LOW");
  const [estHours, setEstHours] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const { mutate: createTask, isPending } = useCreateTask();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    if (!title.trim() || isPending) return;

    createTask(
      {
        listId,
        title: title.trim(),
        priority,
        estimatedHours: estHours ? parseFloat(estHours) : undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Task created");
          onCancel();
        },
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-[10px] bg-background px-[13px] py-[11px] shadow-sm ring-1 ring-foreground/10">
      {/* Title input */}
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Task title…"
        className="w-full bg-transparent font-[family-name:var(--font-delius)] text-sm text-foreground placeholder:text-foreground/40 outline-none"
      />

      {/* Dropdowns row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Priority */}
        <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <SelectTrigger className="h-7 w-[90px] border-foreground/15 bg-transparent font-[family-name:var(--font-delius)] text-xs text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="font-[family-name:var(--font-delius)] text-xs">
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Estimated time */}
        <Select value={estHours} onValueChange={(v) => setEstHours(v ?? "")}>
          <SelectTrigger className="h-7 w-[96px] border-foreground/15 bg-transparent font-[family-name:var(--font-delius)] text-xs text-foreground">
            <SelectValue placeholder="Est. time" />
          </SelectTrigger>
          <SelectContent className="font-[family-name:var(--font-delius)] text-xs">
            {EST_HOURS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Due date */}
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger
            className="flex h-7 items-center gap-1 rounded-md border border-foreground/15 px-2 font-[family-name:var(--font-delius)] text-xs text-foreground hover:bg-foreground/5"
          >
            <CalendarIcon size={11} className="opacity-60" />
            {dueDate ? format(dueDate, "MMM d") : "Due date"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background" side="bottom" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(d) => { setDueDate(d); setCalOpen(false); }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear due date */}
        {dueDate && (
          <button
            type="button"
            onClick={() => setDueDate(undefined)}
            className="text-foreground/40 hover:text-foreground/70"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim() || isPending}
          className="flex items-center gap-1 rounded-md bg-foreground px-3 py-1 font-[family-name:var(--font-delius)] text-xs text-background disabled:opacity-40"
        >
          <Check size={11} />
          {isPending ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 text-foreground/50 hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
