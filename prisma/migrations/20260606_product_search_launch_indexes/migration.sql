CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_catalog_items_product_business_stock
ON catalog_items (business_id, item_type, is_active, stock_quantity DESC, created_at DESC)
WHERE deleted_at IS NULL AND item_type = 'physical_product';

CREATE INDEX IF NOT EXISTS idx_catalog_items_product_name_trgm
ON catalog_items USING GIN ((lower(coalesce(name, ''))) gin_trgm_ops)
WHERE deleted_at IS NULL AND is_active = true AND item_type = 'physical_product';

CREATE INDEX IF NOT EXISTS idx_catalog_items_product_search_trgm
ON catalog_items USING GIN ((
  lower(
    coalesce(name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(array_to_string(ai_tags, ' '), '')
  )
) gin_trgm_ops)
WHERE deleted_at IS NULL AND is_active = true AND item_type = 'physical_product';

CREATE INDEX IF NOT EXISTS idx_product_item_details_brand_sku_trgm
ON product_item_details USING GIN ((
  lower(coalesce(brand, '') || ' ' || coalesce(sku, ''))
) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_orders_product_payment_expiry
ON orders (payment_expires_at ASC)
WHERE order_type = 'product'
  AND payment_expires_at IS NOT NULL
  AND payment_status IN ('pending', 'payment_pending', 'unpaid')
  AND status NOT IN ('cancelled', 'delivered', 'refunded');
