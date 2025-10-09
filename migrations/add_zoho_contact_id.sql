-- Add zoho_contact_id column to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS zoho_contact_id VARCHAR(100);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shops_zoho_contact_id ON shops(zoho_contact_id);
