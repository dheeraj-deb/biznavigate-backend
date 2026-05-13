-- Add soft-delete support expected by the Prisma customers model.
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_customers_deleted_at
  ON customers(deleted_at);
