-- Create categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  name text not null unique,
  color text default '#94A3B8', -- hex code
  icon text, -- emoji
  sort_order integer default 0,
  is_active boolean default true
);

-- Seed default categories to match existing types
insert into categories (name, color, icon, sort_order) values
('Cooking/Meal', '#F87171', '🍳', 10),
('Car/Maintenance', '#60A5FA', '🚗', 20),
('Visit/Place', '#34D399', '📍', 30),
('Shopping/Expense', '#FBBF24', '🛒', 40),
('Schedule', '#A78BFA', '📅', 50)
on conflict (name) do nothing;

-- RLS Policies
alter table categories enable row level security;

create policy "Enable read access for all users"
on categories for select
using (true);

create policy "Enable insert for all users"
on categories for insert
with check (true);

create policy "Enable update for all users"
on categories for update
using (true);

create policy "Enable delete for all users"
on categories for delete
using (true);
