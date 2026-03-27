import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/api-auth";
import type { Task } from "@/lib/types";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a task scheduling assistant. You will be given a list of tasks. Return ONLY a valid JSON array of task IDs in optimal completion order. No explanation, no markdown, no extra text.";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { hours, tasks } = (await req.json()) as {
      hours: number;
      tasks: Task[];
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Scoring logic (applied server-side to guide the AI):
    // Priority weight: HIGH=6, MEDIUM=3, LOW=1
    // Urgency weight (days until due):
    //   ≤1 day = 5, ≤3 days = 4, ≤7 days = 3, ≤14 days = 2, ≤30 days = 1, >30 days = 0
    // If no dueDate, assume due in 5 days from today (internal only — not shown to user)

    const scoredTasks = tasks.map((t) => {
      const priorityWeight = t.priority === "HIGH" ? 6 : t.priority === "MEDIUM" ? 3 : 1;

      const assumedDue = t.dueDate
        ? new Date(t.dueDate)
        : new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
      assumedDue.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.max(
        0,
        Math.ceil((assumedDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      );

      const urgencyWeight =
        daysUntilDue <= 1 ? 5
        : daysUntilDue <= 3 ? 4
        : daysUntilDue <= 7 ? 3
        : daysUntilDue <= 14 ? 2
        : daysUntilDue <= 30 ? 1
        : 0;

      return {
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedHours: t.estimatedHours ?? 0.5,
        dueDate: t.dueDate ?? null,
        score: priorityWeight + urgencyWeight,
        daysUntilDue,
      };
    });

    const userPrompt = `Today is ${todayStr}.
Available hours for this session: ${hours}h

Scoring system already computed for each task (higher score = more important):
- Score combines priority weight (HIGH=6, MEDIUM=3, LOW=1) and urgency weight based on days until due
- Tasks with no due date have been pre-scored assuming they are due in 5 days

Tasks (sorted by score descending as a starting point):
${JSON.stringify(
  scoredTasks
    .sort((a, b) => b.score - a.score || a.daysUntilDue - b.daysUntilDue)
    .map(({ id, title, priority, estimatedHours, dueDate, score }) => ({
      id,
      title,
      priority,
      estimatedHours,
      dueDate,
      score,
    })),
  null,
  2
)}

Rules:
1. Return task IDs in order from most to least important (highest score first)
2. Only include tasks that fit within the available ${hours} hours (using estimatedHours; default 0.5h if missing)
3. Break ties using earlier due date first
4. Do not include tasks that would exceed the hour budget

Return ONLY a JSON array of task IDs in completion order.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: userPrompt }],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    // Strip any markdown code fences Claude might add despite the system prompt
    const rawText = content.text.trim().replace(/^```(?:json)?\n?/m, "").replace(/```$/m, "").trim();
    const orderedIds = JSON.parse(rawText) as string[];
    return NextResponse.json({ orderedIds });
  } catch (err) {
    console.error("Prioritisation error:", err);
    return NextResponse.json({ error: "Failed to prioritise tasks" }, { status: 500 });
  }
}
