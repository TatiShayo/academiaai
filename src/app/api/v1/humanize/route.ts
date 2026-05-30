import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chat } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7);
  const supabase = await createClient();

  const { data: keyRecord, error: keyError } = await supabase
    .from("api_keys")
    .select("user_id, revoked")
    .eq("api_key", apiKey)
    .single();

  if (keyError || !keyRecord || keyRecord.revoked) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("api_key", apiKey);

  const { text, level } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Field 'text' is required" }, { status: 400 });
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

    return NextResponse.json({
      original: text,
      humanized: result,
    });
  } catch {
    return NextResponse.json({ error: "Failed to humanize text" }, { status: 500 });
  }
}
