-- migrations/009_input_plain_text.sql

-- Add input_plain_text text column to preserve the original parsed resume text
ALTER TABLE public.transformations 
ADD COLUMN IF NOT EXISTS input_plain_text TEXT;

COMMENT ON COLUMN public.transformations.input_plain_text IS 
  'Raw parsed original resume text for before & after comparison.';
