import { createAdminClient } from "@/lib/supabase/admin";

const FREE_LIMIT = 3;

export interface UsageData {
  docCount: number;
  month: string;
  plan: "free" | "pro" | "unlocked";
}

function getMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUsage(userId: string): Promise<UsageData> {
  const supabase = createAdminClient();
  const currentMonth = getMonth();

  const { data } = await supabase
    .from("user_usage")
    .select("doc_count, month, plan")
    .eq("user_id", userId)
    .single();

  if (!data || data.month !== currentMonth) {
    const { data: upserted } = await supabase
      .from("user_usage")
      .upsert(
        {
          user_id: userId,
          doc_count: 0,
          month: currentMonth,
          plan: data?.plan === "pro" ? "pro" : "free",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("doc_count, month, plan")
      .single();

    return {
      docCount: upserted?.doc_count ?? 0,
      month: upserted?.month ?? currentMonth,
      plan: upserted?.plan ?? "free",
    };
  }

  return {
    docCount: data.doc_count,
    month: data.month,
    plan: data.plan,
  };
}

export async function incrementUsage(userId: string): Promise<UsageData> {
  const supabase = createAdminClient();
  const currentMonth = getMonth();

  // Atomic increment via RPC. The previous read-modify-write (getUsage then
  // upsert with doc_count + 1) raced under concurrency: two simultaneous
  // requests both read N and both wrote N+1, so one increment was lost — a
  // free-quota bypass. The RPC increments under the database's row lock in a
  // single statement and rolls the counter on month change.
  const { data, error } = await supabase.rpc("increment_usage", {
    p_user_id: userId,
    p_month: currentMonth,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;

  return {
    docCount: typeof row?.doc_count === "number" ? row.doc_count : 0,
    month: currentMonth,
    plan: row?.plan === "pro" || row?.plan === "unlocked" ? row.plan : "free",
  };
}

const UNLOCKED_LIMIT = 1;

export async function canProcess(userId: string): Promise<boolean> {
  const usage = await getUsage(userId);
  if (usage.plan === "pro") return true;
  if (usage.plan === "unlocked") return usage.docCount < UNLOCKED_LIMIT;
  return usage.docCount < FREE_LIMIT;
}

export async function getRemaining(userId: string): Promise<number> {
  const usage = await getUsage(userId);
  if (usage.plan === "pro") return Infinity;
  if (usage.plan === "unlocked") return Math.max(0, UNLOCKED_LIMIT - usage.docCount);
  return Math.max(0, FREE_LIMIT - usage.docCount);
}

export async function setPro(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("user_usage")
    .upsert(
      {
        user_id: userId,
        doc_count: 0,
        month: getMonth(),
        plan: "pro",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
}

export async function setFree(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("user_usage")
    .upsert(
      {
        user_id: userId,
        doc_count: 0,
        month: getMonth(),
        plan: "free",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
}

export async function unlockSingle(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("user_usage")
    .upsert(
      {
        user_id: userId,
        doc_count: 0,
        month: getMonth(),
        plan: "unlocked",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
}

export async function incrementWordsProcessed(userId: string, wordCount: number): Promise<void> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_words_processed")
    .eq("id", userId)
    .single();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: userId,
      total_words_processed: wordCount,
      plan: "free",
    });
    return;
  }

  await supabase
    .from("profiles")
    .update({
      total_words_processed: profile.total_words_processed + wordCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function getTotalWordsProcessed(): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("total_words_processed");

  if (error || !data) return 0;

  return (data as Array<{ total_words_processed: number }>).reduce(
    (sum, row) => sum + (row.total_words_processed || 0),
    0
  );
}

export function getLimit(): number {
  return FREE_LIMIT;
}
