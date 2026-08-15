-- ============================================================
-- 012: Lock down SECURITY DEFINER grants + fix an UPDATE policy
-- ============================================================
-- Postgres grants EXECUTE to PUBLIC on every new function, and anon /
-- authenticated inherit from PUBLIC. Combined with SECURITY DEFINER, that
-- made consume_rate_limit() a public endpoint: any holder of the anon key
-- could call it with an arbitrary p_user_id, insert rate_limits rows on
-- another user's behalf, and exhaust that user's hourly transform quota
-- without ever signing in.
--
-- The function is only ever invoked by createServiceClient() in
-- src/lib/rateLimit.ts, so removing the inherited grant costs the app
-- nothing. service_role bypasses these grants.
-- ============================================================

REVOKE ALL ON FUNCTION public.consume_rate_limit(UUID, TEXT, BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_rate_limit(UUID, TEXT, BIGINT) FROM anon;
REVOKE ALL ON FUNCTION public.consume_rate_limit(UUID, TEXT, BIGINT) FROM authenticated;

-- soft_delete_transformation is SECURITY DEFINER and takes the acting user's
-- id as a parameter, so an untrusted caller could pass someone else's and
-- delete their rows. It currently has no caller in src/ at all — deletion
-- goes through an RLS-protected UPDATE in src/lib/api.ts — so nothing depends
-- on the inherited grant.
REVOKE ALL ON FUNCTION public.soft_delete_transformation(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.soft_delete_transformation(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.soft_delete_transformation(UUID, UUID) FROM authenticated;

-- cleanup_old_rate_limits is invoked by the /api/cleanup cron route using the
-- service role; nothing client-side should be able to clear the limiter.
REVOKE ALL ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_old_rate_limits() FROM anon;
REVOKE ALL ON FUNCTION public.cleanup_old_rate_limits() FROM authenticated;

-- ============================
-- application_events UPDATE policy was missing WITH CHECK
--
-- 010 created it with USING only. In Postgres RLS, USING filters which rows
-- may be updated but does not constrain the resulting row, so a user could
-- pass the check on a row they own and then set user_id to another account,
-- handing over their own event. profiles and transformations already pair
-- USING with WITH CHECK in 003; this brings application_events in line.
--
-- The TO clause is added at the same time: these policies had no role target,
-- so they were evaluated for anon as well, where auth.uid() is NULL.
-- ============================
DROP POLICY IF EXISTS "update own events" ON public.application_events;

CREATE POLICY "update own events" ON public.application_events
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
