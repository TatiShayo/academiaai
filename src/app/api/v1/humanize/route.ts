import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chat, mockHumanize, wrapUntrusted } from "@/lib/openai";
import { incrementWordsProcessed } from "@/lib/usage";
import { checkApiRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7);
  const supabase = createAdminClient();

  const { data: keyRecord, error: keyError } = await supabase
    .from("api_keys")
    .select("user_id, revoked")
    .eq("api_key", apiKey)
    .single();

  if (keyError || !keyRecord || keyRecord.revoked) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  const rateCheck = checkApiRateLimit(keyRecord.user_id);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "API rate limit exceeded. Try again tomorrow." },
      { status: 429 }
    );
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("api_key", apiKey);

  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body in request" }, { status: 400 });
  }

  const text = typeof body?.text === "string" ? body.text : "";
  const level = (typeof body?.level === "string" ? body.level : "balanced") as Parameters<typeof mockHumanize>[1];

  if (!text) {
    return NextResponse.json({ error: "Field 'text' is required" }, { status: 400 });
  }

  const levelMap: Record<string, string> = {
    subtle: "Make minor adjustments to sound more natural and human-like. Keep most of the original structure.",
    balanced: "Rewrite to sound natural and human-like while preserving the original meaning and key points.",
    aggressive: "Completely rewrite to sound like a human wrote it from scratch. Use varied sentence structure, occasional informal language, and natural flow.",
  };

  const prompt = levelMap[level] ?? levelMap.balanced;

  try {
    let result = "";
    if (process.env.OPENAI_API_KEY) {
      try {
        result = await chat([
          {
            role: "system",
            content: `You are an AI text humanizer. ${prompt} Return ONLY the humanized text, no explanations.`,
          },
          { role: "user", content: wrapUntrusted(text) },
        ]);
      } catch (e) {
        console.error("v1 humanize OpenAI error, using fallback:", e);
      }
    }

    if (!result) {
      const mock = mockHumanize(text, level);
      result = mock.humanizedText;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 0) {
      await incrementWordsProcessed(keyRecord.user_id, wordCount);
    }

    return NextResponse.json({
      original: text,
      humanized: result,
    });
  } catch (err) {
    console.error("Error in v1 humanize:", err);
    return NextResponse.json({ error: "Failed to humanize text" }, { status: 500 });
  }
}
