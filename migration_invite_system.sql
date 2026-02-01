-- Migration: Enable Invite System & Placeholders

-- 1. Update `folder_members` table
-- Drop the old primary key (folder_id, user_id)
ALTER TABLE public.folder_members DROP CONSTRAINT folder_members_pkey;

-- Add a new UUID primary key
ALTER TABLE public.folder_members ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY;

-- Make `user_id` nullable to support placeholders
ALTER TABLE public.folder_members ALTER COLUMN user_id DROP NOT NULL;

-- Add `temp_name` for placeholder display names
ALTER TABLE public.folder_members ADD COLUMN temp_name text;

-- Add constraint: Either user_id OR temp_name must be present (not both null) -> Actually, both could be present during transition, but usually one is main. 
-- Just ensure we can identify the member.
ALTER TABLE public.folder_members ADD CONSTRAINT check_member_identity CHECK (user_id IS NOT NULL OR temp_name IS NOT NULL);


-- 2. Update `expenses` table
-- Add `paid_by_member_id` referencing `folder_members(id)`
ALTER TABLE public.expenses ADD COLUMN paid_by_member_id uuid REFERENCES public.folder_members(id);

-- 3. Data Migration (Best Effort)
-- We need to link existing expenses to the correct member record.
-- This requires finding the member record that matches (folder_id, paid_by (user_id)).
UPDATE public.expenses
SET paid_by_member_id = (
    SELECT id FROM public.folder_members
    WHERE folder_members.folder_id = expenses.folder_id
    AND folder_members.user_id = expenses.paid_by
);

-- 4. Cleanup (Optional / Next Phase)
-- Ideally we make paid_by_member_id NOT NULL after backfill.
-- ALTER TABLE public.expenses ALTER COLUMN paid_by_member_id SET NOT NULL;
-- For now, we leave it nullable to be safe during dev.
