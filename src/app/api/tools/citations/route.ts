import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";

export async function POST(request: NextRequest) {
  const usage = await checkUsage();
  if (usage.error) return usage.error;

  const { source, format } = await request.json();

  if (!source || typeof source !== "string") {
    return NextResponse.json({ error: "Source is required" }, { status: 400 });
  }

  const validFormats = ["APA", "MLA", "Chicago", "Harvard"];
  const citationFormat = validFormats.includes(format) ? format : "APA";

  try {
    const result = await chat([
      { role: "system", content: `You are a citation generator. Generate a citation in ${citationFormat} format for the given source. Return ONLY the formatted citation, no explanations or additional text.` },
      { role: "user", content: source },
    ]);

    await trackUsage(usage.userId);

    return NextResponse.json({
      source,
      format: citationFormat,
      citation: result,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate citation" }, { status: 500 });
  }
}
