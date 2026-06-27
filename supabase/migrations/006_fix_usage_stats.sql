-- migrations/006_fix_usage_stats.sql

-- Clear any existing rows to prevent mismatched UUID keys
DELETE FROM public.usage_stats;

-- Seed the single row using a fixed UUID
INSERT INTO public.usage_stats (id, total_transformations, total_users, updated_at) 
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 0, 0, NOW());

-- Replace increment user trigger function with atomic upsert using the fixed UUID
CREATE OR REPLACE FUNCTION public.increment_user_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.usage_stats (id, total_users, total_transformations, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 1, 0, NOW())
  ON CONFLICT (id) DO UPDATE
  SET 
    total_users = usage_stats.total_users + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Replace increment transformation trigger function with atomic upsert using the fixed UUID
CREATE OR REPLACE FUNCTION public.increment_transformation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.usage_stats (id, total_users, total_transformations, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 0, 1, NOW())
  ON CONFLICT (id) DO UPDATE
  SET 
    total_transformations = usage_stats.total_transformations + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$;
