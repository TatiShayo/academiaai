import { NextRequest, NextResponse } from "next/server";
import { chat, wrapUntrusted } from "@/lib/openai";
import { checkApiRateLimit } from "@/lib/rate-limit";
import { formatCitation, parseRawCitation, type CitationStyle } from "@/lib/citation-engine";
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body in request" }, { status: 400 });
  }

  const source = body?.source || body?.title;
  const format = (body?.format || body?.style || "APA") as CitationStyle;

  if (!source || typeof source !== "string") {
    return NextResponse.json({ error: "Field 'source' or 'title' is required" }, { status: 400 });
  }

  try {
    let result = "";
    if (process.env.OPENAI_API_KEY) {
      try {
        result = await chat([
          {
            role: "system",
            content: `You are an academic citation generator. Generate a citation in ${format} format for the given source. Return ONLY the formatted citation, no explanations or additional text.`,
          },
          { role: "user", content: wrapUntrusted(source) },
        ]);
      } catch (e) {
        console.error("v1 citations OpenAI error, falling back:", e);
      }
    }

    if (!result) {
      // Coerce the unvalidated JSON fields to the metadata types; anything of
      // the wrong shape is dropped rather than trusted.
      const str = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);
      const num = (v: unknown): number | undefined =>
        typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;

      if (body.title || body.author || body.year) {
        result = formatCitation(
          {
            title: str(body.title) || source,
            author: str(body.author),
            year: num(body.year),
            publisher: str(body.publisher),
            journal: str(body.journal),
            volume: num(body.volume),
            issue: num(body.issue),
            pages: str(body.pages),
            url: str(body.url),
            doi: str(body.doi),
          },
          format
        );
      } else {
        const meta = parseRawCitation(source);
        result = formatCitation(meta, format);
      }
    }

    return NextResponse.json({
      source,
      format,
      citation: result,
    });
  } catch (err) {
    console.error("Error in v1 citations:", err);
    return NextResponse.json({ error: "Failed to generate citation" }, { status: 500 });
  }
}
