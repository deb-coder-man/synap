import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id } = await params;

  try {
    const task = await prisma.task.findFirst({
      where: { id, list: { userId } },
    });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      estimatedHours,
      dueDate,
      order,
      listId,
      priority,
      urgent,
      important,
      completed,
      completedAt,
      archived,
    } = body;

    // Verify ownership before updating
    const existing = await prisma.task.findFirst({
      where: { id, list: { userId } },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If moving to a different list, verify the new list also belongs to the user
    if (listId && listId !== existing.listId) {
      const newList = await prisma.list.findFirst({ where: { id: listId, userId } });
      if (!newList) return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(order !== undefined && { order }),
        ...(listId !== undefined && { listId }),
        ...(priority !== undefined && { priority }),
        ...(urgent !== undefined && { urgent }),
        ...(important !== undefined && { important }),
        ...(completed !== undefined && { completed }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(archived !== undefined && { archived }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id } = await params;

  try {
    const existing = await prisma.task.findFirst({
      where: { id, list: { userId } },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
