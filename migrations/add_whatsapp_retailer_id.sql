-- Add whatsapp_retailer_id column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS whatsapp_retailer_id VARCHAR(255);

-- Backfill existing products: set retailer_id to product_id for already synced products
UPDATE products
SET whatsapp_retailer_id = product_id::text
WHERE whatsapp_catalog_id IS NOT NULL
  AND whatsapp_retailer_id IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_whatsapp_retailer_id
ON products(whatsapp_retailer_id);

-- Add comment
COMMENT ON COLUMN products.whatsapp_retailer_id IS 'The retailer_id sent to Meta WhatsApp catalog (used in product_list messages)';
