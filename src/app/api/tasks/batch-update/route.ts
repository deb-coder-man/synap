import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

type BatchUpdateItem = { id: string; urgent?: boolean; important?: boolean };

// POST /api/tasks/batch-update — batch update urgent/important flags
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const items = (await request.json()) as BatchUpdateItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    // Verify all referenced tasks belong to this user
    const ids = items.map((i) => i.id);
    const owned = await prisma.task.findMany({
      where: { id: { in: ids }, list: { userId } },
      select: { id: true },
    });
    if (owned.length !== ids.length) {
      return NextResponse.json({ error: "One or more tasks not found" }, { status: 404 });
    }

    // Run all updates in a single transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.task.update({
          where: { id: item.id },
          data: {
            ...(item.urgent !== undefined && { urgent: item.urgent }),
            ...(item.important !== undefined && { important: item.important }),
          },
        })
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to batch update tasks" }, { status: 500 });
  }
}
