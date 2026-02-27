import { IsString, IsInt, IsOptional, Min, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CartStatus } from '../../domain/entities/cart.entity';

export class AddToCartDto {
  @ApiProperty({ description: 'Business ID' })
  @IsUUID()
  business_id: string;

  @ApiProperty({ description: 'Lead ID (customer)' })
  @IsUUID()
  lead_id: string;

  @ApiProperty({ description: 'Product ID from WhatsApp catalog' })
  @IsUUID()
  product_id: string;

  @ApiPropertyOptional({ description: 'Product variant ID (if applicable)' })
  @IsOptional()
  @IsUUID()
  variant_id?: string;

  @ApiProperty({ description: 'Quantity to add', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class RemoveFromCartDto {
  @ApiProperty({ description: 'Cart item ID to remove' })
  @IsUUID()
  cart_item_id: string;
}

export class GetCartDto {
  @ApiProperty({ description: 'Lead ID to get cart for' })
  @IsUUID()
  lead_id: string;

  @ApiProperty({ description: 'Business ID' })
  @IsUUID()
  business_id: string;
}

export class CheckoutCartDto {
  @ApiProperty({ description: 'Cart ID to checkout' })
  @IsUUID()
  cart_id: string;

  @ApiPropertyOptional({ description: 'Delivery address' })
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiPropertyOptional({ description: 'Delivery instructions' })
  @IsOptional()
  @IsString()
  delivery_instructions?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  payment_method?: string;
}

export class ClearCartDto {
  @ApiProperty({ description: 'Cart ID to clear' })
  @IsUUID()
  cart_id: string;
}
