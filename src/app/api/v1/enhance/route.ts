import { NextRequest, NextResponse } from "next/server";
import { chat, mockEnhance, wrapUntrusted } from "@/lib/openai";
import { incrementWordsProcessed } from "@/lib/usage";
import { checkApiRateLimit } from "@/lib/rate-limit";
import { resolveApiKey } from "@/lib/api-key-auth";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7);
  const resolved = await resolveApiKey(apiKey);

  if (!resolved) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  const rateCheck = checkApiRateLimit(resolved.userId);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "API rate limit exceeded. Try again tomorrow." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body in request" }, { status: 400 });
  }

  const text = typeof body?.text === "string" ? body.text : "";
  const level = (typeof body?.level === "string" ? body.level : "Undergraduate") as Parameters<typeof mockEnhance>[1];

  if (!text) {
    return NextResponse.json({ error: "Field 'text' is required" }, { status: 400 });
  }

  const levelMap: Record<string, string> = {
    "High School": "Rewrite at a high school academic level. Use clear, straightforward language.",
    Undergraduate: "Rewrite at an undergraduate university level. Use formal academic language with proper terminology.",
    Masters: "Rewrite at a Masters/postgraduate level. Use sophisticated academic vocabulary, complex sentence structures, and field-appropriate terminology.",
    "Master's": "Rewrite at a Masters/postgraduate level. Use sophisticated academic vocabulary, complex sentence structures, and field-appropriate terminology.",
    PhD: "Rewrite at a PhD/doctoral level. Use highly sophisticated academic language, dense theoretical vocabulary, complex argumentation, and discipline-specific conventions.",
  };

  const prompt = levelMap[level] ?? levelMap.Undergraduate;

  try {
    let result = "";
    if (process.env.OPENAI_API_KEY) {
      try {
        result = await chat([
          {
            role: "system",
            content: `You are an academic writing expert. ${prompt} Improve vocabulary, sentence structure, and academic tone. Return ONLY the enhanced text, no explanations.`,
          },
          { role: "user", content: wrapUntrusted(text) },
        ]);
      } catch (e) {
        console.error("v1 enhance OpenAI error, using fallback:", e);
      }
    }

    if (!result) {
      const mock = mockEnhance(text, level);
      result = mock.enhancedText;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 0) {
      await incrementWordsProcessed(resolved.userId, wordCount);
    }

    return NextResponse.json({
      original: text,
      enhanced: result,
      level,
    });
  } catch (err) {
    console.error("Error in v1 enhance:", err);
    return NextResponse.json({ error: "Failed to enhance text" }, { status: 500 });
  }
}
