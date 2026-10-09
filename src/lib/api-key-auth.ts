import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * SHA-256 of an API key. The key is 128 bits of UUID entropy, so a
 * deterministic (unsalted) hash is safe against rainbow tables while keeping
 * lookups to a single indexed equality on api_key_hash.
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export interface ResolvedApiKey {
  userId: string;
}

/**
 * Resolves a presented API key to its owning user.
 *
 * The key is verified by hash against api_keys (plaintext keys are no longer
 * stored anywhere). Revoked keys and unknown keys both resolve to null; the
 * caller must not distinguish them. last_used_at is refreshed best-effort.
 */
export async function resolveApiKey(apiKey: string): Promise<ResolvedApiKey | null> {
  const supabase = createAdminClient();
  const hash = hashApiKey(apiKey);

  const { data: keyRecord, error } = await supabase
    .from("api_keys")
    .select("user_id, revoked")
    .eq("api_key_hash", hash)
    .single();

  if (error || !keyRecord || keyRecord.revoked) {
    return null;
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("api_key_hash", hash);

  return { userId: keyRecord.user_id };
}
