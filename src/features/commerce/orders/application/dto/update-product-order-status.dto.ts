import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const PRODUCT_ORDER_STATUSES = [
  'pending',
  'draft',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type ProductOrderStatus = (typeof PRODUCT_ORDER_STATUSES)[number];

export class UpdateProductOrderStatusDto {
  @IsIn(PRODUCT_ORDER_STATUSES)
  @IsNotEmpty()
  status: ProductOrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
