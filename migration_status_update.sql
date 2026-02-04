-- Drop the existing check constraint
ALTER TABLE logs DROP CONSTRAINT IF EXISTS logs_status_check;

-- Add the new check constraint expecting 'Pending', 'Planned', 'Completed'
ALTER TABLE logs ADD CONSTRAINT logs_status_check CHECK (status IN ('Pending', 'Planned', 'Completed'));
