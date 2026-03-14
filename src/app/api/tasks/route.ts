import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// GET /api/tasks — all tasks for the authenticated user
// Optional query param: ?listId=<id> to filter by list
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const listId = request.nextUrl.searchParams.get("listId") ?? undefined;
  const archivedParam = request.nextUrl.searchParams.get("archived");

  try {
    const tasks = await prisma.task.findMany({
      where: {
        list: { userId },
        ...(listId && { listId }),
        ...(archivedParam === "true" && { archived: true }),
        ...(archivedParam === "false" && { archived: false }),
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/tasks — create a new task
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const body = await request.json();
    const {
      listId,
      title,
      description,
      estimatedHours,
      dueDate,
      order,
      priority,
      urgent,
      important,
    } = body;

    if (!listId || !title) {
      return NextResponse.json(
        { error: "listId and title are required" },
        { status: 400 }
      );
    }

    // Verify the list belongs to the user
    const list = await prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        listId,
        title,
        description,
        estimatedHours,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        order: order ?? 0,
        priority: priority ?? "LOW",
        urgent: urgent ?? false,
        important: important ?? false,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
