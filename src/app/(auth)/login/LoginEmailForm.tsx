"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Tab = "password" | "magic";

export default function LoginEmailForm() {
  const [tab, setTab]           = useState<Tab>("password");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (!res?.ok) {
      setError("Invalid email or password.");
    } else {
      window.location.href = "/board";
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/board",
    });
    setLoading(false);
    if (res?.error) {
      setError("Could not send magic link. Please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div
        className="mb-4 flex rounded-xl p-1"
        style={{ backgroundColor: "#1f1a17", opacity: 1 }}
      >
        {(["password", "magic"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(""); setSent(false); }}
            className="flex-1 rounded-lg py-2 font-[family-name:var(--font-delius)] text-sm transition-colors cursor-pointer"
            style={{
              backgroundColor: tab === t ? "#f6f0e6" : "transparent",
              color: tab === t ? "#1f1a17" : "#f6f0e6cc",
            }}
          >
            {t === "password" ? "Password" : "Magic link"}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "#e53e3e55", backgroundColor: "#fff5f5", color: "#c53030" }}
        >
          {error}
        </div>
      )}

      {tab === "password" ? (
        <form onSubmit={handlePassword} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border px-4 py-3 font-[family-name:var(--font-delius)] text-sm outline-none transition-colors"
            style={{
              backgroundColor: "#fdfaf5",
              borderColor: "#1f1a1720",
              color: "#1f1a17",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1f1a1760")}
            onBlur={(e) => (e.target.style.borderColor = "#1f1a1720")}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border px-4 py-3 font-[family-name:var(--font-delius)] text-sm outline-none transition-colors"
            style={{
              backgroundColor: "#fdfaf5",
              borderColor: "#1f1a1720",
              color: "#1f1a17",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1f1a1760")}
            onBlur={(e) => (e.target.style.borderColor = "#1f1a1720")}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-delius)] text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "#1f1a17", color: "#f6f0e6" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : sent ? (
        <div
          className="rounded-xl border px-5 py-4 text-center font-[family-name:var(--font-delius)] text-sm"
          style={{ borderColor: "#1f1a1720", color: "#1f1a17aa" }}
        >
          Check your inbox — a magic link is on its way to <strong style={{ color: "#1f1a17" }}>{email}</strong>.
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border px-4 py-3 font-[family-name:var(--font-delius)] text-sm outline-none transition-colors"
            style={{
              backgroundColor: "#fdfaf5",
              borderColor: "#1f1a1720",
              color: "#1f1a17",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1f1a1760")}
            onBlur={(e) => (e.target.style.borderColor = "#1f1a1720")}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-delius)] text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "#1f1a17", color: "#f6f0e6" }}
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}
    </div>
  );
}
