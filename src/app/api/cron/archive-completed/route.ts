import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Runs daily at 03:00 UTC via Vercel cron (vercel.json).
// Archives every completed-but-not-yet-archived task across all users.
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel's cron scheduler.
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date().toISOString();

  const result = await prisma.task.updateMany({
    where: {
      completed: true,
      archived: false,
    },
    data: {
      archived: true,
      // Ensure completedAt is stamped if it was somehow missed
      completedAt: now,
    },
  });

  console.log(`[cron] archive-completed: archived ${result.count} task(s) at ${now}`);

  return Response.json({
    success: true,
    archivedCount: result.count,
    timestamp: now,
  });
}
