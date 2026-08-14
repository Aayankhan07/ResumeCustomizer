-- ============================================================
-- 011: Atomic rate limiting + SECURITY DEFINER search_path hardening
-- ============================================================
-- Two related fixes:
--   1. checkRateLimit() in src/lib/rateLimit.ts did a count-then-insert with
--      no lock. Concurrent requests could each read used = 9 and all pass.
--      consume_rate_limit() below does both in one statement instead.
--   2. Every SECURITY DEFINER function except handle_new_user was missing
--      SET search_path. Without it a role that can create objects in an
--      earlier schema on the search path can shadow the tables these
--      functions touch and have them run against attacker-controlled
--      objects with definer privileges.
-- ============================================================

-- ============================
-- Widen the action CHECK constraint
-- 001_initial_schema.sql restricted action to 'transform' only. The rescore
-- endpoint needs its own bucket, and inserts would fail the constraint.
-- ============================
ALTER TABLE public.rate_limits
  DROP CONSTRAINT IF EXISTS rate_limits_action_check;

ALTER TABLE public.rate_limits
  ADD CONSTRAINT rate_limits_action_check
  CHECK (action IN ('transform', 'rescore'));

-- ============================
-- Supporting index for the window count
-- ============================
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_created
  ON public.rate_limits (user_id, action, created_at DESC);

-- ============================
-- Atomic consume-and-count
--
-- Returns the number of requests used within the window INCLUDING the one
-- just recorded, plus the timestamp of the oldest request still inside the
-- window (so callers can report an accurate reset time rather than
-- now + window).
--
-- The row is inserted unconditionally and the caller compares used against
-- its own limit. That keeps the limit policy in application code while the
-- read and write stay in a single statement.
-- ============================
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_user_id   UUID,
  p_action    TEXT,
  p_window_ms BIGINT
)
RETURNS TABLE (used INTEGER, oldest_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window_start TIMESTAMPTZ := NOW() - (p_window_ms || ' milliseconds')::INTERVAL;
BEGIN
  -- Serialize concurrent checks for the same user+action. Advisory locks are
  -- released at transaction end, so this cannot leak across requests.
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::TEXT || ':' || p_action));

  INSERT INTO public.rate_limits (user_id, action)
  VALUES (p_user_id, p_action);

  RETURN QUERY
  SELECT COUNT(*)::INTEGER, MIN(rl.created_at)
  FROM public.rate_limits rl
  WHERE rl.user_id = p_user_id
    AND rl.action = p_action
    AND rl.created_at >= v_window_start;
END;
$$;

COMMENT ON FUNCTION public.consume_rate_limit IS
  'Atomically records a rate-limited action and returns usage within the window.';

-- ============================
-- search_path hardening for existing SECURITY DEFINER functions
-- Bodies are unchanged from 004/005/006; only the search_path setting is added.
-- ============================
ALTER FUNCTION public.increment_transformation_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_user_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.soft_delete_transformation(UUID, UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_old_rate_limits() SET search_path = public, pg_temp;
