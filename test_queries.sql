-- Check if shirt product exists in database
SELECT
    id,
    name,
    sku,
    selling_price,
    status,
    organization_id
FROM products
WHERE
    LOWER(name) LIKE '%shirt%'
    AND status = 'active';

-- Check inventory for shirt products
SELECT
    p.id,
    p.name,
    ic.available_stock,
    ic.organization_id
FROM products p
LEFT JOIN inventory_current ic ON p.id = ic.product_id
WHERE
    LOWER(p.name) LIKE '%shirt%'
    AND p.status = 'active';

-- Check your organization ID from zoho_user_credential
SELECT
    organization_id,
    whatsapp_number,
    client_id
FROM zoho_user_credential;
