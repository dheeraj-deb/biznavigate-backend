export class Product {
  product_id: string;
  business_id: string;
  tenant_id: string;
  product_type: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  image_urls?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  sku?: string;
  brand?: string;
  condition?: string;
  weight?: number;
  dimensions?: string;
  compare_price?: number;
  currency?: string;
  track_inventory?: boolean;
  in_stock?: boolean;
  primary_image_url?: string;
  ai_enhanced_description?: string;
  ai_generated_tags?: any;
  has_variants?: boolean;
  slug?: string;
}

export class ProductVariant {
  variant_id: string;
  product_id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  in_stock: boolean;
  variant_options?: any;
  created_at: Date;
  updated_at: Date;
}
