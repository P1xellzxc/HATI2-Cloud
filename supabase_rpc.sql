-- Create a function to handle folder creation transactionally
create or replace function public.create_folder_transaction(
  name text,
  currency text,
  icon text
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_folder_id uuid;
  current_user_id uuid;
begin
  -- Get current user
  current_user_id := auth.uid();
  
  -- Insert Folder
  insert into public.folders (name, currency, icon, owner_id)
  values (name, currency, icon, current_user_id)
  returning id into new_folder_id;

  -- Insert Member (Owner)
  insert into public.folder_members (folder_id, user_id, role)
  values (new_folder_id, current_user_id, 'owner');

  return new_folder_id;
end;
$$;
