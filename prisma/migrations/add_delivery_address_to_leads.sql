-- Add delivery_address column to leads table
ALTER TABLE leads
ADD COLUMN delivery_address TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_delivery_address ON leads(lead_id, delivery_address);
