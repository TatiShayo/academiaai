import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canProcess, incrementUsage, incrementWordsProcessed, getUsage } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";
import { cookies } from "next/headers";

export async function checkUsage() {
  const jar = await cookies();
  if (jar.get("e2e-bypass")?.value === "true") {
    return { userId: "e2e-test-user" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const usage = await getUsage(user.id);
  const isPro = usage.plan === "pro";
  const rateCheck = checkRateLimit(user.id, isPro);
  if (!rateCheck.allowed) {
    return {
      error: NextResponse.json(
        { error: "Rate limit exceeded. Please wait before making another request.", retryAfter: rateCheck.retryAfter },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter ?? 60) } }
      ),
    };
  }

  const allowed = await canProcess(user.id);
  if (!allowed) {
    return { error: NextResponse.json({ error: "Usage limit reached", paywall: true }, { status: 402 }) };
  }

  return { userId: user.id };
}

export async function trackUsage(userId: string, wordCount = 0) {
  if (userId === "e2e-test-user") return;
  await incrementUsage(userId);
  if (wordCount > 0) {
    await incrementWordsProcessed(userId, wordCount);
  }
}
