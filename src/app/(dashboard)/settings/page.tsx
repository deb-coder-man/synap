export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customise your Synap experience
        </p>
      </div>

      <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-700">Appearance</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Background colour
            </label>
            <input
              type="color"
              defaultValue="#ffffff"
              className="h-9 w-full cursor-pointer rounded-lg border border-gray-200 p-1"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Primary text colour
            </label>
            <input
              type="color"
              defaultValue="#111111"
              className="h-9 w-full cursor-pointer rounded-lg border border-gray-200 p-1"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Font</label>
            <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400">
              <option>Inter</option>
              <option>Geist</option>
              <option>DM Sans</option>
              <option>Roboto</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
