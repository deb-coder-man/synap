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
      <div className="mb-4 flex rounded-xl bg-[#1f1a17] p-1">
        {(["password", "magic"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(""); setSent(false); }}
            className={`flex-1 rounded-lg py-2 font-[family-name:var(--font-delius)] text-sm transition-colors cursor-pointer ${
              tab === t
                ? "bg-[#f6f0e6] text-[#1f1a17]"
                : "bg-transparent text-[#f6f0e6]/80 hover:text-[#f6f0e6]"
            }`}
          >
            {t === "password" ? "Password" : "Magic link"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-[family-name:var(--font-delius)] text-sm text-red-700">
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
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : sent ? (
        <div className="rounded-xl border border-[#1f1a17]/10 bg-[#fdfaf5] px-5 py-4 text-center font-[family-name:var(--font-delius)] text-sm text-[#1f1a17]/60">
          Check your inbox — a magic link is on its way to{" "}
          <strong className="text-[#1f1a17]">{email}</strong>.
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}
    </div>
  );
}
