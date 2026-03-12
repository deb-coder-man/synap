export default function ArchivePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Archive</h1>
        <p className="mt-1 text-sm text-gray-500">
          All your completed and archived tasks
        </p>
      </div>

      {/* Archive list will go here */}
      <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-sm text-gray-400">
        No archived tasks yet
      </div>
    </div>
  );
}
