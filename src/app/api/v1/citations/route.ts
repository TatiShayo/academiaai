import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chat } from "@/lib/openai";
import { checkApiRateLimit } from "@/lib/rate-limit";

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

  const { source, format } = await request.json();

  if (!source || typeof source !== "string") {
    return NextResponse.json({ error: "Field 'source' is required" }, { status: 400 });
  }

  const fmt = (format && typeof format === "string") ? format : "APA";

  try {
    const result = await chat([
      { role: "system", content: `You are a citation generator. Generate a citation in ${fmt} format for the given source. Return ONLY the formatted citation, no explanations or additional text.` },
      { role: "user", content: source },
    ]);

    return NextResponse.json({
      source,
      format: fmt,
      citation: result,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate citation" }, { status: 500 });
  }
}
