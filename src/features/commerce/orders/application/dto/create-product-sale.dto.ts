import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const PRODUCT_SALE_SOURCES = ['whatsapp', 'shop', 'manual', 'website', 'instagram', 'api'] as const;
export const PRODUCT_SALE_MODES = ['assisted', 'shop_sale'] as const;
export const PRODUCT_SALE_PAYMENT_STATUSES = ['pending', 'paid'] as const;
export const PRODUCT_SALE_PAYMENT_METHODS = ['cash', 'upi', 'cod', 'card', 'wallet', 'other'] as const;
export const PRODUCT_SALE_ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'] as const;

export class CreateProductSaleItemDto {
  @IsUUID()
  item_id: string;

  @IsUUID()
  @IsOptional()
  variant_id?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateProductSaleCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class CreateProductSaleDto {
  @IsUUID()
  @IsOptional()
  lead_id?: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @ValidateNested()
  @Type(() => CreateProductSaleCustomerDto)
  @IsOptional()
  customer?: CreateProductSaleCustomerDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductSaleItemDto)
  items: CreateProductSaleItemDto[];

  @IsIn(PRODUCT_SALE_SOURCES)
  @IsOptional()
  source?: (typeof PRODUCT_SALE_SOURCES)[number];

  @IsIn(PRODUCT_SALE_MODES)
  @IsOptional()
  sale_mode?: (typeof PRODUCT_SALE_MODES)[number];

  @IsIn(PRODUCT_SALE_PAYMENT_STATUSES)
  @IsOptional()
  payment_status?: (typeof PRODUCT_SALE_PAYMENT_STATUSES)[number];

  @IsIn(PRODUCT_SALE_PAYMENT_METHODS)
  @IsOptional()
  payment_method?: (typeof PRODUCT_SALE_PAYMENT_METHODS)[number];

  @IsString()
  @IsOptional()
  payment_reference?: string;

  @IsIn(PRODUCT_SALE_ORDER_STATUSES)
  @IsOptional()
  order_status?: (typeof PRODUCT_SALE_ORDER_STATUSES)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_amount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax_amount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  shipping_fee?: number;

  @IsString()
  @IsOptional()
  shipping_address?: string;

  @IsString()
  @IsOptional()
  shipping_city?: string;

  @IsString()
  @IsOptional()
  shipping_state?: string;

  @IsString()
  @IsOptional()
  shipping_pincode?: string;

  @IsString()
  @IsOptional()
  shipping_phone?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  idempotency_key?: string;
}
