ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS file_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS markdown TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS inquiry_type TEXT NOT NULL DEFAULT 'quote',
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'inquiries'
      AND constraint_name = 'inquiries_inquiry_type_check'
  ) THEN
    ALTER TABLE inquiries DROP CONSTRAINT inquiries_inquiry_type_check;
  END IF;
END $$;

ALTER TABLE inquiries
  ADD CONSTRAINT inquiries_inquiry_type_check
  CHECK (inquiry_type IN ('quote', 'test-demo'));

UPDATE inquiries
SET status = 'in-review'
WHERE status = 'received';

ALTER TABLE inquiries
  ALTER COLUMN status SET DEFAULT 'in-review';
