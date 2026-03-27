"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success("Feedback sent — thanks!");
      setMessage("");
      onClose();
    } catch {
      toast.error("Couldn't send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-[480px] rounded-xl border-none bg-background p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Send Feedback</DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
            <span className="font-[family-name:var(--font-delius)] text-lg font-bold text-foreground">
              Send Feedback
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-foreground/50 hover:bg-foreground/8 hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground placeholder:text-foreground/30 focus-visible:ring-foreground/30"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Email (optional)</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground placeholder:text-foreground/30 focus-visible:ring-foreground/30"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="What's on your mind?"
                rows={5}
                className="resize-none border border-foreground/20 bg-transparent font-[family-name:var(--font-delius)] text-foreground placeholder:text-foreground/30 focus-visible:ring-foreground/30"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || !message.trim() || sending}
              className="ml-auto rounded-lg bg-foreground px-5 py-2 font-[family-name:var(--font-delius)] text-sm text-background hover:opacity-90 disabled:opacity-40"
            >
              {sending ? "Sending…" : "Send feedback"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
