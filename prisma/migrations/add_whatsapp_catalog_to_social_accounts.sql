-- Add WhatsApp catalog ID to social_accounts table
ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS whatsapp_catalog_id VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN social_accounts.whatsapp_catalog_id IS 'WhatsApp Business catalog ID for this account';
