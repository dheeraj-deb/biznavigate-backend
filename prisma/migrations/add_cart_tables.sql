-- Cart tables for managing customer shopping carts
-- This migration adds cart and cart_items tables

-- Cart table: Stores customer shopping carts
CREATE TABLE IF NOT EXISTS carts (
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    lead_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted', 'expired')),
    total_amount DECIMAL(10, 2) DEFAULT 0,
    total_items INT DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- Cart items table: Stores items in each cart
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    snapshot JSON, -- Store product details at time of adding to cart
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE SET NULL,
    UNIQUE(cart_id, product_id, variant_id) -- Prevent duplicate items
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_carts_lead_id ON carts(lead_id);
CREATE INDEX IF NOT EXISTS idx_carts_business_id ON carts(business_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Comments for documentation
COMMENT ON TABLE carts IS 'Stores customer shopping carts with session management';
COMMENT ON TABLE cart_items IS 'Stores individual items in shopping carts';
COMMENT ON COLUMN carts.status IS 'Cart status: active (in use), abandoned (not updated >24h), converted (order created), expired (>7 days)';
COMMENT ON COLUMN carts.expires_at IS 'Cart expiration time for automatic cleanup';
COMMENT ON COLUMN cart_items.snapshot IS 'JSON snapshot of product details at time of adding to cart';
