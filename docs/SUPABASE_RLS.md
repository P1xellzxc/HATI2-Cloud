# Supabase Row Level Security (RLS) Guide

## Why RLS is Critical for HATI² Cloud
Since we are building a multi-user financial application, **confidentiality is paramount**. RLS is the database's firewall. It ensures a user can **only** access rows that belong to them, even if the API is exposed.

**Never disable RLS on public tables.**

---

## 1. Enable RLS
For every table you create, run:
```sql
ALTER TABLE "your_table_name" ENABLE ROW LEVEL SECURITY;
```

## 2. Basic Policies

### Users can only see their own data
This is the most common pattern. It assumes your table has a `user_id` column that links to `auth.users`.

**Select Policy (Read):**
```sql
create policy "Users can view own data"
on "your_table_name"
for select
using ( auth.uid() = user_id );
```

**Insert Policy (Create):**
```sql
create policy "Users can insert own data"
on "your_table_name"
for insert
with check ( auth.uid() = user_id );
```

**Update Policy (Edit):**
```sql
create policy "Users can update own data"
on "your_table_name"
for update
using ( auth.uid() = user_id );
```

---

## 3. Advanced Pattern: Shared Resource (e.g., Shared Expense Folder)
If HATI² Cloud has shared folders (Hub & Spoke model), you need a "junction table" (e.g., `folder_members`) to check access.

**Scenario:**
- Table `folders`: The expense folders
- Table `folder_members`: Links `folder_id` to `user_id`

**Policy for `folders` table:**
```sql
create policy "Users can view folders they belong to"
on folders
for select
using (
  exists (
    select 1 from folder_members
    where folder_members.folder_id = folders.id
    and folder_members.user_id = auth.uid()
  )
);
```

---

## 4. Verification
Always verify policies using the Supabase "Policy Tester" or by trying to query data as a different user in the SQL Editor:
```sql
-- Impersonate user
set request.jwt.claim.sub = 'uuid-of-other-user';
set role authenticated;

-- Run query
select * from "your_table_name";
```
