-- Add Instagram catalog fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS in_instagram_catalog BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS instagram_catalog_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram_sync_status VARCHAR(50) DEFAULT 'not_synced',
ADD COLUMN IF NOT EXISTS instagram_sync_error TEXT,
ADD COLUMN IF NOT EXISTS instagram_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS instagram_retailer_id VARCHAR(255);

-- Add Instagram catalog_id to social_accounts table
ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS instagram_catalog_id VARCHAR(255);

-- Create index for Instagram catalog queries
CREATE INDEX IF NOT EXISTS idx_products_instagram_catalog
ON products(business_id, in_instagram_catalog);

-- Add comments for documentation
COMMENT ON COLUMN products.in_instagram_catalog IS 'Whether product is included in Instagram catalog';
COMMENT ON COLUMN products.instagram_catalog_id IS 'Instagram catalog product ID from Meta';
COMMENT ON COLUMN products.instagram_sync_status IS 'Sync status: not_synced, pending, syncing, synced, failed';
COMMENT ON COLUMN products.instagram_sync_error IS 'Last sync error message if failed';
COMMENT ON COLUMN products.instagram_synced_at IS 'Last successful sync timestamp';
COMMENT ON COLUMN products.instagram_retailer_id IS 'Retailer ID used in Meta Graph API (usually product_id)';
COMMENT ON COLUMN social_accounts.instagram_catalog_id IS 'Instagram/Facebook catalog ID for this account';
