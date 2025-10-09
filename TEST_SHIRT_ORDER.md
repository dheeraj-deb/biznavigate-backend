# Test Guide: Shirt Order Flow

## Issue Summary
When sending "shirt x 1", the system should:
1. ✅ Detect ORDER_PLACED intent
2. ✅ Search for "shirt" in semantic search
3. ✅ Find shirt product (organization_id: 60041288016)
4. ✅ Check inventory availability
5. ✅ Show ORDER_CONFIRMATION template with product details
6. ✅ User confirms → Create Zoho Sales Order

## Prerequisites

### 1. Database Setup
Verify shirt product exists:
```sql
SELECT
    id,
    name,
    organization_id,
    status,
    selling_price
FROM products
WHERE name = 'shirt' AND organization_id = '60041288016';
```

Expected result:
```
id: f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed
name: shirt
organization_id: 60041288016
status: active
selling_price: 200.0000
```

### 2. Inventory Setup
Ensure shirt has stock:
```sql
SELECT
    product_id,
    organization_id,
    available_stock,
    location_code
FROM inventory_current
WHERE product_id = 'f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed'
AND organization_id = '60041288016';
```

**If no inventory exists**, add stock:
```sql
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
    'f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed',
    '60041288016',
    100,  -- available stock
    10,   -- minimum stock
    'MAIN',
    null,
    NOW(),
    NOW()
)
ON CONFLICT (organization_id, product_id, location_code)
DO UPDATE SET
    available_stock = 100,
    updated_at = NOW();
```

### 3. Distributor Credential Verification
```sql
SELECT
    whatsapp_number,
    organization_id,
    client_id
FROM zoho_user_credential
WHERE organization_id = '60041288016';
```

Expected:
```
whatsapp_number: +14155238886
organization_id: 60041288016
```

### 4. Run Migration
Add zoho_contact_id field to shops table:
```bash
psql -d biznavigate -f migrations/add_zoho_contact_id.sql
```

Or manually:
```sql
ALTER TABLE shops ADD COLUMN IF NOT EXISTS zoho_contact_id VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_shops_zoho_contact_id ON shops(zoho_contact_id);
```

## Testing Methods

### Method 1: Using API Test Endpoint
```bash
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d @test_shirt_order.json
```

### Method 2: Using Postman/Thunder Client
**POST** `http://localhost:3000/whatsapp/test/message`

**Body:**
```json
{
  "distributorPhoneNumber": "whatsapp:+14155238886",
  "userPhoneNumber": "whatsapp:+1234567890",
  "message": "shirt x 1"
}
```

### Method 3: Full Conversation Flow Test
```bash
curl -X POST http://localhost:3000/whatsapp/test/conversation-flow \
  -H "Content-Type: application/json" \
  -d '{
    "distributorPhoneNumber": "whatsapp:+14155238886",
    "userPhoneNumber": "whatsapp:+1234567890",
    "messages": [
      "hi",
      "shirt x 1",
      "1"
    ]
  }'
```

## Expected Logs

### 1. Organization ID Lookup
```
[ORG_ID] Looking up organization for phone: whatsapp:+14155238886
[ORG_ID] Clean phone number: 14155238886
[ORG_ID] ✅ Found organizationId: 60041288016 (matched: +14155238886)
```

### 2. Product Matching
```
[PRODUCT_MATCH] Organization ID: 60041288016
[PRODUCT_MATCH] Input text: "shirt x 1"
[SEMANTIC_SEARCH] Query: "shirt"
[SEMANTIC_SEARCH] Organization ID: 60041288016
[SEMANTIC_SEARCH] Found X active products in database
[SEMANTIC_SEARCH] Matched 1 products
[SEMANTIC_SEARCH] Top matches: [{ name: 'shirt', confidence: 1.0, available: true }]
[PRODUCT_MATCH] ✅ Matched products: 1 items
[PRODUCT_MATCH] Order total: ₹200
```

### 3. State Machine Transition
```
[GUARD] ORDER_PLACED -> ORDER_CONFIRMATION: hasValidProducts=true
========== TRANSITION ==========
PLACE_ORDER_REQUEST --[ORDER_PLACED]--> ORDER_CONFIRMATION
================================
```

### 4. Expected Response
```json
{
  "success": true,
  "data": {
    "message": "📋 *Order Summary*\n\nshirt x 1 - ₹200\n\n💰 Total: ₹200\n\n✅ Please confirm:\n1️⃣ Yes, place this order\n2️⃣ No, let me modify\n\nReply with 1 or 2"
  }
}
```

## When User Confirms (sends "1")

### Expected Logs:
```
[ZOHO] Creating sales order for user with products: 1
[ZOHO] Using existing customer: <zoho_contact_id>
[ZOHO] Sales order payload: {...}
[ZOHO] Sales order created successfully: <salesorder_id>
```

### Expected Response:
```
🎉 *Order Confirmed!*

📋 Order Details:
shirt x 1 - ₹200

💰 Total Amount: ₹200

✅ Sales Order Created!
📝 Order Number: SO-12345
🔖 Order ID: <zoho_salesorder_id>

📧 Invoice will be sent shortly
🚚 You'll be notified about delivery

Type 'hi' to place another order!

Thank you for your business! 😊
```

## Troubleshooting

### Issue 1: Organization ID not found
**Logs show:**
```
[ORG_ID] ❌ No credential found for phone: whatsapp:+14155238886
```

**Fix:**
- Check `zoho_user_credential` table has correct `whatsapp_number`
- Verify phone format matches (with or without `+`)

### Issue 2: No products found
**Logs show:**
```
[SEMANTIC_SEARCH] Found 0 active products in database
```

**Fix:**
```sql
-- Check if products exist for organization
SELECT COUNT(*) FROM products WHERE organization_id = '60041288016' AND status = 'active';
```

### Issue 3: Product matched but not available
**Logs show:**
```
[SEMANTIC_SEARCH] Top matches: [{ name: 'shirt', confidence: 1.0, available: false }]
[PRODUCT_MATCH] ✅ Matched products: 0 items
```

**Fix:**
- Check `inventory_current` has stock for the product
- Run the INSERT inventory SQL above

### Issue 4: Low confidence match
**Logs show:**
```
[SEMANTIC_SEARCH] Top matches: [{ name: 'shirt', confidence: 0.5, available: true }]
```

**Reason:**
- Product name might not exactly match (e.g., "Cotton Shirt" vs "shirt")
- Semantic search confidence below 0.7 threshold

**Fix:**
- Lower threshold in `product-matcher.service.ts:48`
- Or ensure product name is exactly "shirt"

## Success Criteria

✅ Organization ID found: 60041288016
✅ Semantic search finds shirt with confidence >= 0.7
✅ Inventory shows available stock > 0
✅ State transitions to ORDER_CONFIRMATION
✅ User sees order summary with shirt details
✅ User confirms, Zoho sales order created
✅ User sees order number and success message

## Quick Verification Commands

```bash
# 1. Start the server
npm run start:dev

# 2. In another terminal, test the endpoint
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"whatsapp:+14155238886","userPhoneNumber":"whatsapp:+1234567890","message":"shirt x 1"}'

# 3. Check logs for [PRODUCT_MATCH], [SEMANTIC_SEARCH], [GUARD] messages

# 4. If successful, test confirmation
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"whatsapp:+14155238886","userPhoneNumber":"whatsapp:+1234567890","message":"1"}'
```

## Notes

- The improved organization ID lookup now tries multiple phone number formats
- Detailed logging added for debugging
- The system correctly filters products by organization_id and availability
- Zoho sales order is only created when user confirms (sends "1")
