# Inventory Sync Guide

## Overview
Automatic inventory management system that syncs products from the `products` table to `inventory_current` table.

## Quick Start

### 1. Sync All Products (One-Time Setup)

```bash
curl -X POST http://localhost:3000/inventory/sync \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "60041288016",
    "defaultStock": 100,
    "defaultLocation": "MAIN"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Inventory sync completed: 50 created, 0 updated",
  "data": {
    "created": 50,
    "updated": 0,
    "total": 50
  }
}
```

This will:
- ✅ Find all active products for organization `60041288016`
- ✅ Create inventory records with 100 units stock
- ✅ Set location as "MAIN"
- ✅ Skip products that already have inventory

### 2. Test Shirt Order

After syncing, test the order flow:

```bash
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{
    "distributorPhoneNumber": "+14155238886",
    "userPhoneNumber": "+919539192684",
    "message": "shirt x 1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "📋 *Order Summary*\n\nshirt x 1 - ₹200\n\n💰 Total: ₹200\n\n✅ Please confirm:\n1️⃣ Yes, place this order\n2️⃣ No, let me modify\n\nReply with 1 or 2"
  }
}
```

## API Endpoints

### POST /inventory/sync
Sync all products to inventory

**Body:**
```json
{
  "organizationId": "60041288016",  // optional, syncs all if omitted
  "defaultStock": 100,               // default: 100
  "defaultLocation": "MAIN"          // default: "MAIN"
}
```

### POST /inventory/sync/:productId
Sync specific product

**Body:**
```json
{
  "organizationId": "60041288016",
  "availableStock": 100,
  "locationCode": "MAIN"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/inventory/sync/f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "60041288016",
    "availableStock": 100
  }'
```

### POST /inventory/add-stock
Add stock to a product

**Body:**
```json
{
  "productId": "f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed",
  "organizationId": "60041288016",
  "quantity": 50,
  "locationCode": "MAIN"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/inventory/add-stock \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed",
    "organizationId": "60041288016",
    "quantity": 50
  }'
```

### POST /inventory/reduce-stock
Reduce stock (when order placed)

**Body:**
```json
{
  "productId": "f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed",
  "organizationId": "60041288016",
  "quantity": 1
}
```

### GET /inventory/stock/:productId
Get current stock

**Query Params:**
- `organizationId` (required)
- `locationCode` (optional, default: "MAIN")

**Example:**
```bash
curl "http://localhost:3000/inventory/stock/f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed?organizationId=60041288016"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed",
    "organizationId": "60041288016",
    "locationCode": "MAIN",
    "availableStock": 99
  }
}
```

### GET /inventory/low-stock
Get products with low stock

**Query Params:**
- `organizationId` (required)

**Example:**
```bash
curl "http://localhost:3000/inventory/low-stock?organizationId=60041288016"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "abc-123",
      "productName": "Cement",
      "currentStock": 5,
      "minimumStock": 10
    }
  ],
  "count": 1
}
```

## How It Works

### Inventory Current Table Structure
```sql
inventory_current:
  - product_id (FK to products.id)
  - organization_id
  - available_stock (how many units available)
  - minimum_stock (reorder threshold)
  - location_code (warehouse/location)
  - created_at
  - updated_at
```

### Sync Logic

1. **First Sync**: Creates inventory records for all active products
2. **Subsequent Syncs**: Only updates products with 0 or NULL stock
3. **Manual Updates**: Use add-stock/reduce-stock endpoints

### Automatic Stock Reduction

When you integrate the inventory service with order confirmation, you can automatically reduce stock:

```typescript
// In conversation-handler.service.ts, after creating Zoho sales order:
import { InventorySyncService } from 'src/features/products/application/services/inventory-sync.service';

// Reduce stock for each product in the order
for (const product of context.productList) {
  await this.inventorySync.reduceStock(
    product.productId,
    organizationId,
    product.quantity
  );
}
```

## Database Schema

### Required Fields
```sql
CREATE TABLE inventory_current (
  id SERIAL PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  organization_id VARCHAR,
  available_stock DECIMAL DEFAULT 0,
  minimum_stock DECIMAL DEFAULT 10,
  location_code VARCHAR DEFAULT 'MAIN',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(organization_id, product_id, location_code)
);
```

## Best Practices

1. **Initial Setup**: Run full sync once
   ```bash
   POST /inventory/sync with organizationId
   ```

2. **New Products**: Automatically create inventory when product is added
   ```bash
   POST /inventory/sync/:productId
   ```

3. **Stock Updates**: Use add-stock/reduce-stock endpoints
   ```bash
   POST /inventory/add-stock  # When receiving new stock
   POST /inventory/reduce-stock  # When order is placed
   ```

4. **Monitoring**: Check low stock regularly
   ```bash
   GET /inventory/low-stock?organizationId=xxx
   ```

## Troubleshooting

### Product not showing in order
**Issue**: Shirt exists but not available for order

**Check:**
```bash
# 1. Check if inventory exists
curl "http://localhost:3000/inventory/stock/PRODUCT_ID?organizationId=60041288016"

# 2. If stock is 0, run sync
curl -X POST http://localhost:3000/inventory/sync \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"60041288016"}'
```

### Sync not creating records
**Check:**
- Products have `status = 'active'`
- `organization_id` matches
- No duplicate `location_code` for same product

## Complete Example Flow

```bash
# Step 1: Start server
npm run start:dev

# Step 2: Sync all products (one-time)
curl -X POST http://localhost:3000/inventory/sync \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"60041288016","defaultStock":100}'

# Step 3: Verify shirt inventory
curl "http://localhost:3000/inventory/stock/f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed?organizationId=60041288016"

# Step 4: Test order flow
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"+14155238886","userPhoneNumber":"+919539192684","message":"shirt x 1"}'

# Step 5: Confirm order (will reduce stock)
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"+14155238886","userPhoneNumber":"+919539192684","message":"1"}'

# Step 6: Check updated stock
curl "http://localhost:3000/inventory/stock/f44451d7-98b6-4cf2-a6e0-8bb54b6d08ed?organizationId=60041288016"
# Should show 99 (reduced by 1)
```

## Summary

✅ **One command to fix all inventory**:
```bash
curl -X POST http://localhost:3000/inventory/sync \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"60041288016"}'
```

This creates inventory records for ALL active products automatically! 🎉
