import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import {
  AddToCartDto,
  UpdateCartItemDto,
  GetCartDto,
  CheckoutCartDto,
  ClearCartDto,
} from '../dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Add product to cart (from WhatsApp catalog)
   */
  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add product to cart from WhatsApp catalog' })
  @ApiResponse({ status: 200, description: 'Product added to cart successfully' })
  async addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  /**
   * Get active cart for a lead
   */
  @Get(':leadId/:businessId')
  @ApiOperation({ summary: 'Get active cart for a lead' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(
    @Param('leadId') leadId: string,
    @Param('businessId') businessId: string,
  ) {
    return this.cartService.getCart(leadId, businessId);
  }

  /**
   * Update cart item quantity
   */
  @Put('item/:cartItemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  async updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(cartItemId, dto);
  }

  /**
   * Remove item from cart
   */
  @Delete('item/:cartItemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  async removeFromCart(@Param('cartItemId') cartItemId: string) {
    return this.cartService.removeFromCart(cartItemId);
  }

  /**
   * Clear cart
   */
  @Delete(':cartId')
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Param('cartId') cartId: string) {
    return this.cartService.clearCart(cartId);
  }

  /**
   * Checkout cart - Place order
   */
  @Post('checkout')
  @ApiOperation({ summary: 'Checkout cart and create order' })
  @ApiResponse({ status: 200, description: 'Order created successfully' })
  async checkoutCart(@Body() dto: CheckoutCartDto) {
    return this.cartService.checkoutCart(dto);
  }
}
