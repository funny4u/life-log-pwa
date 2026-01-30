-- Remove the check constraint that limits categories to a fixed list
ALTER TABLE logs DROP CONSTRAINT IF EXISTS logs_category_check;
