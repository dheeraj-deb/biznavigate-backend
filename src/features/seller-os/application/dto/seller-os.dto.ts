import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class SellerSaleItemDto {
  @IsUUID()
  item_id: string;

  @IsUUID()
  @IsOptional()
  variant_id?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateManualSaleDto {
  @IsString()
  customer_phone: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellerSaleItemDto)
  items: SellerSaleItemDto[];

  @IsString()
  @IsOptional()
  @IsIn(['cash', 'upi', 'card', 'cod', 'credit', 'other'])
  payment_method?: string;

  @IsString()
  @IsOptional()
  payment_reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  shipping_address?: string;

  @IsString()
  @IsOptional()
  shipping_pincode?: string;

  @IsBoolean()
  @IsOptional()
  delivery_required?: boolean;
}

export class CreateStockReservationDto {
  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsUUID()
  item_id: string;

  @IsUUID()
  @IsOptional()
  variant_id?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(5)
  @IsOptional()
  hold_minutes?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SellerPaymentRequestFromHoldDto {
  @IsString()
  @IsOptional()
  @IsIn(['upi', 'cod', 'cash', 'card', 'other'])
  payment_method?: string;

  @IsString()
  @IsOptional()
  delivery_address?: string;

  @IsString()
  @IsOptional()
  delivery_area?: string;

  @IsBoolean()
  @IsOptional()
  delivery_required?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class MarkSellerOrderPaidDto {
  @IsString()
  @IsOptional()
  @IsIn(['upi', 'cod', 'cash', 'card', 'other'])
  payment_method?: string;

  @IsString()
  @IsOptional()
  payment_reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CancelSellerPaymentOrderDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateCreditCustomerDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsNumber()
  @Min(0)
  credit_limit: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  due_days?: number;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'approved', 'paused', 'blocked'])
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCreditCustomerDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  credit_limit?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  due_days?: number;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'approved', 'paused', 'blocked'])
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateReturnCaseDto {
  @IsUUID()
  @IsOptional()
  order_id?: string;

  @IsUUID()
  @IsOptional()
  product_order_id?: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsString()
  @IsOptional()
  @IsIn(['return', 'exchange', 'refund'])
  return_type?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  requested_amount?: number;

  @IsArray()
  @IsOptional()
  items?: Array<Record<string, any>>;
}

export class CreateDeliveryDto {
  @IsUUID()
  @IsOptional()
  order_id?: string;

  @IsUUID()
  @IsOptional()
  product_order_id?: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsString()
  @IsOptional()
  delivery_mode?: string;

  @IsString()
  @IsOptional()
  delivery_person?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSellerStatusDto {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class AiGuardrailCheckDto {
  @IsString()
  action: string;

  @IsUUID()
  @IsOptional()
  item_id?: string;

  @IsUUID()
  @IsOptional()
  variant_id?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}

export class CreateOwnerApprovalDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  simple_summary?: string;

  @IsString()
  action_type: string;

  @IsString()
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  risk_level?: string;

  @IsString()
  @IsOptional()
  entity_type?: string;

  @IsString()
  @IsOptional()
  entity_id?: string;

  @IsOptional()
  payload?: Record<string, any>;
}

export class SellerSetupProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock_quantity: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost_price?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CompleteSellerSetupDto {
  @IsString()
  @IsOptional()
  store_type?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  low_stock_threshold?: number;

  @IsInt()
  @Min(5)
  @IsOptional()
  stock_hold_minutes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  payment_modes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  delivery_modes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  delivery_areas?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  default_credit_limit?: number;

  @IsBoolean()
  @IsOptional()
  require_owner_approval_for_credit?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  high_value_approval_amount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellerSetupProductDto)
  @IsOptional()
  products?: SellerSetupProductDto[];
}

export class SellerProductsStockQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  @IsIn(['all', 'active', 'inactive', 'low_stock', 'out_of_stock'])
  status?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

export class SellerProductImportRowDto {
  @IsUUID()
  @IsOptional()
  product_id?: string;

  @IsUUID()
  @IsOptional()
  item_id?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  stock_quantity?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost_price?: number;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class SellerProductBulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellerProductImportRowDto)
  rows: SellerProductImportRowDto[];

  @IsString()
  @IsOptional()
  source?: string;
}

export class SellerStockAdjustmentDto {
  @IsUUID()
  @IsOptional()
  product_id?: string;

  @IsUUID()
  @IsOptional()
  item_id?: string;

  @IsUUID()
  @IsOptional()
  variant_id?: string;

  @IsString()
  @IsIn(['add', 'reduce', 'set'])
  adjustment_type: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
