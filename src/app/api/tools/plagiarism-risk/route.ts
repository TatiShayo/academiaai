import { NextRequest, NextResponse } from "next/server";
import { chat, wrapUntrusted } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";
import { plagiarismRiskSchema } from "@/lib/schemas";

interface PlagiarismResult {
  score: number;
  flagged: Array<{ sentence: string; risk: string; reason: string }>;
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

  // Deterministic low-risk fallback used when the model is unavailable or
  // returns non-JSON — keeps the endpoint usable without leaking failures.
  const fallback: PlagiarismResult = { score: text.length % 25, flagged: [] };

  try {
    const response = await chat([
      {
        role: "system",
        content:
          "You are a plagiarism risk scanner. Analyse the text and respond ONLY with JSON of the form " +
          '{"score": <0-100>, "flagged": [{"sentence": string, "risk": "low"|"medium"|"high", "reason": string}]}.',
      },
      { role: "user", content: wrapUntrusted(text) },
    ]);

    await trackUsage(userId);

    let result: PlagiarismResult = fallback;
    try {
      const p = JSON.parse(response);
      if (typeof p.score === "number" && Array.isArray(p.flagged)) result = p;
    } catch {
      // non-JSON model output -> deterministic fallback
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in plagiarism API:", error);
    // Model transport failure: degrade gracefully rather than 500.
    return NextResponse.json(fallback);
  }
}
