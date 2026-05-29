import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canProcess, incrementUsage } from "@/lib/usage";

export async function checkUsage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const allowed = await canProcess(user.id);
  if (!allowed) {
    return { error: NextResponse.json({ error: "Usage limit reached", paywall: true }, { status: 402 }) };
  }

  return { userId: user.id };
}

export async function trackUsage(userId: string) {
  await incrementUsage(userId);
}
