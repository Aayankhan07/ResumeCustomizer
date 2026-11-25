-- ============================================================
-- 014: Close direct-write paths, real deletion, fairer rate limiting
-- ============================================================
-- 1. transformations INSERT is server-only.
--    Any signed-in user could INSERT through PostgREST with the anon key,
--    bypassing the rate limit, the input size checks and the zod validation
--    in /api/transform, and bumping the public usage_stats counter through
--    the insert trigger. All legitimate inserts come from /api/transform,
--    which now uses the service role.
--
-- 2. transformations UPDATE is limited to user-editable columns.
--    The UPDATE policy allowed every column, so match_score, output_json,
--    input sizes etc. could be rewritten directly. Rescoring (which writes
--    output_json / scores) now runs with the service role in /api/rescore.
--
-- 3. application_events INSERT must reference the caller's own
--    transformation. Previously only user_id was checked, so a known
--    transformation UUID belonging to someone else could be attached to.
--
-- 4. Soft-deleted transformations are purged after 30 days.
--    "Delete" only ever set is_deleted, so the rows (including the stored
--    resume and job description) were kept forever.
--
-- 5. consume_rate_limit_v2 only records allowed requests, so a client that
--    keeps retrying while limited no longer extends its own lockout.
--
-- 6. A global daily budget for LLM calls, as a cost backstop on top of the
--    per-user limit.
--
-- 7. Index cleanup: drop indexes that duplicate the primary key or another
--    index, and the unused GIN index on output_json.
-- ============================================================

-- ----------------------------
-- 1. transformations: no client INSERT
-- ----------------------------
DROP POLICY IF EXISTS "transformations_insert_own" ON public.transformations;
REVOKE INSERT ON public.transformations FROM anon, authenticated;

-- ----------------------------
-- 2. transformations: column-scoped UPDATE
-- ----------------------------
REVOKE UPDATE ON public.transformations FROM anon, authenticated;
GRANT UPDATE (
  label,
  tags,
  status,
  applied_at,
  application_deadline,
  application_url,
  job_location,
  salary_range,
  recruiter_name,
  recruiter_contact,
  priority,
  source,
  is_archived,
  is_deleted,
  deleted_at,
  updated_at
) ON public.transformations TO authenticated;

DROP POLICY IF EXISTS "transformations_update_own" ON public.transformations;
CREATE POLICY "transformations_update_own"
  ON public.transformations FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "transformations_select_own" ON public.transformations;
CREATE POLICY "transformations_select_own"
  ON public.transformations FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id AND is_deleted = FALSE);

-- ----------------------------
-- 3. application_events: ownership of the parent transformation
-- ----------------------------
DROP POLICY IF EXISTS "insert own events" ON public.application_events;
CREATE POLICY "insert own events" ON public.application_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.transformations t
      WHERE t.id = transformation_id
        AND t.user_id = (SELECT auth.uid())
    )
  );

-- ----------------------------
-- 4. Purge soft-deleted transformations after a retention window
-- ----------------------------
CREATE OR REPLACE FUNCTION public.purge_deleted_transformations(p_retention_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.transformations
  WHERE is_deleted = TRUE
    AND COALESCE(deleted_at, updated_at, created_at)
        < NOW() - make_interval(days => GREATEST(p_retention_days, 0));
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_deleted_transformations(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_deleted_transformations(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.purge_deleted_transformations(INTEGER) FROM authenticated;

COMMENT ON FUNCTION public.purge_deleted_transformations IS
  'Hard-deletes transformations soft-deleted more than p_retention_days ago. Called by the /api/cleanup cron.';

-- ----------------------------
-- 5. Rate limit that only records allowed requests
--
-- The 3-argument consume_rate_limit from 011 is left in place so the
-- currently deployed code keeps working while this migration rolls out.
-- Drop it in a later migration once v2 is live everywhere.
-- ----------------------------
CREATE OR REPLACE FUNCTION public.consume_rate_limit_v2(
  p_user_id   UUID,
  p_action    TEXT,
  p_window_ms BIGINT,
  p_limit     INTEGER
)
RETURNS TABLE (used INTEGER, oldest_at TIMESTAMPTZ, allowed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window_start TIMESTAMPTZ := NOW() - (p_window_ms || ' milliseconds')::INTERVAL;
  v_used         INTEGER;
  v_oldest       TIMESTAMPTZ;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::TEXT || ':' || p_action));

  SELECT COUNT(*)::INTEGER, MIN(rl.created_at)
    INTO v_used, v_oldest
  FROM public.rate_limits rl
  WHERE rl.user_id = p_user_id
    AND rl.action = p_action
    AND rl.created_at >= v_window_start;

  IF v_used >= p_limit THEN
    RETURN QUERY SELECT v_used, v_oldest, FALSE;
    RETURN;
  END IF;

  INSERT INTO public.rate_limits (user_id, action) VALUES (p_user_id, p_action);

  RETURN QUERY SELECT v_used + 1, COALESCE(v_oldest, NOW()), TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit_v2(UUID, TEXT, BIGINT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_rate_limit_v2(UUID, TEXT, BIGINT, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.consume_rate_limit_v2(UUID, TEXT, BIGINT, INTEGER) FROM authenticated;

-- ----------------------------
-- 6. Global daily LLM budget
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.llm_daily_usage (
  day   DATE PRIMARY KEY,
  calls INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.llm_daily_usage ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (which bypasses RLS) reads or writes it.
REVOKE ALL ON public.llm_daily_usage FROM anon, authenticated;

COMMENT ON TABLE public.llm_daily_usage IS
  'Per-day count of LLM-backed requests, used as a global cost cap.';

-- Returns TRUE and counts the call when under p_limit for the current UTC day,
-- FALSE (without counting) when the budget is spent.
CREATE OR REPLACE FUNCTION public.consume_llm_budget(p_limit INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_calls INTEGER;
BEGIN
  INSERT INTO public.llm_daily_usage AS u (day, calls)
  VALUES ((NOW() AT TIME ZONE 'utc')::DATE, 1)
  ON CONFLICT (day) DO UPDATE
    SET calls = u.calls + 1
    WHERE u.calls < p_limit
  RETURNING calls INTO v_calls;

  RETURN v_calls IS NOT NULL AND v_calls <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_llm_budget(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_llm_budget(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.consume_llm_budget(INTEGER) FROM authenticated;

-- ----------------------------
-- 7. Index cleanup
-- ----------------------------
-- profiles.id is the primary key; this duplicated its index.
DROP INDEX IF EXISTS public.idx_profiles_id;
-- Duplicates idx_rate_limits_user_action_created from 011.
DROP INDEX IF EXISTS public.idx_rate_limits_user_action_time;
-- Never queried; large write overhead on every insert/update of output_json.
DROP INDEX IF EXISTS public.idx_transformations_output_gin;

-- Purge query support.
CREATE INDEX IF NOT EXISTS idx_transformations_deleted_at
  ON public.transformations (deleted_at)
  WHERE is_deleted = TRUE;

-- The original comment claimed raw input was never stored; since 009 it is.
COMMENT ON TABLE public.transformations IS
  'One row per tailoring run. Stores the submitted resume (input_plain_text, output_json.original_resume_text) and job description (output_json.original_job_description) for comparison and rescoring. Soft-deleted rows are purged after 30 days.';
