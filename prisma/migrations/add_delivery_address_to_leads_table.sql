-- Add delivery_address to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN leads.delivery_address IS 'Delivery address for the lead';
