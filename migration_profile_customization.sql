-- Add app_title and app_tagline to profiles table
alter table profiles add column if not exists app_title text default 'My Life Log';
alter table profiles add column if not exists app_tagline text default 'Keep track of everything';

-- Update RLS to allow user to view and update their own title/tagline is already covered by existing policies:
-- "Owner only: select profile" -> auth.uid() = id
-- "Owner only: update profile" -> auth.uid() = id
