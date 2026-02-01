-- Policy to allow Owners/Editors to add new members (invites/placeholders)
create policy "Owners and Editors can add members"
  on public.folder_members for insert
  with check (
    exists (
      select 1 from public.folder_members as fm
      where fm.folder_id = folder_members.folder_id
      and fm.user_id = auth.uid()
      and fm.role in ('owner', 'editor')
    )
  );

-- Also need to update the constraint/check if strict policies are in place
-- But the existing 'select' policy should be fine.
