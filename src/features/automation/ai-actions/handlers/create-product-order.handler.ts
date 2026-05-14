import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CartService } from '../../../commerce/cart/application/services/cart.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';

@Injectable()
export class CreateProductOrderHandler implements AiActionHandler {
  readonly action = 'create_product_order' as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  async execute(dto: ExecuteAiActionDto) {
    const cartId = dto.params.cart_id;
    if (!cartId) throw new BadRequestException('cart_id is required');

    const cart = await this.prisma.carts.findFirst({
      where: {
        cart_id: cartId,
        business_id: dto.business_id,
        ...(dto.lead_id ? { lead_id: dto.lead_id } : {}),
      },
      select: { cart_id: true },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    return this.cartService.checkoutCart({
      cart_id: cartId,
      delivery_address: dto.params.delivery_address,
      delivery_instructions: dto.params.delivery_instructions,
      payment_method: dto.params.payment_method,
    });
  }
}
