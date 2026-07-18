import { NextRequest, NextResponse } from "next/server";
import { chat, wrapUntrusted } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";
import { enhanceSchema } from "@/lib/schemas";

const LEVEL_PROMPT: Record<string, string> = {
  "High School": "Rewrite at a high-school academic level. Use clear, straightforward language.",
  Undergraduate: "Rewrite at an undergraduate level. Use formal academic language and proper terminology.",
  Masters: "Rewrite at a Master's level. Use sophisticated vocabulary and complex sentence structures.",
  PhD: "Rewrite at a PhD level. Use dense theoretical vocabulary and rigorous argumentation.",
};

/** Simple word-level change highlights between original and enhanced text. */
function computeChanges(original: string, enhanced: string) {
  const a = original.split(/\s+/).filter(Boolean);
  const b = enhanced.split(/\s+/).filter(Boolean);
  const changes: Array<{ from: string; to: string }> = [];
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i].toLowerCase() !== b[i].toLowerCase()) changes.push({ from: a[i], to: b[i] });
  }
  return changes;
}

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

  const parsed = enhanceSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { text, level } = parsed.data;

  try {
    const enhanced = await chat([
      {
        role: "system",
        content:
          `You are an academic writing expert. ${LEVEL_PROMPT[level] ?? LEVEL_PROMPT.Undergraduate} ` +
          "Improve vocabulary, sentence structure, and academic tone. Return ONLY the enhanced text, no explanations.",
      },
      { role: "user", content: wrapUntrusted(text) },
    ]);

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    await trackUsage(userId, wordCount);

    return NextResponse.json({
      original: text,
      enhanced,
      level,
      changes: computeChanges(text, enhanced),
    });
  } catch (error) {
    console.error("Error in enhance API:", error);
    return NextResponse.json({ error: "Failed to enhance text" }, { status: 500 });
  }
}
