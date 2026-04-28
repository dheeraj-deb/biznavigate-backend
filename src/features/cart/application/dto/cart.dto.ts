import { IsString, IsInt, IsOptional, Min, IsUUID, IsEnum } from 'class-validator';
import { CartStatus } from '../../domain/entities/cart.entity';

export class AddToCartDto {
    @IsUUID()
  business_id: string;

  @IsUUID()
  customer_id: string;

    @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  variant_id?: string;

    @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
    @IsInt()
  @Min(1)
  quantity: number;
}

export class RemoveFromCartDto {
    @IsUUID()
  cart_item_id: string;
}

export class GetCartDto {
    @IsUUID()
  lead_id: string;

    @IsUUID()
  business_id: string;
}

export class CheckoutCartDto {
    @IsUUID()
  cart_id: string;

    @IsOptional()
  @IsString()
  delivery_address?: string;

    @IsOptional()
  @IsString()
  delivery_instructions?: string;

    @IsOptional()
  @IsString()
  payment_method?: string;
}

export class ClearCartDto {
    @IsUUID()
  cart_id: string;
}
