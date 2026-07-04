-- migrations/010_application_tracking.sql

-- Drop the old constraint if it exists. Note that 008_tags.sql did not name the constraint,
-- so PostgreSQL names it 'transformations_status_check' by default.
ALTER TABLE public.transformations DROP CONSTRAINT IF EXISTS transformations_status_check;

-- Update check constraint to include 'Withdrawn'
ALTER TABLE public.transformations ADD CONSTRAINT transformations_status_check
  CHECK (status IN ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'));

-- Add tracking columns to transformations
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS applied_at timestamptz;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS application_deadline date;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS application_url text;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS job_location text;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS salary_range text;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS recruiter_name text;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS recruiter_contact text;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium'
  CHECK (priority IN ('High', 'Medium', 'Low'));
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.transformations ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Create application_events table
CREATE TABLE IF NOT EXISTS public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transformation_id UUID NOT NULL REFERENCES public.transformations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL CHECK (event_type IN ('interview', 'follow_up', 'note')),

  title TEXT NOT NULL,
  event_date TIMESTAMPTZ,

  -- interview-specific
  interview_round TEXT,
  interview_format TEXT,
  interviewer_name TEXT,

  -- outcome/state
  outcome TEXT DEFAULT 'Pending' CHECK (outcome IN ('Pending', 'Completed', 'Passed', 'Failed', 'Cancelled')),
  is_done BOOLEAN DEFAULT FALSE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select own events" ON public.application_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own events" ON public.application_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own events" ON public.application_events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own events" ON public.application_events
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_transformation ON public.application_events(transformation_id, event_date);
CREATE INDEX IF NOT EXISTS idx_events_user_upcoming ON public.application_events(user_id, event_date)
  WHERE is_done = FALSE AND event_type IN ('interview', 'follow_up');
CREATE INDEX IF NOT EXISTS idx_transformations_deadline ON public.transformations(user_id, application_deadline)
  WHERE is_deleted = FALSE AND application_deadline IS NOT NULL;

-- Trigger to set updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.application_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
