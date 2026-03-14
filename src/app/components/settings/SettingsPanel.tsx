"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, Camera, Trash2, LogOut, Clock } from "lucide-react";
import { signOut } from "next-auth/react";
import { useUser, useUpdateUser, useDeleteUser } from "@/app/hooks/useUser";
import { useSettings, useUpdateSettings } from "@/app/hooks/useSettings";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsPanel({ open, onClose }: Props) {
  const { data: user }                         = useUser();
  const { data: settings }                     = useSettings();
  const { mutate: updateUser,    isPending: savingUser }     = useUpdateUser();
  const { mutate: updateSettings, isPending: savingSettings } = useUpdateSettings();
  const { mutate: deleteUser,    isPending: deleting }        = useDeleteUser();

  // ── Profile fields ────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [username,  setUsername]  = useState("");
  const [imageUrl,  setImageUrl]  = useState("");
  const [editError, setEditError] = useState("");

  // ── Pomodoro fields ───────────────────────────────────────────────────────
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreak,    setShortBreak]    = useState(5);
  const [longBreak,     setLongBreak]     = useState(15);

  // ── Delete confirmation ───────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync from API data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName   ?? "");
      setUsername(user.username   ?? "");
      setImageUrl(user.image      ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setFocusDuration(settings.pomodoroFocusDuration);
      setShortBreak(settings.pomodoroShortBreak);
      setLongBreak(settings.pomodoroLongBreak);
    }
  }, [settings]);

  function handleSaveProfile() {
    setEditError("");
    updateUser(
      { firstName, lastName, username: username.trim() || undefined, image: imageUrl || undefined },
      { onError: (e) => setEditError(e.message) }
    );
  }

  function handleSavePomodoro() {
    updateSettings({ pomodoroFocusDuration: focusDuration, pomodoroShortBreak: shortBreak, pomodoroLongBreak: longBreak });
  }

  function handleDeleteAccount() {
    deleteUser(undefined, {
      onSuccess: () => signOut({ callbackUrl: "/login" }),
    });
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col overflow-y-auto bg-background shadow-2xl pb-[76px] sm:pb-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-7 py-5">
          <h2 className="font-[family-name:var(--font-delius)] text-xl font-bold text-foreground">Settings</h2>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-8 px-7 py-6">

          {/* ── Profile ── */}
          <section className="flex flex-col gap-4">
            <h3 className="font-[family-name:var(--font-delius)] text-sm font-bold uppercase tracking-wider text-foreground/40">
              Profile
            </h3>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="avatar" width={64} height={64} loading="lazy" className="size-16 rounded-full object-cover" />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-foreground/10">
                    <User size={28} className="text-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-[family-name:var(--font-delius)] text-sm font-bold text-foreground">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "—"}
                </p>
                <p className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">{user?.email}</p>
              </div>
            </div>

            {/* Image URL */}
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Profile picture URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/40"
              />
            </div>

            {/* Name row */}
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none focus:border-foreground/40"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none focus:border-foreground/40"
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. synapper"
                className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/40"
              />
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">Email</label>
              <input
                value={user?.email ?? ""}
                readOnly
                className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground/50 outline-none"
              />
            </div>

            {editError && (
              <p className="font-[family-name:var(--font-delius)] text-xs text-red-500">{editError}</p>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={savingUser}
              className="self-end rounded-lg bg-foreground px-5 py-2 font-[family-name:var(--font-delius)] text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {savingUser ? "Saving…" : "Save profile"}
            </button>
          </section>

          {/* Divider */}
          <div className="h-px bg-foreground/10" />

          {/* ── Pomodoro ── */}
          <section className="flex flex-col gap-4">
            <h3 className="font-[family-name:var(--font-delius)] text-sm font-bold uppercase tracking-wider text-foreground/40">
              Pomodoro
            </h3>

            {[
              { label: "Focus duration",  value: focusDuration, set: setFocusDuration, min: 1, max: 120 },
              { label: "Short break",     value: shortBreak,    set: setShortBreak,    min: 1, max: 30  },
              { label: "Long break",      value: longBreak,     set: setLongBreak,     min: 1, max: 60  },
            ].map(({ label, value, set, min, max }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/70">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => set(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
                    className="w-16 rounded-lg border border-foreground/15 bg-transparent px-2 py-1.5 text-center font-[family-name:var(--font-delius)] text-sm text-foreground outline-none focus:border-foreground/40"
                  />
                  <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/40">min</span>
                </div>
              </div>
            ))}

            <button
              onClick={handleSavePomodoro}
              disabled={savingSettings}
              className="self-end rounded-lg bg-foreground px-5 py-2 font-[family-name:var(--font-delius)] text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {savingSettings ? "Saving…" : "Save timer"}
            </button>
          </section>

          {/* Divider */}
          <div className="h-px bg-foreground/10" />

          {/* ── Account ── */}
          <section className="flex flex-col gap-3">
            <h3 className="font-[family-name:var(--font-delius)] text-sm font-bold uppercase tracking-wider text-foreground/40">
              Account
            </h3>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 rounded-lg border border-foreground/15 px-4 py-2.5 font-[family-name:var(--font-delius)] text-sm text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <LogOut size={15} />
              Sign out
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2.5 font-[family-name:var(--font-delius)] text-sm text-red-500/70 transition-colors hover:border-red-500/40 hover:text-red-500"
              >
                <Trash2 size={15} />
                Delete account
              </button>
            ) : (
              <div className="flex flex-col gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="font-[family-name:var(--font-delius)] text-sm text-foreground/70">
                  This will permanently delete your account and all data. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-lg border border-foreground/15 py-2 font-[family-name:var(--font-delius)] text-sm text-foreground/50 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 rounded-lg bg-red-500 py-2 font-[family-name:var(--font-delius)] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {deleting ? "Deleting…" : "Confirm delete"}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* bottom padding */}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
}
