import { NextRequest, NextResponse } from "next/server";
import { chat, wrapUntrusted } from "@/lib/openai";
import { checkUsage, trackUsage } from "@/lib/tool-guard";
import { citationsSchema } from "@/lib/schemas";

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

  const parsed = citationsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const style = (data.style || data.format || "APA");
  const sourceText = data.source || (data.title ? `${data.title} by ${data.author || "Anonymous"}` : "Source");

  try {
    const citation = await chat([
      {
        role: "system",
        content:
          `You are an expert citation generator. Generate an accurate citation in ${style} format for the given academic source metadata. ` +
          "Return ONLY the formatted citation, no explanations or conversational prefixes.",
      },
      { role: "user", content: wrapUntrusted(sourceText) },
    ]);

    await trackUsage(userId);

    return NextResponse.json({
      source: sourceText,
      title: data.title,
      format: style,
      style,
      citation,
    });
  } catch (error) {
    console.error("Error in citations API:", error);
    return NextResponse.json({ error: "Failed to generate citation" }, { status: 500 });
  }
}
