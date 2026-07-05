import { NextResponse } from "next/server";
import { getTotalWordsProcessed } from "@/lib/usage";

export async function GET() {
  const total = await getTotalWordsProcessed();
  return NextResponse.json({ totalWordsProcessed: total });
}
