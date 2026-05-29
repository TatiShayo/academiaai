import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsage, getRemaining, getLimit } from "@/lib/usage";

const UNLOCKED_LIMIT = 1;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await getUsage(user.id);
  const remaining = await getRemaining(user.id);

  return NextResponse.json({
    docCount: usage.docCount,
    month: usage.month,
    plan: usage.plan,
    remaining,
    limit: usage.plan === "unlocked" ? UNLOCKED_LIMIT : getLimit(),
  });
}
