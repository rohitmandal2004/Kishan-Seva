-- Add clerk_user_id to farmer_profiles
ALTER TABLE public.farmer_profiles
  ADD COLUMN clerk_user_id VARCHAR(255) UNIQUE;

-- We keep user_id as nullable (it was changed to SET NULL in production schema)
-- so existing rows won't break, but new rows will rely on clerk_user_id.
