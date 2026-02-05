ALTER TABLE categories ADD COLUMN IF NOT EXISTS default_transaction_type TEXT DEFAULT 'none';
