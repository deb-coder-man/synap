import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// GET /api/settings — get settings for the authenticated user (auto-creates defaults)
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PATCH /api/settings — update settings for the authenticated user
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const body = await request.json();
    const { backgroundColor, textColor, fontFamily, pomodoroFocusDuration, pomodoroShortBreak, pomodoroLongBreak } = body;

    const patch = {
      ...(backgroundColor        !== undefined && { backgroundColor        }),
      ...(textColor              !== undefined && { textColor              }),
      ...(fontFamily             !== undefined && { fontFamily             }),
      ...(pomodoroFocusDuration  !== undefined && { pomodoroFocusDuration  }),
      ...(pomodoroShortBreak     !== undefined && { pomodoroShortBreak     }),
      ...(pomodoroLongBreak      !== undefined && { pomodoroLongBreak      }),
    };

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...patch },
      update: patch,
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
