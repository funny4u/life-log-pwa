-- Add notification_time column to logs table
ALTER TABLE logs ADD COLUMN IF NOT EXISTS notification_time TIMESTAMPTZ DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN logs.notification_time IS 'Time to trigger a browser notification for this log';
