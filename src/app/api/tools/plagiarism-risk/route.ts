import { NextRequest, NextResponse } from "next/server";
import { chat, mockPlagiarism, wrapUntrusted } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";
import { plagiarismRiskSchema } from "@/lib/schemas";

interface FlaggedItem {
  sentence: string;
  risk: "High" | "Medium" | "Low" | string;
  reason?: string;
  explanation?: string;
  suggestion?: string;
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

  const parsed = plagiarismRiskSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { text } = parsed.data;

  try {
    const response = await chat([
      {
        role: "system",
        content:
          "You are a plagiarism risk scanner. Analyse the text and respond ONLY with JSON of the form " +
          '{"score": <0-100>, "flagged": [{"sentence": string, "risk": "High"|"Medium"|"low"|"medium", "reason": string, "suggestion": string}]}.',
      },
      { role: "user", content: wrapUntrusted(text) },
    ]);

    const p = JSON.parse(response);
    const score = typeof p.score === "number" ? p.score : 0;
    const mappedFlagged: FlaggedItem[] = Array.isArray(p.flagged)
      ? p.flagged.map((f: Record<string, unknown>) => ({
          sentence: String(f.sentence || ""),
          risk: String(f.risk || "Medium"),
          reason: String(f.reason || f.explanation || "Matches known academic literature styles."),
          explanation: String(f.explanation || f.reason || "Matches known academic literature styles."),
          suggestion: String(f.suggestion || "Paraphrase or include citation reference."),
        }))
      : [];

    await trackUsage(userId);
    return NextResponse.json({
      score,
      riskScore: score,
      flagged: mappedFlagged,
      flaggedSentences: mappedFlagged,
    });
  } catch (error) {
    console.error("Error in plagiarism API, using fallback:", error);
    const fallback = mockPlagiarism(text);
    return NextResponse.json({
      score: fallback.score,
      riskScore: fallback.riskScore,
      flagged: fallback.flagged,
      flaggedSentences: fallback.flaggedSentences,
    });
  }
}
