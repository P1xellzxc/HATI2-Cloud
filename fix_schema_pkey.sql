-- FIX: Reset Primary Key Structure for folder_members

-- 1. Drop existing Primary Key (which involves user_id)
ALTER TABLE public.folder_members DROP CONSTRAINT IF EXISTS folder_members_pkey;

-- 2. Add 'id' column if it doesn't exist yet
ALTER TABLE public.folder_members ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- 3. Make 'id' the new Primary Key
ALTER TABLE public.folder_members ADD PRIMARY KEY (id);

-- 4. NOW we can make user_id nullable (since it's no longer the PK)
ALTER TABLE public.folder_members ALTER COLUMN user_id DROP NOT NULL;

-- 5. Ensure temp_name exists
ALTER TABLE public.folder_members ADD COLUMN IF NOT EXISTS temp_name text;

-- 6. Add the constraint ensuring we have at least one valid identifier
ALTER TABLE public.folder_members DROP CONSTRAINT IF EXISTS check_member_identity;
ALTER TABLE public.folder_members ADD CONSTRAINT check_member_identity CHECK (user_id IS NOT NULL OR temp_name IS NOT NULL);

-- 7. Ensure expenses has the new column too (just in case)
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS paid_by_member_id uuid REFERENCES public.folder_members(id);
-- Fix: Allow paid_by (user_id) to be null so Placeholders can pay
ALTER TABLE public.expenses ALTER COLUMN paid_by DROP NOT NULL;
