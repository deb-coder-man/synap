export default function ActionPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Action Planner</h1>
        <p className="mt-1 text-sm text-gray-500">
          Get a prioritised order to complete your tasks
        </p>
      </div>

      {/* Action planner config */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-700">
          Session Settings
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Hours available
            </label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              defaultValue={2}
              className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="rounded" />
            Deep work session
          </label>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
            Generate plan
          </button>
        </div>
      </div>

      {/* Task order will appear here */}
      <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-sm text-gray-400">
        Configure your session above to generate a task plan
      </div>
    </div>
  );
}
