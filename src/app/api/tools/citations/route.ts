import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";
import { citationsSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const usage = await checkUsage();
  if (usage.error) return usage.error;

  const body = await request.json();
  const parsed = citationsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { source, format } = parsed.data;

  try {
    const result = await chat([
      { role: "system", content: `You are a citation generator. Generate a citation in ${format} format for the given source. Return ONLY the formatted citation, no explanations or additional text.` },
      { role: "user", content: source },
    ]);

    await trackUsage(usage.userId);

    return NextResponse.json({
      source,
      format,
      citation: result,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate citation" }, { status: 500 });
  }
}
