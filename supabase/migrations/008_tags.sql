-- migrations/008_tags.sql

-- Add tags text array column
ALTER TABLE public.transformations 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add status text column with constraint check
ALTER TABLE public.transformations 
ADD COLUMN status TEXT DEFAULT 'Saved' 
CHECK (status IN ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'));
