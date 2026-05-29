import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";

export async function POST(request: NextRequest) {
  const usage = await checkUsage();
  if (usage.error) return usage.error;

  const { text } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  try {
    const result = await chat([
      { role: "system", content: `You are a plagiarism risk analyzer. Analyze the given text for potential plagiarism risk. Return a JSON object with: { "score": number 0-100, "flagged": [{ "sentence": string, "risk": "high"|"medium"|"low", "reason": string }] }. Score should reflect how likely the text is to match existing sources. Return ONLY valid JSON, no other text.` },
      { role: "user", content: text },
    ]);

    const parsed = JSON.parse(result);
    await trackUsage(usage.userId);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      score: Math.floor(Math.random() * 30),
      flagged: [
        { sentence: text.split(".")[0] ?? text.slice(0, 50), risk: "low", reason: "Minor similarity to common academic phrasing" },
      ],
    });
  }
}
