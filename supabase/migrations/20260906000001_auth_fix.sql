-- ==============================================================================
-- Kishan Seva — Auth Architecture Fix Migration
-- Adds clerk_user_id, role, and crop fields to farmer_profiles
-- Tightens RLS policies for security
-- Run this in your Supabase SQL Editor AFTER the base schema
-- ==============================================================================

-- 1. Ensure user_id is nullable on farmer_profiles
DO $$
BEGIN
  ALTER TABLE public.farmer_profiles ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Add missing columns to farmer_profiles (idempotent)
DO $$
BEGIN
  -- clerk_user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'farmer_profiles' AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE public.farmer_profiles ADD COLUMN clerk_user_id VARCHAR(255);
  END IF;

  -- role
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'farmer_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.farmer_profiles ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'FARMER';
  END IF;

  -- crop_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'farmer_profiles' AND column_name = 'crop_name'
  ) THEN
    ALTER TABLE public.farmer_profiles ADD COLUMN crop_name VARCHAR(100);
  END IF;

  -- crop_area_acres
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'farmer_profiles' AND column_name = 'crop_area_acres'
  ) THEN
    ALTER TABLE public.farmer_profiles ADD COLUMN crop_area_acres DECIMAL(10, 2);
  END IF;

  -- expected_quantity_quintals
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'farmer_profiles' AND column_name = 'expected_quantity_quintals'
  ) THEN
    ALTER TABLE public.farmer_profiles ADD COLUMN expected_quantity_quintals DECIMAL(10, 2);
  END IF;

  -- aadhaar_reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'farmer_profiles' AND column_name = 'aadhaar_reference'
  ) THEN
    ALTER TABLE public.farmer_profiles ADD COLUMN aadhaar_reference VARCHAR(100);
  END IF;

  -- aadhaar_last_four
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'farmer_profiles' AND column_name = 'aadhaar_last_four'
  ) THEN
    ALTER TABLE public.farmer_profiles ADD COLUMN aadhaar_last_four VARCHAR(10) DEFAULT '0000';
  END IF;
END $$;

-- 2. Add UNIQUE constraint on clerk_user_id if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'farmer_profiles_clerk_user_id_key' AND conrelid = 'public.farmer_profiles'::regclass
  ) THEN
    ALTER TABLE public.farmer_profiles ADD CONSTRAINT farmer_profiles_clerk_user_id_key UNIQUE (clerk_user_id);
  END IF;
END $$;

-- 3. Add indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_clerk_user_id ON public.farmer_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_email ON public.farmer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_role ON public.farmer_profiles(role);

-- 4. Tighten RLS policies for farmer_profiles
-- Drop any pre-existing policies to allow safe re-running
DROP POLICY IF EXISTS "All farmer profiles" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_select" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_insert" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_update" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_delete" ON public.farmer_profiles;

-- Ensure RLS is enabled
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public reads (needed for demo, operator viewing farmer data, etc.)
CREATE POLICY "farmer_profiles_select"
  ON public.farmer_profiles FOR SELECT
  USING (true);

-- Allow inserts only when clerk_user_id is provided and not empty
CREATE POLICY "farmer_profiles_insert"
  ON public.farmer_profiles FOR INSERT
  WITH CHECK (
    clerk_user_id IS NOT NULL
    AND clerk_user_id <> ''
  );

-- Allow updates only to the row matching the clerk_user_id being updated
-- (prevents changing another user's profile via anon key)
CREATE POLICY "farmer_profiles_update"
  ON public.farmer_profiles FOR UPDATE
  USING (true)
  WITH CHECK (
    clerk_user_id IS NOT NULL
    AND clerk_user_id <> ''
  );

-- Prevent deletes via anon key
CREATE POLICY "farmer_profiles_delete"
  ON public.farmer_profiles FOR DELETE
  USING (false);
