-- migrations/001_initial_schema.sql

-- ============================================================
-- PROFILES
-- Extends auth.users with display data
-- ============================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 
  'User profile data. Extends auth.users. Auto-created on signup.';

-- ============================================================
-- TRANSFORMATIONS
-- Core table: stores transform output + metadata
-- ============================================================
CREATE TABLE public.transformations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Detected metadata from JD parsing
  detected_job_title  TEXT,
  detected_company    TEXT,

  -- Input metadata only (raw text never stored — privacy)
  input_resume_chars  INTEGER CHECK (input_resume_chars > 0),
  input_jd_chars      INTEGER CHECK (input_jd_chars > 0),

  -- AI output (complete structured resume)
  output_json         JSONB NOT NULL,
  
  -- Derived plain text for copy functionality
  output_plain_text   TEXT,

  -- ATS scoring
  match_score         SMALLINT CHECK (match_score >= 0 AND match_score <= 100),
  keywords_matched    TEXT[]   DEFAULT '{}',
  keywords_total      INTEGER  DEFAULT 0,

  -- User-editable label for history
  label               TEXT CHECK (char_length(label) <= 100),

  -- model used
  ai_model            TEXT DEFAULT 'llama-3.3-70b-versatile',
  
  -- Token usage (for monitoring)
  tokens_used         INTEGER,

  -- Soft delete
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at          TIMESTAMPTZ,

  -- Lifecycle
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.transformations IS 
  'Each row = one resume transformation session. Raw input text never stored.';
COMMENT ON COLUMN public.transformations.output_json IS 
  'Full structured resume JSON as returned by AI. Used for PDF re-generation.';
COMMENT ON COLUMN public.transformations.keywords_matched IS 
  'Array of JD keywords found in output. For UI keyword chips display.';

-- ============================================================
-- RATE LIMITS
-- Rolling window rate limit tracking
-- ============================================================
CREATE TABLE public.rate_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL CHECK (action IN ('transform')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.rate_limits IS 
  'Tracks API actions for rate limiting. Rows auto-cleaned by Edge Function.';

-- ============================================================
-- USAGE STATS
-- Global aggregate counters for landing page social proof
-- ============================================================
CREATE TABLE public.usage_stats (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_transformations BIGINT NOT NULL DEFAULT 0,
  total_users           BIGINT NOT NULL DEFAULT 0,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.usage_stats IS 
  'Single-row global stats for landing page social proof counter.';

-- Seed the single row
INSERT INTO public.usage_stats (total_transformations, total_users) 
VALUES (0, 0);
