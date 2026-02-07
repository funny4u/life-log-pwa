-- 1. DROP OLD POLICIES (If they exist)
-- Check and drop permissive policies that might allow public access

-- Categories
drop policy if exists "Enable read access for all users" on categories;
drop policy if exists "Enable insert for all users" on categories;
drop policy if exists "Enable update for all users" on categories;
drop policy if exists "Enable delete for all users" on categories;

-- Logs (Assuming standard names or just cleaning up potential defaults)
drop policy if exists "Enable read access for all users" on logs;
drop policy if exists "Enable insert for all users" on logs;
drop policy if exists "Enable update for all users" on logs;
drop policy if exists "Enable delete for all users" on logs;

-- Field Definitions
drop policy if exists "Enable read access for all users" on field_definitions;
drop policy if exists "Enable insert for all users" on field_definitions;
drop policy if exists "Enable update for all users" on field_definitions;
drop policy if exists "Enable delete for all users" on field_definitions;


-- 2. CLAIM ORPHANED DATA (Optional: Run this ONLY if you want to assign existing data to YOURSELF)
-- Replace 'YOUR_USER_ID_HERE' with your actual User ID from auth.users (you can find it in Supabase Auth dashboard)
-- OR, if you run this in SQL Editor, you can try to find your ID, but it's safer to copy-paste it.

-- Example: Update logs set user_id = 'YOUR-UUID' where user_id is null;


-- 3. VERIFY RLS IS ON
alter table logs enable row level security;
alter table categories enable row level security;
alter table field_definitions enable row level security;
alter table profiles enable row level security;
