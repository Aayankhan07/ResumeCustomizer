-- migrations/003_rls.sql

-- ============================
-- PROFILES
-- ============================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================
-- TRANSFORMATIONS
-- ============================
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transformations_select_own"
  ON public.transformations FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "transformations_insert_own"
  ON public.transformations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transformations_update_own"
  ON public.transformations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: No DELETE policy. We use soft-delete via UPDATE.

-- ============================
-- RATE LIMITS
-- ============================
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits are only read/written by Edge Functions (service role)
-- No user-level policies needed — service role bypasses RLS

-- ============================
-- USAGE STATS
-- ============================
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for landing page stats)
CREATE POLICY "usage_stats_select_all"
  ON public.usage_stats FOR SELECT
  USING (TRUE);

-- Only service role can write (via Edge Functions)
