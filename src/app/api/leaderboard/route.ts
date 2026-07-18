import { NextResponse } from "next/server";
import { getTotalWordsProcessed } from "@/lib/usage";

// Public, unauthenticated aggregate. Cache for 5 minutes so repeated hits don't
// trigger a full-table scan of profiles on every request.
export const revalidate = 300;

export async function GET() {
  const total = await getTotalWordsProcessed();
  return NextResponse.json(
    { totalWordsProcessed: total },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
