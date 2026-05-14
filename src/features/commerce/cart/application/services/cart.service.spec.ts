import { ConflictException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartStatus, CartWithItems } from '../../domain/entities/cart.entity';

describe('CartService checkout idempotency', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';
  const cartId = '00000000-0000-0000-0000-000000000004';
  const itemId = '00000000-0000-0000-0000-000000000005';
  const orderId = '00000000-0000-0000-0000-000000000006';
  const productOrderId = '00000000-0000-0000-0000-000000000007';

  const cart: CartWithItems = {
    cart_id: cartId,
    business_id: businessId,
    tenant_id: tenantId,
    lead_id: leadId,
    status: CartStatus.ACTIVE,
    total_amount: 1000,
    total_items: 1,
    expires_at: new Date('2026-06-01T00:00:00.000Z'),
    created_at: new Date('2026-05-01T00:00:00.000Z'),
    updated_at: new Date('2026-05-01T00:00:00.000Z'),
    items: [
      {
        cart_item_id: '00000000-0000-0000-0000-000000000008',
        cart_id: cartId,
        item_id: itemId,
        variant_id: null,
        product_name: 'T-Shirt',
        variant_name: null,
        quantity: 2,
        unit_price: 500,
        total_price: 1000,
        created_at: new Date('2026-05-01T00:00:00.000Z'),
        updated_at: new Date('2026-05-01T00:00:00.000Z'),
      },
    ],
  };

  function buildPrismaMock(existingKey: any = null) {
    const order = {
      order_id: orderId,
      business_id: businessId,
      tenant_id: tenantId,
      lead_id: leadId,
      order_type: 'product',
      status: 'pending',
      subtotal: null,
      discount_amount: null,
      tax_amount: null,
      shipping_fee: null,
      total_amount: 1000,
      payment_status: 'pending',
      created_at: new Date('2026-05-01T00:00:00.000Z'),
      updated_at: new Date('2026-05-01T00:00:00.000Z'),
    };

    const tx = {
      workflow_idempotency_keys: {
        create: jest.fn(),
        update: jest.fn(),
      },
      item_variants: {
        update: jest.fn(),
      },
      catalog_items: {
        updateMany: jest.fn(),
      },
      orders: {
        create: jest.fn().mockResolvedValue(order),
      },
      product_orders: {
        create: jest.fn().mockResolvedValue({
          product_order_id: productOrderId,
        }),
      },
      order_items: {
        create: jest.fn(),
      },
      product_order_items: {
        create: jest.fn(),
      },
      product_order_status_events: {
        create: jest.fn(),
      },
      carts: {
        update: jest.fn(),
      },
      product_inquiries: {
        create: jest.fn(),
      },
    };

    const prisma = {
      workflow_idempotency_keys: {
        findUnique: jest.fn().mockResolvedValue(existingKey),
        update: jest.fn(),
      },
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue({
          item_id: itemId,
          stock_quantity: 10,
          variants: [],
        }),
      },
      leads: {
        findUnique: jest.fn().mockResolvedValue({ lead_id: leadId }),
      },
      $transaction: jest.fn(async (callback: any) => callback(tx)),
      __tx: tx,
      __order: order,
    };

    return prisma;
  }

  function buildCartRepositoryMock(cartValue: CartWithItems = cart) {
    return {
      getCartWithItems: jest.fn().mockResolvedValue(cartValue),
    };
  }

  it('creates one product order, decrements stock once, and records the completed response', async () => {
    const prisma = buildPrismaMock();
    const cartRepository = buildCartRepositoryMock();
    const service = new CartService(cartRepository as any, prisma as any);

    const result = await service.checkoutCart({ cart_id: cartId });

    expect(prisma.workflow_idempotency_keys.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.workflow_idempotency_keys.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          business_id: businessId,
          tenant_id: tenantId,
          lead_id: leadId,
          purpose: 'create_product_order',
          status: 'started',
        }),
      }),
    );
    expect(prisma.__tx.catalog_items.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.orders.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.product_orders.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.carts.update).toHaveBeenCalledWith({
      where: { cart_id: cartId },
      data: { status: 'converted', updated_at: expect.any(Date) },
    });
    expect(prisma.__tx.workflow_idempotency_keys.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'completed',
          response: expect.objectContaining({
            order_id: orderId,
            product_order_id: productOrderId,
            total_amount: 1000,
          }),
          locked_until: null,
        }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        order_id: orderId,
        product_order_id: productOrderId,
        total_amount: 1000,
      }),
    );
  });

  it('returns the existing checkout response when a completed key is seen again', async () => {
    const response = {
      order_id: orderId,
      product_order_id: productOrderId,
      total_amount: 1000,
    };
    const prisma = buildPrismaMock({ status: 'completed', response });
    const cartRepository = buildCartRepositoryMock();
    const service = new CartService(cartRepository as any, prisma as any);

    const result = await service.checkoutCart({ cart_id: cartId });

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.catalog_items.updateMany).not.toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('rejects an in-progress duplicate checkout', async () => {
    const prisma = buildPrismaMock({
      status: 'started',
      locked_until: new Date(Date.now() + 60_000),
    });
    const cartRepository = buildCartRepositoryMock();
    const service = new CartService(cartRepository as any, prisma as any);

    await expect(service.checkoutCart({ cart_id: cartId })).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.catalog_items.updateMany).not.toHaveBeenCalled();
  });
});
