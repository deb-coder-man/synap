import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Runs daily at 03:00 UTC via Vercel cron (vercel.json).
// Archives every completed-but-not-yet-archived task across all users.
//
// SETUP REQUIRED: Set CRON_SECRET in your Vercel project environment variables.
// Vercel will automatically send `Authorization: Bearer <CRON_SECRET>` when
// triggering this route. Without it, the cron job will run but without auth protection.
// Generate a secret with: openssl rand -hex 32
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  // If CRON_SECRET is configured, enforce it. If not set, allow the request
  // (useful for local testing — set it in Vercel for production security).
  if (secret && authHeader !== `Bearer ${secret}`) {
    console.error("[cron] archive-completed: unauthorized request — check CRON_SECRET env var");
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();

  const result = await prisma.task.updateMany({
    where: {
      completed: true,
      archived: false,
    },
    data: {
      archived: true,
      completedAt: now,
    },
  });

  console.log(`[cron] archive-completed: archived ${result.count} task(s) at ${now.toISOString()}`);

  return Response.json({
    success: true,
    archivedCount: result.count,
    timestamp: now.toISOString(),
  });
}
