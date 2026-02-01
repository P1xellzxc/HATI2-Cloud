-- Check if policy exists and create if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'expenses' 
        AND policyname = 'enable_update_for_folder_members'
    ) THEN
        CREATE POLICY "enable_update_for_folder_members" ON "public"."expenses"
        FOR UPDATE USING (
            exists (
                select 1 from folder_members
                where folder_members.folder_id = expenses.folder_id
                and folder_members.user_id = auth.uid()
            )
        );
    END IF;

     IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'expenses' 
        AND policyname = 'enable_delete_for_folder_members'
    ) THEN
        CREATE POLICY "enable_delete_for_folder_members" ON "public"."expenses"
        FOR DELETE USING (
            exists (
                select 1 from folder_members
                where folder_members.folder_id = expenses.folder_id
                and folder_members.user_id = auth.uid()
            )
        );
    END IF;
END
$$;
