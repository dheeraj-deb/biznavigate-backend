export interface Cart {
  cart_id: string;
  business_id: string;
  tenant_id: string;
  lead_id: string;
  status: CartStatus;
  total_amount: number;
  total_items: number;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  cart_item_id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  snapshot?: any; // Product details snapshot
  created_at: Date;
  updated_at: Date;
}

export interface CartWithItems extends Cart {
  items: CartItem[];
}

export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted',
  EXPIRED = 'expired',
}
