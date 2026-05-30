import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const ext = path.extname(name);

  if (ext !== ".docx" && ext !== ".txt") {
    return NextResponse.json({ error: "Only .docx and .txt files are supported" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ext === ".txt") {
      const text = buffer.toString("utf-8");
      return NextResponse.json({ text, fileName: file.name });
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value, fileName: file.name });
    }

    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
