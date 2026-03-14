import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/lists/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id } = await params;

  try {
    const list = await prisma.list.findFirst({
      where: { id, userId },
      include: {
        tasks: {
          where: { archived: false },
          orderBy: { order: "asc" },
        },
      },
    });
    if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
  }
}

// PATCH /api/lists/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, colour, order, archiveAllTasks } = body;

    // Bulk archive all non-archived tasks in this list (ownership verified by userId join below)
    if (archiveAllTasks) {
      await prisma.task.updateMany({
        where: { listId: id, archived: false, list: { userId } },
        data: { archived: true, completed: true, completedAt: new Date() },
      });
    }

    // Combine ownership check + update into a single query via updateMany
    const result = await prisma.list.updateMany({
      where: { id, userId },
      data: {
        ...(name !== undefined && { name }),
        ...(colour !== undefined && { colour }),
        ...(order !== undefined && { order }),
      },
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.list.findUnique({
      where: { id },
      include: {
        tasks: {
          where: { archived: false },
          orderBy: [{ completed: "asc" }, { order: "asc" }],
        },
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update list" }, { status: 500 });
  }
}

// DELETE /api/lists/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id } = await params;

  try {
    // Combine ownership check + delete into a single query via deleteMany
    const result = await prisma.list.deleteMany({ where: { id, userId } });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }
}
