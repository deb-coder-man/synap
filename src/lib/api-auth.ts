import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Returns the authenticated user's ID, or a 401 NextResponse if not signed in.
 * Usage:
 *   const result = await requireAuth();
 *   if (result instanceof NextResponse) return result;
 *   const { userId } = result;
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId: session.user.id };
}
