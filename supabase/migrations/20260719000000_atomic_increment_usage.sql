-- AcademiaAI: atomic usage increment
--
-- lib/usage.ts incrementUsage() was a read-modify-write: getUsage() then
-- upsert with doc_count + 1. Two concurrent requests both read N and both
-- wrote N+1, so one increment was lost — a free-quota bypass under
-- concurrency. This RPC performs the increment under the database's row lock
-- (single statement, INSERT ... ON CONFLICT DO UPDATE) and rolls the counter
-- over on month change, matching the JS reset semantics.

CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id uuid, p_month text)
RETURNS TABLE (doc_count integer, plan text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.user_usage (user_id, doc_count, month, updated_at)
  VALUES (p_user_id, 1, p_month, now())
  ON CONFLICT (user_id) DO UPDATE
    SET doc_count = CASE
          WHEN user_usage.month = p_month THEN user_usage.doc_count + 1
          ELSE 1
        END,
        month = p_month,
        updated_at = now()
  RETURNING user_usage.doc_count, user_usage.plan;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_usage(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text) TO service_role;
