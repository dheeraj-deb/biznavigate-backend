-- Check shirt inventory
SELECT
    p.id,
    p.name,
    p.organization_id,
    p.status,
    p.selling_price,
    ic.available_stock,
    ic.minimum_stock,
    ic.location_code
FROM products p
LEFT JOIN inventory_current ic ON p.id = ic.product_id AND p.organization_id = ic.organization_id
WHERE
    p.name = 'shirt'
    AND p.organization_id = '60041288016';

-- Check if inventory_current has any stock for shirt
SELECT * FROM inventory_current
WHERE organization_id = '60041288016'
AND product_id = 'f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed';

-- Check distributor's organization ID
SELECT
    whatsapp_number,
    organization_id,
    client_id
FROM zoho_user_credential
WHERE organization_id = '60041288016';
