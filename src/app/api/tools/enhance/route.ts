import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";

export async function POST(request: NextRequest) {
  const usage = await checkUsage();
  if (usage.error) return usage.error;

  const { text, level } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const levelMap: Record<string, string> = {
    "High School": "Rewrite at a high school academic level. Use clear, straightforward language.",
    Undergraduate: "Rewrite at an undergraduate university level. Use formal academic language with proper terminology.",
    Masters: "Rewrite at a Masters/postgraduate level. Use sophisticated academic vocabulary, complex sentence structures, and field-appropriate terminology.",
    PhD: "Rewrite at a PhD/doctoral level. Use highly sophisticated academic language, dense theoretical vocabulary, complex argumentation, and discipline-specific conventions.",
  };

  const prompt = levelMap[level] ?? levelMap.Undergraduate;

  try {
    const result = await chat([
      { role: "system", content: `You are an academic writing expert. ${prompt} Improve vocabulary, sentence structure, and academic tone. Return ONLY the enhanced text, no explanations.` },
      { role: "user", content: text },
    ]);

    const changes = generateChanges(text, result);

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    await trackUsage(usage.userId, wordCount);

    return NextResponse.json({
      original: text,
      enhanced: result,
      changes,
    });
  } catch {
    return NextResponse.json({ error: "Failed to enhance text" }, { status: 500 });
  }
}

function generateChanges(original: string, enhanced: string) {
  const origWords = original.split(/\s+/);
  const enhWords = enhanced.split(/\s+/);
  const changes: { original: string; enhanced: string }[] = [];

  for (let i = 0; i < Math.min(origWords.length, enhWords.length); i++) {
    if (origWords[i] !== enhWords[i]) {
      changes.push({
        original: origWords[i],
        enhanced: enhWords[i],
      });
    }
  }

  return changes.slice(0, 10);
}
