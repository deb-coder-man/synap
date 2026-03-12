import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// GET /api/lists — all lists for the authenticated user
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const lists = await prisma.list.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(lists);
  } catch {
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 });
  }
}

// POST /api/lists — create a new list
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const body = await request.json();
    const { name, colour, order } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const list = await prisma.list.create({
      data: {
        name,
        colour: colour ?? "#e5e7eb",
        order: order ?? 0,
        userId,
      },
    });
    return NextResponse.json(list, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }
}
