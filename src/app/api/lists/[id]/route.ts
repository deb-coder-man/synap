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
      include: { tasks: { orderBy: { order: "asc" } } },
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
    const { name, colour, order } = body;

    // Verify ownership before updating
    const existing = await prisma.list.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.list.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(colour !== undefined && { colour }),
        ...(order !== undefined && { order }),
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
    const existing = await prisma.list.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.list.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }
}
