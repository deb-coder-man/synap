import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Task } from "@/lib/types";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a task scheduling assistant. You will be given a list of tasks and user preferences. Return ONLY a valid JSON array of task IDs (e.g. [\"id1\", \"id2\"]) in optimal completion order. No explanation, no markdown, no extra text.";

export async function POST(req: NextRequest) {
  try {
    const { hours, deep, tasks } = (await req.json()) as {
      hours: number;
      deep: boolean;
      tasks: Task[];
    };

    const today = new Date().toISOString().split("T")[0];

    const userPrompt = `Today is ${today}.
Available hours: ${hours}h
Deep work mode: ${deep ? "yes — prioritise tasks requiring focus and concentration" : "no — mix of task types is fine"}

Scheduling rules:
- Fit tasks within the available ${hours} hours using estimatedHours where provided
- Prioritise HIGH priority tasks first, then MEDIUM, then LOW
- If deep work mode is on, group similar/focus-heavy tasks together
- Urgent tasks (due within 7 days or marked urgent) should appear early
- If a task has no estimatedHours, assume 0.5h

Tasks:
${JSON.stringify(
  tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    estimatedHours: t.estimatedHours,
    dueDate: t.dueDate,
  })),
  null,
  2
)}

Return ONLY a JSON array of task IDs in the order they should be completed.`;

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
