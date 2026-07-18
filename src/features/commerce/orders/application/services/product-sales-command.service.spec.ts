import { ConflictException } from '@nestjs/common';
import { LeadTypes } from '../../../../crm/lead/application/lead-types';
import { ProductSalesCommandService } from './product-sales-command.service';

describe('ProductSalesCommandService direct product sale', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';
  const itemId = '00000000-0000-0000-0000-000000000004';
  const customerId = '00000000-0000-0000-0000-000000000005';
  const orderId = '00000000-0000-0000-0000-000000000006';
  const productOrderId = '00000000-0000-0000-0000-000000000007';

  function product(stock = 10) {
    return {
      item_id: itemId,
      item_type: 'physical_product',
      name: 'Cotton Kurti',
      description: 'Blue cotton kurti',
      base_price: 500,
      stock_quantity: stock,
      variants: [],
      product_detail: { sku: 'KURTI-1' },
    };
  }

  function buildMocks(stockUpdateCount = 1) {
    const order = {
      order_id: orderId,
      business_id: businessId,
      tenant_id: tenantId,
      customer_id: customerId,
      lead_id: leadId,
      order_number: 'SHOP-20260609-ABC123',
      total_amount: 1000,
      payment_status: 'paid',
    };

    const tx = {
      leads: {
        findFirst: jest.fn().mockResolvedValue({ lead_id: leadId, context: {} }),
        updateMany: jest.fn(),
      },
      customers: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ customer_id: customerId, phone: '919999999999', name: 'Anu' }),
        update: jest.fn(),
      },
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue(product(stockUpdateCount ? 10 : 1)),
        updateMany: jest.fn().mockResolvedValue({ count: stockUpdateCount }),
      },
      item_variants: {
        updateMany: jest.fn(),
      },
      external_catalog_items: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      orders: {
        create: jest.fn().mockResolvedValue(order),
      },
      product_orders: {
        create: jest.fn().mockResolvedValue({ product_order_id: productOrderId }),
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
      payments: {
        create: jest.fn(),
      },
      product_inquiries: {
        create: jest.fn(),
      },
      lead_events: {
        create: jest.fn(),
      },
      workflow_idempotency_keys: {
        upsert: jest.fn(),
        update: jest.fn(),
      },
      $queryRawUnsafe: jest.fn((query: string) => {
        if (String(query).includes('SELECT stock_hold_minutes')) {
          return Promise.resolve([{ stock_hold_minutes: 30 }]);
        }
        return Promise.resolve([]);
      }),
    };

    const prisma = {
      workflow_idempotency_keys: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback: any) => callback(tx)),
      __tx: tx,
    };

    const leadCommands = {
      recalculateQualification: jest.fn().mockResolvedValue(undefined),
    };
    const eventEmitter = {
      emit: jest.fn(),
    };

    return {
      service: new ProductSalesCommandService(prisma as any, leadCommands as any, eventEmitter as any),
      prisma,
      tx,
      leadCommands,
      eventEmitter,
    };
  }

  it('creates a paid shop sale, deducts stock atomically, records payment, and marks the lead ordered', async () => {
    const { service, tx, eventEmitter } = buildMocks();

    const result = await service.createDirectSale(businessId, tenantId, {
      lead_id: leadId,
      sale_mode: 'shop_sale',
      payment_status: 'paid',
      payment_method: 'cash',
      customer: { name: 'Anu', phone: '9999999999' },
      items: [{ item_id: itemId, quantity: 2 }],
    });

    expect(tx.catalog_items.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        item_id: itemId,
        business_id: businessId,
        stock_quantity: { gte: 2 },
      }),
      data: expect.objectContaining({ stock_quantity: { decrement: 2 } }),
    });
    expect(tx.orders.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 1000,
      }),
    });
    expect(tx.product_orders.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'delivered',
        payment_status: 'paid',
        total_amount: 1000,
      }),
    });
    expect(tx.payments.create).toHaveBeenCalledTimes(1);
    expect(tx.leads.updateMany).toHaveBeenCalledWith({
      where: { business_id: businessId, lead_id: leadId, deleted_at: null },
      data: expect.objectContaining({
        status: 'won',
        lead_type: LeadTypes.PRODUCT_ORDERED,
        converted_value: 1000,
      }),
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith('workflow.event.order.placed', expect.objectContaining({
      business_id: businessId,
      product_order_id: productOrderId,
    }));
    expect(result).toEqual(expect.objectContaining({
      order_id: orderId,
      product_order_id: productOrderId,
      payment_status: 'paid',
      stock_held: false,
    }));
  });

  it('creates a pending assisted sale without counting it as paid revenue', async () => {
    const { service, tx } = buildMocks();

    await service.createDirectSale(businessId, tenantId, {
      lead_id: leadId,
      sale_mode: 'assisted',
      payment_status: 'pending',
      payment_method: 'upi',
      customer: { name: 'Anu', phone: '9999999999' },
      items: [{ item_id: itemId, quantity: 1 }],
    });

    expect(tx.orders.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'pending',
        payment_status: 'pending',
        payment_expires_at: expect.any(Date),
      }),
    });
    expect(tx.payments.create).not.toHaveBeenCalled();
    expect(tx.leads.updateMany).toHaveBeenCalledWith({
      where: { business_id: businessId, lead_id: leadId, deleted_at: null },
      data: expect.not.objectContaining({
        converted_value: expect.anything(),
      }),
    });
    expect(tx.leads.updateMany).toHaveBeenCalledWith({
      where: { business_id: businessId, lead_id: leadId, deleted_at: null },
      data: expect.objectContaining({
        status: 'contacted',
        lead_type: LeadTypes.PRODUCT_ORDER_PENDING,
        quoted_amount: 500,
      }),
    });
  });

  it('rejects out-of-stock concurrent sales before creating any order', async () => {
    const { service, tx } = buildMocks(0);

    await expect(service.createDirectSale(businessId, tenantId, {
      lead_id: leadId,
      payment_status: 'paid',
      payment_method: 'cash',
      customer: { phone: '9999999999' },
      items: [{ item_id: itemId, quantity: 2 }],
    })).rejects.toBeInstanceOf(ConflictException);

    expect(tx.orders.create).not.toHaveBeenCalled();
    expect(tx.product_orders.create).not.toHaveBeenCalled();
  });
});
