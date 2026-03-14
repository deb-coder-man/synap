import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

type ReorderItem = { id: string; order: number };

// POST /api/lists/reorder — batch update list order
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const items = (await request.json()) as ReorderItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    // Verify all referenced lists belong to this user
    const ids = items.map((i) => i.id);
    const owned = await prisma.list.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    if (owned.length !== ids.length) {
      return NextResponse.json({ error: "One or more lists not found" }, { status: 404 });
    }

    // Run all updates in a single transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.list.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to reorder lists" }, { status: 500 });
  }
}
