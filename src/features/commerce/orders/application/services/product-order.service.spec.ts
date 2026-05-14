import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductOrderService } from './product-order.service';

describe('ProductOrderService lifecycle', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const productOrderId = '00000000-0000-0000-0000-000000000002';
  const legacyOrderId = '00000000-0000-0000-0000-000000000003';

  function productOrder(status = 'pending') {
    return {
      product_order_id: productOrderId,
      business_id: businessId,
      tenant_id: '00000000-0000-0000-0000-000000000004',
      legacy_order_id: legacyOrderId,
      customer_id: null,
      lead_id: '00000000-0000-0000-0000-000000000005',
      order_number: 'ORD-1',
      status,
      payment_status: 'pending',
      subtotal: 1000,
      discount_amount: 0,
      tax_amount: 0,
      shipping_fee: 0,
      total_amount: 1000,
      source: 'whatsapp',
      items: [],
      events: [],
    };
  }

  function buildPrismaMock(existing = productOrder(), updated = productOrder('confirmed')) {
    const tx = {
      product_orders: {
        update: jest.fn().mockResolvedValue(updated),
      },
      product_order_status_events: {
        create: jest.fn(),
      },
      orders: {
        update: jest.fn(),
      },
    };

    return {
      product_orders: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(updated),
      },
      $transaction: jest.fn(async (callback: any) => callback(tx)),
      __tx: tx,
    };
  }

  it('updates product order status, records an event, and syncs legacy order', async () => {
    const prisma = buildPrismaMock(productOrder('pending'), productOrder('packed'));
    const service = new ProductOrderService(prisma as any);

    const result = await service.updateStatus(businessId, productOrderId, {
      status: 'packed',
      notes: 'Packed by warehouse',
    });

    expect(prisma.__tx.product_orders.update).toHaveBeenCalledWith({
      where: { product_order_id: productOrderId },
      data: {
        status: 'packed',
        updated_at: expect.any(Date),
      },
    });
    expect(prisma.__tx.product_order_status_events.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        product_order_id: productOrderId,
        business_id: businessId,
        from_status: 'pending',
        to_status: 'packed',
        actor: 'human',
        data: {
          notes: 'Packed by warehouse',
          legacy_order_id: legacyOrderId,
        },
      }),
    });
    expect(prisma.__tx.orders.update).toHaveBeenCalledWith({
      where: { order_id: legacyOrderId },
      data: expect.objectContaining({
        status: 'packed',
        delivery_status: 'packed',
        updated_at: expect.any(Date),
      }),
    });
    expect(result.status).toBe('packed');
  });

  it('cancels a product order and syncs cancellation to legacy order', async () => {
    const prisma = buildPrismaMock(productOrder('confirmed'), productOrder('cancelled'));
    const service = new ProductOrderService(prisma as any);

    const result = await service.cancel(businessId, productOrderId, 'Customer cancelled');

    expect(prisma.__tx.product_orders.update).toHaveBeenCalledWith({
      where: { product_order_id: productOrderId },
      data: {
        status: 'cancelled',
        cancelled_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
    });
    expect(prisma.__tx.product_order_status_events.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        from_status: 'confirmed',
        to_status: 'cancelled',
        data: {
          notes: 'Customer cancelled',
          legacy_order_id: legacyOrderId,
        },
      }),
    });
    expect(prisma.__tx.orders.update).toHaveBeenCalledWith({
      where: { order_id: legacyOrderId },
      data: expect.objectContaining({
        status: 'cancelled',
        delivery_status: 'cancelled',
        cancelled_at: expect.any(Date),
        updated_at: expect.any(Date),
      }),
    });
    expect(result.status).toBe('cancelled');
  });

  it('does not write another event when cancelling an already-cancelled product order', async () => {
    const existing = productOrder('cancelled');
    const prisma = buildPrismaMock(existing, existing);
    const service = new ProductOrderService(prisma as any);

    const result = await service.cancel(businessId, productOrderId);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(result.status).toBe('cancelled');
  });

  it('rejects cancellation after delivery', async () => {
    const prisma = buildPrismaMock(productOrder('delivered'), productOrder('cancelled'));
    const service = new ProductOrderService(prisma as any);

    await expect(service.cancel(businessId, productOrderId)).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not read a product order outside the current business scope', async () => {
    const prisma = {
      product_orders: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new ProductOrderService(prisma as any);

    await expect(service.findById(businessId, productOrderId)).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.product_orders.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { product_order_id: productOrderId, business_id: businessId },
      }),
    );
  });

  it('does not update a product order outside the current business scope', async () => {
    const prisma = {
      product_orders: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(),
    };
    const service = new ProductOrderService(prisma as any);

    await expect(
      service.updateStatus(businessId, productOrderId, { status: 'packed' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.product_orders.findFirst).toHaveBeenCalledWith({
      where: { product_order_id: productOrderId, business_id: businessId },
      select: {
        product_order_id: true,
        business_id: true,
        status: true,
        legacy_order_id: true,
      },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
