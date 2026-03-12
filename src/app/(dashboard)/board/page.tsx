import { auth } from "@/auth";

export default async function BoardPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Board</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your tasks in lists
        </p>
      </div>

      {/* Board content will go here */}
      <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-sm text-gray-400">
        Board coming soon
      </div>
    </div>
  );
}
