# Quick Fix: "shirt x 1" Not Working

## TL;DR - Run These Commands

```bash
# 1. Fix the database (add inventory stock + migration)
psql -d biznavigate -f fix_shirt_inventory.sql

# 2. Rebuild the code
npm run build

# 3. Start the server
npm run start:dev

# 4. Test in another terminal (using TEST endpoint - doesn't send actual WhatsApp)
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"+14155238886","userPhoneNumber":"+1234567890","message":"shirt x 1"}'
```

## What Should Happen

### ✅ Success Response:
```json
{
  "success": true,
  "data": {
    "message": "📋 *Order Summary*\n\nshirt x 1 - ₹200\n\n💰 Total: ₹200\n\n✅ Please confirm:\n1️⃣ Yes, place this order\n2️⃣ No, let me modify\n\nReply with 1 or 2"
  }
}
```

### ✅ Server Logs Should Show:
```
[ORG_ID] ✅ Found organizationId: 60041288016
[SEMANTIC_SEARCH] Matched 1 products
[SEMANTIC_SEARCH] Top matches: [{ name: 'shirt', confidence: 1.0, available: true }]
[PRODUCT_MATCH] ✅ Matched products: 1 items
[GUARD] ORDER_PLACED -> ORDER_CONFIRMATION: hasValidProducts=true
```

## If Still Not Working

### Check Logs For:
```bash
# Look for this in your server logs
grep -E "\[ORG_ID\]|\[SEMANTIC_SEARCH\]|\[PRODUCT_MATCH\]|\[GUARD\]" logs.txt
```

### Common Issues:

**1. Organization ID Not Found**
```
[ORG_ID] ❌ No credential found for phone: whatsapp:+14155238886
```
**Fix**: Check your `zoho_user_credential` table has the correct whatsapp_number

**2. No Products Found**
```
[SEMANTIC_SEARCH] Found 0 active products in database
```
**Fix**: Verify shirt exists with `organization_id = '60041288016'` and `status = 'active'`

**3. Product Found But Not Available**
```
[SEMANTIC_SEARCH] Top matches: [{ name: 'shirt', confidence: 1.0, available: false }]
```
**Fix**: Run `fix_shirt_inventory.sql` to add stock

**4. Low Confidence**
```
[SEMANTIC_SEARCH] Top matches: [{ name: 'shirt', confidence: 0.5, available: true }]
```
**Fix**: Product name doesn't match well - check exact product name in DB

## Test Full Flow (Order + Confirm)

```bash
# Step 1: Place order
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"whatsapp:+14155238886","userPhoneNumber":"whatsapp:+1234567890","message":"shirt x 1"}'

# Step 2: Confirm order (creates Zoho sales order)
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"whatsapp:+14155238886","userPhoneNumber":"whatsapp:+1234567890","message":"1"}'
```

Expected final response:
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

## Files to Check

📁 `IMPLEMENTATION_SUMMARY.md` - Full implementation details
📁 `TEST_SHIRT_ORDER.md` - Complete testing guide
📁 `WHATSAPP_ORDER_FLOW_IMPLEMENTATION.md` - Technical docs
📁 `fix_shirt_inventory.sql` - Quick database fix

## That's It!

Run the 4 commands at the top, and "shirt x 1" should work! 🎉
