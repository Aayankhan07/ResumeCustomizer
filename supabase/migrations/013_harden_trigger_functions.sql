-- ============================================================
-- 013: Close the remaining SECURITY DEFINER RPC endpoints
-- ============================================================
-- Follow-up to 012, driven by `supabase db advisors --type security`.
--
-- handle_new_user, increment_transformation_count and increment_user_count
-- are trigger functions, but Postgres still grants EXECUTE to PUBLIC on
-- creation, so each was also reachable as a REST endpoint
-- (/rest/v1/rpc/<name>) by anon and authenticated. increment_user_count and
-- increment_transformation_count write to usage_stats, so a caller could
-- inflate the public counters at will; handle_new_user writes to profiles.
--
-- Triggers fire with the privileges of the table owner and do not consult
-- EXECUTE grants, so revoking here removes the RPC surface without affecting
-- signup or the transformation counters.
--
-- public.rls_auto_enable is deliberately untouched: it is managed by the
-- Supabase platform rather than this repo.
-- ============================================================

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

REVOKE ALL ON FUNCTION public.increment_transformation_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_transformation_count() FROM anon;
REVOKE ALL ON FUNCTION public.increment_transformation_count() FROM authenticated;

REVOKE ALL ON FUNCTION public.increment_user_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_user_count() FROM anon;
REVOKE ALL ON FUNCTION public.increment_user_count() FROM authenticated;

-- ============================
-- handle_updated_at had no search_path set (advisor: function_search_path_
-- mutable). 011 hardened the other definer functions but missed this one.
-- ============================
ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM authenticated;
