-- Phase 2: Collaboration & Experience Migration

-- 1. Update folder_members for Invite System
-- invite_token: A unique token for this member/placeholder to join/claim.
ALTER TABLE public.folder_members ADD COLUMN invite_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.folder_members ADD CONSTRAINT unique_invite_token UNIQUE (invite_token);

-- invite_email: Optional, to lock an invite to a specific email address for security.
ALTER TABLE public.folder_members ADD COLUMN invite_email text;

-- 2. Create Activity Logs Table
CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    folder_id uuid REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- The actor
    action_type text NOT NULL, -- e.g., 'CREATE_EXPENSE', 'SETTLED', 'UPDATED_FOLDER'
    details jsonb DEFAULT '{}'::jsonb, -- Store snapshot of data or diff
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Members of the folder can view logs
CREATE POLICY "Members can view activity logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.folder_members
            WHERE folder_members.folder_id = activity_logs.folder_id
            AND folder_members.user_id = auth.uid()
        )
    );

-- 3. Update Users Table for Preferences
ALTER TABLE public.users ADD COLUMN default_currency text DEFAULT 'PHP';

-- 4. RPC Function to Claim a Member Profile
-- This safely merges the placeholder into the real user
CREATE OR REPLACE FUNCTION public.claim_member_profile(
    p_invite_token uuid,
    p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member_id uuid;
    v_folder_id uuid;
BEGIN
    -- Find the member record with this token
    SELECT id, folder_id INTO v_member_id, v_folder_id
    FROM public.folder_members
    WHERE invite_token = p_invite_token
    AND user_id IS NULL; -- Only claim placeholders (or unlinked members)

    IF v_member_id IS NULL THEN
        RETURN FALSE; -- Invalid token or already claimed
    END IF;

    -- Update the member record
    UPDATE public.folder_members
    SET 
        user_id = p_user_id,
        temp_name = NULL, -- Clear temp name as they are now a real user
        invite_token = NULL -- Consume the token
    WHERE id = v_member_id;

    -- Log the activity (Optional, but good for audit)
    INSERT INTO public.activity_logs (folder_id, user_id, action_type, details)
    VALUES (v_folder_id, p_user_id, 'MEMBER_CLAIMED', jsonb_build_object('member_id', v_member_id));

    RETURN TRUE;
END;
$$;
