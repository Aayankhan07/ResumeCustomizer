-- migrations/007_idempotency.sql

-- Add idempotency_key column to transformations table
ALTER TABLE public.transformations 
ADD COLUMN idempotency_key TEXT;

-- Create a compound index for fast idempotency lookups
CREATE INDEX idx_transformations_idempotency 
ON public.transformations(user_id, idempotency_key, created_at DESC) 
WHERE is_deleted = FALSE;
