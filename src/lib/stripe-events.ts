import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe webhook idempotency ledger.
 *
 * Stripe retries failed deliveries and delivers at-least-once; a captured
 * signed payload can also be replayed. Every processed event id is recorded
 * and a duplicate short-circuits re-processing before the subscription is
 * provisioned twice. Same pattern as postpilot/reviewpilot/studiopilot.
 */
const processedEvents = new Set<string>();

export async function recordStripeEvent(
  eventId: string,
  type: string
): Promise<{ duplicate: boolean }> {
  if (!eventId) return { duplicate: false };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("stripe_events").insert({ id: eventId, type });
    if (error) {
      if (error.code === "23505") return { duplicate: true };
      throw error;
    }
    return { duplicate: false };
  } catch (err) {
    // When the admin client is unavailable (unconfigured env), fall back to an
    // in-memory ledger so replays within one instance are still caught, but
    // surface any other error to the caller (fail closed).
    if (err instanceof Error && err.message.includes("must be set")) {
      if (processedEvents.has(eventId)) return { duplicate: true };
      processedEvents.add(eventId);
      return { duplicate: false };
    }
    throw err;
  }
}
