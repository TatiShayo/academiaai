-- AcademiaAI: Stripe webhook idempotency ledger
--
-- Stripe retries failed deliveries and delivers at-least-once; a captured
-- signed payload can be replayed verbatim. Every processed event id is
-- recorded here; a duplicate insert (unique violation 23505) short-circuits
-- re-processing before setPro/setFree/unlockSingle run twice.

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies: only the service-role admin client (which bypasses RLS) writes here.
