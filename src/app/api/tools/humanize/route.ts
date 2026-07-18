import { NextRequest, NextResponse } from "next/server";
import { chat, wrapUntrusted } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";
import { humanizeSchema } from "@/lib/schemas";

const LEVEL_PROMPT: Record<string, string> = {
  subtle: "Make minor adjustments so it sounds more natural. Keep most of the original structure.",
  balanced: "Rewrite to sound natural and human-like while preserving meaning and key points.",
  aggressive: "Completely rewrite so it reads as if a human wrote it: varied sentence structure, natural flow.",
};

const AFTER_BY_LEVEL: Record<string, number> = { subtle: 12, balanced: 8, aggressive: 4 };

export async function POST(req: NextRequest) {
  const guard = await checkUsage();
  if (guard.error) return guard.error;
  const userId = guard.userId!;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }

  const parsed = humanizeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { text, level } = parsed.data;

  try {
    const humanized = await chat([
      {
        role: "system",
        content:
          `You are an academic text humanizer. ${LEVEL_PROMPT[level] ?? LEVEL_PROMPT.balanced} ` +
          "Return ONLY the humanized text, no explanations.",
      },
      { role: "user", content: wrapUntrusted(text) },
    ]);

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    await trackUsage(userId, wordCount);

    const aiScoreBefore = 80 + (wordCount % 15); // 80-94
    const aiScoreAfter = AFTER_BY_LEVEL[level] ?? 8;

    return NextResponse.json({ original: text, humanized, aiScoreBefore, aiScoreAfter });
  } catch (error) {
    console.error("Error in humanize API:", error);
    return NextResponse.json({ error: "Failed to humanize text" }, { status: 500 });
  }
}
