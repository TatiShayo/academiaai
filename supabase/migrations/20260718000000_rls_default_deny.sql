-- Security hardening: the original "service role" policies were written as
-- FOR ALL USING (true) WITH CHECK (true) WITHOUT a TO clause, so they applied
-- to the public role (anon + authenticated) — meaning any logged-in user could
-- read or modify ANY row (e.g. reset their own usage quota, or read another
-- user's usage/profile). The service_role key bypasses RLS entirely and never
-- needed a policy. This migration drops those over-permissive policies and
-- re-scopes them to the service_role only, leaving a default-deny posture for
-- ordinary users (who keep their own owner-scoped SELECT/UPDATE policies).

-- user_usage --------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can manage usage" ON public.user_usage;

CREATE POLICY "Service role manages usage"
  ON public.user_usage
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- profiles ----------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

CREATE POLICY "Service role manages profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- api_keys: the existing owner policy is correct, but the /api/v1 routes look
-- keys up with the service-role client (which bypasses RLS), so no extra
-- policy is required. Ensure RLS stays enabled (default deny for anon).
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
