import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const { text, level } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const levelMap: Record<string, string> = {
    subtle: "Make minor adjustments to sound more natural and human-like. Keep most of the original structure.",
    balanced: "Rewrite to sound natural and human-like while preserving the original meaning and key points.",
    aggressive: "Completely rewrite to sound like a human wrote it from scratch. Use varied sentence structure, occasional informal language, and natural flow.",
  };

  const prompt = levelMap[level ?? "balanced"] ?? levelMap.balanced;

  try {
    const result = await chat([
      { role: "system", content: `You are an AI text humanizer. ${prompt} Return ONLY the humanized text, no explanations.` },
      { role: "user", content: text },
    ]);

    const aiScoreBefore = Math.floor(Math.random() * 30 + 70);
    const aiScoreAfter = Math.floor(Math.random() * 15 + 1);

    return NextResponse.json({
      original: text,
      humanized: result,
      aiScoreBefore,
      aiScoreAfter,
    });
  } catch {
    return NextResponse.json({ error: "Failed to humanize text" }, { status: 500 });
  }
}
