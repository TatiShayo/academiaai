import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { checkUsage } from "@/lib/tool-guard";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = new Set([".docx", ".txt"]);

/** Reject anything whose declared extension isn't a simple, safe basename. */
function safeExtension(fileName: string): string | null {
  // Strip any directory components to defeat path traversal in the name.
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = base.slice(dot).toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : null;
}

export async function POST(request: NextRequest) {
  // Uploads trigger CPU-heavy parsing — require an authenticated, in-quota user.
  const guard = await checkUsage();
  if (guard.error) return guard.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds the 5 MB limit" }, { status: 413 });
  }

  const ext = safeExtension(file.name);
  if (!ext) {
    return NextResponse.json({ error: "Only .docx and .txt files are supported" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ext === ".txt") {
      // Reject binary payloads masquerading as .txt (NUL byte heuristic).
      if (buffer.subarray(0, 8000).includes(0x00)) {
        return NextResponse.json({ error: "File does not appear to be plain text" }, { status: 400 });
      }
      return NextResponse.json({ text: buffer.toString("utf-8"), fileName: file.name });
    }

    // .docx is a ZIP container: verify the "PK\x03\x04" magic bytes before parsing.
    const isZip =
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04;
    if (!isZip) {
      return NextResponse.json({ error: "File is not a valid .docx document" }, { status: 400 });
    }

    const result = await mammoth.extractRawText({ buffer });
    return NextResponse.json({ text: result.value, fileName: file.name });
  } catch {
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
