import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAuth } from "@/lib/api-auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { name, email, message } = (await req.json()) as {
    name: string;
    email: string;
    message: string;
  };

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from,
    to: "dave.khadka2005@gmail.com",
    subject: `Synap Feedback from ${name.trim()}`,
    text: [
      `From: ${name.trim()} <${email ?? "unknown"}>`,
      "",
      message.trim(),
    ].join("\n"),
  });

  if (error) {
    console.error("[feedback] Resend error:", error);
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
