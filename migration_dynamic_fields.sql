-- Enable Row Level Security (RLS) if not already enabled
-- alter table logs enable row level security;

-- 1. Add custom_data column to logs
alter table logs add column custom_data jsonb default '{}'::jsonb;

-- 2. Create field_definitions table
create table field_definitions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  label text not null,
  key_name text not null,
  type text not null, -- 'text', 'number', 'select', 'time', 'boolean'
  options text[] default null,
  is_active boolean default true,
  sort_order integer default 0
);

-- 3. Enable RLS and Policy
alter table field_definitions enable row level security;
create policy "Allow public access" on field_definitions for all using (true) with check (true);
