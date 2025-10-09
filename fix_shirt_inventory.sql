-- Fix Shirt Inventory Issue
-- Run this to add stock for the shirt product

-- Step 1: Verify shirt product exists
SELECT
    id,
    name,
    organization_id,
    status,
    selling_price
FROM products
WHERE name = 'shirt' AND organization_id = '60041288016';

-- Step 2: Check current inventory
SELECT
    product_id,
    organization_id,
    available_stock,
    minimum_stock,
    location_code
FROM inventory_current
WHERE product_id = 'f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed'
AND organization_id = '60041288016';

-- Step 3: Add inventory stock (if missing or zero)
INSERT INTO inventory_current (
    product_id,
    organization_id,
    available_stock,
    minimum_stock,
    location_code,
    warehouse_id,
    created_at,
    updated_at
)
VALUES (
    'f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed',  -- shirt product ID
    '60041288016',                             -- organization ID
    100,                                       -- available stock
    10,                                        -- minimum stock
    'MAIN',                                    -- location code
    null,                                      -- warehouse ID
    NOW(),
    NOW()
)
ON CONFLICT (organization_id, product_id, location_code)
DO UPDATE SET
    available_stock = 100,
    updated_at = NOW();

-- Step 4: Verify inventory was added
SELECT
    p.name,
    ic.available_stock,
    ic.minimum_stock,
    ic.location_code
FROM products p
JOIN inventory_current ic ON p.id = ic.product_id AND p.organization_id = ic.organization_id
WHERE p.name = 'shirt' AND p.organization_id = '60041288016';

-- Step 5: Also add zoho_contact_id field to shops table (if not exists)
ALTER TABLE shops ADD COLUMN IF NOT EXISTS zoho_contact_id VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_shops_zoho_contact_id ON shops(zoho_contact_id);

-- Success message
SELECT
    'Shirt inventory setup complete!' as status,
    COUNT(*) as inventory_records
FROM inventory_current
WHERE product_id = 'f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed';
