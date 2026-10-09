import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client.
 *
 * Fails closed: the previous implementation fell back to
 * https://placeholder.supabase.co / a placeholder key when the env vars were
 * missing. Queries then silently returned empty results, and callers such as
 * canProcess() read `docCount: 0` as "no usage recorded" — an unlimited free
 * LLM spend on the operator's OpenAI key. A misconfigured deployment must
 * fail loudly, not degrade into an open door.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL must be set — the admin client refuses to run against placeholder credentials"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
