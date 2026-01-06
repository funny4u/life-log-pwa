-- Add is_default column to categories table
alter table categories add column is_default boolean default false;

-- Create function to ensure only one default category exists
create or replace function ensure_single_default_category()
returns trigger as $$
begin
  if new.is_default = true then
    update categories set is_default = false where id != new.id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger to run the function before update or insert
create trigger trigger_ensure_single_default
before insert or update on categories
for each row
execute function ensure_single_default_category();
