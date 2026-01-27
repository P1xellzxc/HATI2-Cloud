-- Enable RLS for all tables
-- Users Table (Public Profile)
create table public.users (
  id uuid not null references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.users for select
  using ( true );

create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Folders (The Hubs)
create table public.folders (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.users(id) not null,
  name text not null,
  currency text default 'PHP' not null,
  icon text,
  created_at timestamptz default now()
);

alter table public.folders enable row level security;

-- Folder Members (Access Control)
create table public.folder_members (
  folder_id uuid references public.folders(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  primary key (folder_id, user_id)
);

alter table public.folder_members enable row level security;

-- Expenses (The Spokes)
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references public.folders(id) on delete cascade not null,
  paid_by uuid references public.users(id) not null,
  amount numeric(12, 2) not null,
  description text not null,
  category text,
  split_details jsonb default '{}'::jsonb,
  date date default CURRENT_DATE,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

-- RLS POLICIES --

-- Folders: Users can view folders they are members of
create policy "Users can view folders they belong to"
  on public.folders for select
  using (
    exists (
      select 1 from public.folder_members
      where folder_members.folder_id = folders.id
      and folder_members.user_id = auth.uid()
    )
  );

create policy "Users can insert folders"
  on public.folders for insert
  with check ( auth.uid() = owner_id );

-- Folder Members: 
create policy "Members can view other members of same folder"
  on public.folder_members for select
  using (
    exists (
      select 1 from public.folder_members as fm
      where fm.folder_id = folder_members.folder_id
      and fm.user_id = auth.uid()
    )
  );

-- Expenses: Viewable if member of folder
create policy "Members can view expenses in folder"
  on public.expenses for select
  using (
    exists (
      select 1 from public.folder_members
      where folder_members.folder_id = expenses.folder_id
      and folder_members.user_id = auth.uid()
    )
  );

create policy "Editors can insert expenses"
  on public.expenses for insert
  with check (
    exists (
      select 1 from public.folder_members
      where folder_members.folder_id = expenses.folder_id
      and folder_members.user_id = auth.uid()
      and folder_members.role in ('owner', 'editor')
    )
  );
