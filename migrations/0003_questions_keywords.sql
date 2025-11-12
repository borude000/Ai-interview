-- Add optional keywords column for rule-based validation
ALTER TABLE questions ADD COLUMN IF NOT EXISTS keywords TEXT;
