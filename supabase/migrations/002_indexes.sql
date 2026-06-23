-- migrations/002_indexes.sql

-- profiles
CREATE INDEX idx_profiles_id ON public.profiles(id);

-- transformations
CREATE INDEX idx_transformations_user_id 
  ON public.transformations(user_id) WHERE is_deleted = FALSE;

CREATE INDEX idx_transformations_user_created 
  ON public.transformations(user_id, created_at DESC) WHERE is_deleted = FALSE;

CREATE INDEX idx_transformations_score 
  ON public.transformations(user_id, match_score DESC) WHERE is_deleted = FALSE;

-- rate_limits  
CREATE INDEX idx_rate_limits_user_action_time 
  ON public.rate_limits(user_id, action, created_at DESC);

-- GIN index for JSONB search (optional, for future search feature)
CREATE INDEX idx_transformations_output_gin 
  ON public.transformations USING GIN(output_json);
