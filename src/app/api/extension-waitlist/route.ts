import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email") as string | null;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.redirect(new URL("/?waitlist=error", request.url));
  }

  return NextResponse.redirect(new URL("/?waitlist=success", request.url));
}
