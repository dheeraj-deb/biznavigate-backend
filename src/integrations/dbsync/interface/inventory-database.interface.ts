export interface ProductSyncData {
  name: string;
  description?: string;
  sku?: string;
  sellingPrice?: number;
  purchasePrice?: number;
  taxRate?: number;
  isActive?: boolean;
  categoryName?: string;
  attributes?: Record<string, any>;
  images?: Array<{ name: string; type: string; url?: string }>;
  reorderLevel?: number;
  systemData?: Record<string, any>;
}

export interface InventorySyncData {
  quantityOnHand: number;
  availableStock: number;
  reservedStock?: number;
  onOrderStock?: number;
  averageCost?: number;
  lastCost?: number;
}
