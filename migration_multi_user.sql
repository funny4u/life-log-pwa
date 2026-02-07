-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  language text default 'ko',
  constraint valid_language check (language in ('en', 'ko'))
);

-- Turn on RLS for profiles
alter table profiles enable row level security;

create policy "Users can view their own profile."
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile."
  on profiles for update
  using (auth.uid() = id);
  
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, language)
  values (new.id, new.raw_user_meta_data->>'language');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CATEGORIES
alter table categories add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table categories enable row level security;

create policy "Users can view their own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- LOGS
alter table logs add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table logs enable row level security;

create policy "Users can view their own logs"
  on logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own logs"
  on logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own logs"
  on logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own logs"
  on logs for delete
  using (auth.uid() = user_id);

-- FIELD DEFINITIONS
alter table field_definitions add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table field_definitions enable row level security;

create policy "Users can view their own field_definitions"
  on field_definitions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own field_definitions"
  on field_definitions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own field_definitions"
  on field_definitions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own field_definitions"
  on field_definitions for delete
  using (auth.uid() = user_id);
