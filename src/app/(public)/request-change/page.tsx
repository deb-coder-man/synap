export default function RequestChangePage() {
  return (
    <div className="flex flex-col gap-8" style={{ color: "#1f1a17" }}>
      <div>
        <h1 className="font-[family-name:var(--font-delius)] text-4xl font-bold">Request a Change</h1>
        <p className="mt-2 font-[family-name:var(--font-delius)] text-sm" style={{ color: "#1f1a1766" }}>
          Have a feature request, bug report, or feedback? Let us know below.
        </p>
      </div>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-[family-name:var(--font-delius)] text-xs" style={{ color: "#1f1a1766" }}>
            Your name
          </label>
          <input
            type="text"
            placeholder="Full name"
            className="w-full rounded-xl border px-4 py-3 font-[family-name:var(--font-delius)] text-sm outline-none"
            style={{ backgroundColor: "#fdfaf5", borderColor: "#1f1a1720", color: "#1f1a17" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-[family-name:var(--font-delius)] text-xs" style={{ color: "#1f1a1766" }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border px-4 py-3 font-[family-name:var(--font-delius)] text-sm outline-none"
            style={{ backgroundColor: "#fdfaf5", borderColor: "#1f1a1720", color: "#1f1a17" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-[family-name:var(--font-delius)] text-xs" style={{ color: "#1f1a1766" }}>
            Type
          </label>
          <select
            className="w-full rounded-xl border px-4 py-3 font-[family-name:var(--font-delius)] text-sm outline-none"
            style={{ backgroundColor: "#fdfaf5", borderColor: "#1f1a1720", color: "#1f1a17" }}
          >
            <option>Feature request</option>
            <option>Bug report</option>
            <option>General feedback</option>
            <option>Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-[family-name:var(--font-delius)] text-xs" style={{ color: "#1f1a1766" }}>
            Message
          </label>
          <textarea
            rows={6}
            placeholder="Describe your request or feedback in detail…"
            className="w-full resize-none rounded-xl border px-4 py-3 font-[family-name:var(--font-delius)] text-sm outline-none"
            style={{ backgroundColor: "#fdfaf5", borderColor: "#1f1a1720", color: "#1f1a17" }}
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-delius)] text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#1f1a17", color: "#f6f0e6" }}
        >
          Send request
        </button>
      </form>
    </div>
  );
}
