import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/openai";

export async function POST(request: NextRequest) {
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

    return NextResponse.json({
      source,
      format: citationFormat,
      citation: result,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate citation" }, { status: 500 });
  }
}
