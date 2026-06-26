-- migrations/005_fix_safe_updates.sql

-- Fix increment_transformation_count to include WHERE clause for safe update mode
CREATE OR REPLACE FUNCTION public.increment_transformation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usage_stats 
  SET 
    total_transformations = total_transformations + 1,
    updated_at = NOW()
  WHERE id IS NOT NULL; -- Satisfies safe_update mode
  RETURN NEW;
END;
$$;

-- Fix increment_user_count to include WHERE clause for safe update mode
CREATE OR REPLACE FUNCTION public.increment_user_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usage_stats 
  SET 
    total_users = total_users + 1,
    updated_at = NOW()
  WHERE id IS NOT NULL; -- Satisfies safe_update mode
  RETURN NEW;
END;
$$;
