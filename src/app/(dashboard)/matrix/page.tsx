export default function MatrixPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Prioritisation Matrix
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View your tasks grouped by urgency and importance
        </p>
      </div>

      {/* Eisenhower matrix grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Do First",
            desc: "Urgent & Important",
            color: "border-red-200 bg-red-50",
          },
          {
            label: "Schedule",
            desc: "Not Urgent & Important",
            color: "border-blue-200 bg-blue-50",
          },
          {
            label: "Delegate",
            desc: "Urgent & Not Important",
            color: "border-yellow-200 bg-yellow-50",
          },
          {
            label: "Eliminate",
            desc: "Not Urgent & Not Important",
            color: "border-gray-200 bg-gray-50",
          },
        ].map(({ label, desc, color }) => (
          <div
            key={label}
            className={`rounded-xl border p-6 ${color}`}
          >
            <h2 className="font-semibold text-gray-900">{label}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
            <div className="mt-4 text-sm text-gray-400">No tasks yet</div>
          </div>
        ))}
      </div>
    </div>
  );
}
