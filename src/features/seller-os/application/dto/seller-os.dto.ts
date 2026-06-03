import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SellerSetupProductDto {
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_price?: number;

  @IsInt()
  @Min(0)
  stock_quantity: number;

  @IsOptional()
  @IsString()
  sku?: string;
}

export class SellerProductsStockQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['all', 'active', 'inactive', 'low_stock', 'out_of_stock'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(500)
  limit?: number;
}

export class SellerProductImportRowDto {
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  cost_price?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  stock_quantity?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class SellerProductBulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellerProductImportRowDto)
  products: SellerProductImportRowDto[];

  @IsOptional()
  @IsIn(['csv', 'excel', 'manual'])
  source?: string;
}

export class SellerStockAdjustmentDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  variant_id?: string;

  @IsIn(['add', 'reduce', 'set'])
  adjustment_type: 'add' | 'reduce' | 'set';

  @IsInt()
  @Type(() => Number)
  @Min(0)
  quantity: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CompleteSellerSetupDto {
  @IsOptional()
  @IsIn(['online_seller', 'retail_seller', 'wholesale_seller', 'product_seller'])
  store_type?: string;

  @IsOptional()
  @IsBoolean()
  enable_credit?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(240)
  stock_hold_minutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  low_stock_threshold?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_modes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delivery_modes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delivery_areas?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  default_credit_limit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  default_credit_due_days?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  high_value_approval_amount?: number;

  @IsOptional()
  @IsBoolean()
  require_owner_approval_for_credit?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellerSetupProductDto)
  products?: SellerSetupProductDto[];
}

export class ManualSaleItemDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  variant_id?: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateManualSaleDto {
  @IsString()
  customer_phone: string;

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsString()
  delivery_address?: string;

  @IsOptional()
  @IsString()
  delivery_area?: string;

  @IsOptional()
  @IsIn(['cash', 'upi', 'card', 'cod', 'credit', 'other'])
  payment_method?: string;

  @IsOptional()
  @IsBoolean()
  delivery_required?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualSaleItemDto)
  items: ManualSaleItemDto[];
}

export class CreateStockReservationDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  variant_id?: string;

  @IsOptional()
  @IsUUID()
  lead_id?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(240)
  hold_minutes?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateCreditCustomerDto {
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsNumber()
  @Min(0)
  credit_limit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  opening_balance?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  due_days?: number;

  @IsOptional()
  @IsIn(['approved', 'pending', 'paused', 'blocked'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CollectCreditPaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsIn(['cash', 'upi', 'card', 'bank', 'other'])
  payment_method?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePaymentRequestFromHoldDto {
  @IsOptional()
  @IsIn(['upi', 'cod', 'cash', 'card', 'other'])
  payment_method?: string;

  @IsOptional()
  @IsString()
  idempotency_key?: string;

  @IsOptional()
  @IsString()
  payment_reference?: string;

  @IsOptional()
  @IsString()
  delivery_address?: string;

  @IsOptional()
  @IsString()
  delivery_area?: string;

  @IsOptional()
  @IsBoolean()
  delivery_required?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkSellerOrderPaidDto {
  @IsOptional()
  @IsIn(['upi', 'cod', 'cash', 'card', 'other'])
  payment_method?: string;

  @IsOptional()
  @IsString()
  idempotency_key?: string;

  @IsOptional()
  @IsString()
  payment_reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelSellerPaymentOrderDto {
  @IsOptional()
  @IsString()
  idempotency_key?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateReturnCaseDto {
  @IsOptional()
  @IsUUID()
  order_id?: string;

  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsIn(['refund', 'exchange', 'repair', 'reject'])
  resolution?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refund_amount?: number;
}

export class CreateDeliveryDto {
  @IsOptional()
  @IsUUID()
  order_id?: string;

  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsIn(['pickup', 'local_delivery', 'courier'])
  delivery_mode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsBoolean()
  collect_payment?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  payment_amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AiGuardrailCheckDto {
  @IsString()
  ai_employee_key: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsString()
  input_summary?: string;

  @IsOptional()
  @IsString()
  output_summary?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class AgentProductSearchDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}

export class AgentCreateOrderDto extends CreateManualSaleDto {
  @IsOptional()
  @IsUUID()
  lead_id?: string;
}

export class SellerLeadListQueryDto {
  @IsOptional()
  @IsIn(['all', 'new', 'ai_chatting', 'stock_held', 'payment_waiting', 'needs_owner', 'won', 'lost'])
  stage?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(150)
  @Type(() => Number)
  limit?: number;
}

export class UpdateSellerLeadStatusDto {
  @IsIn(['new', 'contacted', 'qualified', 'won', 'lost'])
  status: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  next_followup_at?: string;
}
