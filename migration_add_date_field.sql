-- Migration: Add 'date' to visible_fields for all categories to ensure it's mandatory
-- This fixes the issue where logs created in categories without 'date' field were locked to creation time.

UPDATE categories
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{visible_fields}',
    (
        CASE
            -- If visible_fields is null/missing, initialize with just ["date"] (and maybe others, but date is critical)
            -- Actually, if it's missing, the app defaults to all standard fields usually, but let's be safe.
            WHEN (settings->'visible_fields') IS NULL THEN '["date"]'::jsonb
            -- If it exists but does NOT contain "date", append "date"
            WHEN NOT (settings->'visible_fields' @> '["date"]') THEN (settings->'visible_fields') || '["date"]'::jsonb
            -- Otherwise keep as is
            ELSE settings->'visible_fields'
        END
    )
);
