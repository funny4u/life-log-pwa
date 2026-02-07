-- 1. DROP ALL EXISTING POLICIES (Aggressive Cleanup)
-- This dynamic block removes ANY policy on these tables, ensuring "Public" policies are gone.
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('logs', 'categories', 'field_definitions', 'profiles')
    ) 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON "' || r.tablename || '";'; 
    END LOOP; 
END $$;

-- 2. FORCE ENABLE RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. RE-APPLY STRICT POLICIES
-- Only allow access where auth.uid() matches the record's user_id

-- Logs
create policy "Owner only: select logs" on logs for select using (auth.uid() = user_id);
create policy "Owner only: insert logs" on logs for insert with check (auth.uid() = user_id);
create policy "Owner only: update logs" on logs for update using (auth.uid() = user_id);
create policy "Owner only: delete logs" on logs for delete using (auth.uid() = user_id);

-- Categories
create policy "Owner only: select categories" on categories for select using (auth.uid() = user_id);
create policy "Owner only: insert categories" on categories for insert with check (auth.uid() = user_id);
create policy "Owner only: update categories" on categories for update using (auth.uid() = user_id);
create policy "Owner only: delete categories" on categories for delete using (auth.uid() = user_id);

-- Field Definitions
create policy "Owner only: select fields" on field_definitions for select using (auth.uid() = user_id);
create policy "Owner only: insert fields" on field_definitions for insert with check (auth.uid() = user_id);
create policy "Owner only: update fields" on field_definitions for update using (auth.uid() = user_id);
create policy "Owner only: delete fields" on field_definitions for delete using (auth.uid() = user_id);

-- Profiles
create policy "Owner only: select profile" on profiles for select using (auth.uid() = id);
create policy "Owner only: update profile" on profiles for update using (auth.uid() = id);
