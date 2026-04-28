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
import { CartService } from '../services/cart.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import {
  AddToCartDto,
  UpdateCartItemDto,
  GetCartDto,
  CheckoutCartDto,
  ClearCartDto,
} from '../dto/cart.dto';@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Add product to cart (from WhatsApp catalog)
   */
  @Post('add')
  @HttpCode(HttpStatus.OK)  async addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  /**
   * Get active cart for a lead
   */
  @Get(':leadId/:businessId')  async getCart(
    @Param('leadId') leadId: string,
    @Param('businessId') businessId: string,
  ) {
    return this.cartService.getCart(leadId, businessId);
  }

  /**
   * Update cart item quantity
   */
  @Put('item/:cartItemId')  async updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(cartItemId, dto);
  }

  /**
   * Remove item from cart
   */
  @Delete('item/:cartItemId')  async removeFromCart(@Param('cartItemId') cartItemId: string) {
    return this.cartService.removeFromCart(cartItemId);
  }

  /**
   * Clear cart
   */
  @Delete(':cartId')  async clearCart(@Param('cartId') cartId: string) {
    return this.cartService.clearCart(cartId);
  }

  /**
   * Checkout cart - Place order
   */
  @Post('checkout')  async checkoutCart(@Body() dto: CheckoutCartDto) {
    return this.cartService.checkoutCart(dto);
  }
}
