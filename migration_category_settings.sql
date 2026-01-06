-- Add settings column to categories for storing field visibility and defaults
ALTER TABLE categories 
ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
