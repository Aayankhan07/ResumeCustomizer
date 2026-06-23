-- migrations/004_functions.sql

-- ============================
-- Auto-create profile on signup
-- ============================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================
-- Auto-update updated_at on row change
-- ============================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER transformations_updated_at
  BEFORE UPDATE ON public.transformations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================
-- Increment usage_stats on new transformation
-- ============================
CREATE OR REPLACE FUNCTION public.increment_transformation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usage_stats 
  SET 
    total_transformations = total_transformations + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transformation_created
  AFTER INSERT ON public.transformations
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_transformation_count();

-- ============================
-- Increment user count on new user
-- ============================
CREATE OR REPLACE FUNCTION public.increment_user_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usage_stats 
  SET 
    total_users = total_users + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_user_count();

-- ============================
-- Soft-delete: set deleted_at timestamp
-- ============================
CREATE OR REPLACE FUNCTION public.soft_delete_transformation(p_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.transformations
  SET is_deleted = TRUE, deleted_at = NOW()
  WHERE id = p_id AND user_id = p_user_id;
END;
$$;

-- ============================
-- Cleanup: delete rate_limit rows older than 2 hours
-- (Called from Edge Function cleanup job)
-- ============================
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '2 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
