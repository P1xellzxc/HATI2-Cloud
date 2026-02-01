-- Fix: Add missing RLS policies for Folders

-- Allow owners to update their folders
create policy "Owners can update folders"
  on public.folders for update
  using ( auth.uid() = owner_id );

-- Allow owners to delete their folders
create policy "Owners can delete folders"
  on public.folders for delete
  using ( auth.uid() = owner_id );
