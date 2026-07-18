import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Prisma } from '../../../../../generated/prisma';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LeadTypes } from '../../../crm/lead/application/lead-types';
import { getRunContext } from '../context/agent-run-context';
import { appendSignal } from '../types/agent-signal';

function money(value: unknown, currency = 'INR') {
  const amount = Number(value ?? 0);
  if (currency === 'INR') return `Rs ${amount.toLocaleString('en-IN')}`;
  return `${currency} ${amount.toLocaleString('en-IN')}`;
}

function normalizePhone(phone?: string | null) {
  return String(phone ?? '').trim().replace(/[^\d+]/g, '');
}

function isUuid(value?: string | null): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(String(value ?? ''));
}

function makeOrderNumber(prefix = 'WA') {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}

async function sellerSettings(prisma: PrismaService, businessId: string) {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT stock_hold_minutes, payment_modes, ai_guardrails
     FROM seller_store_settings
     WHERE business_id = $1
     LIMIT 1`,
    businessId,
  ).catch(() => []);
  return rows[0] ?? {
    stock_hold_minutes: 15,
    payment_modes: ['cash', 'upi', 'cod'],
    ai_guardrails: {
      high_value_approval_amount: 10000,
      prevent_oversell: true,
      require_stock_before_payment: true,
    },
  };
}

async function findProducts(
  prisma: PrismaService,
  businessId: string,
  search: string,
  take = 5,
  maxPrice?: number,
) {
  const term = search.trim();
  const priceWhere = maxPrice ? { base_price: { lte: Number(maxPrice) } } : {};
  const baseWhere = {
    business_id: businessId,
    item_type: 'physical_product',
    is_active: true,
    deleted_at: null,
    ...priceWhere,
  };

  if (term) {
    try {
      const rows = await prisma.$queryRaw<{ item_id: string }[]>(Prisma.sql`
        SELECT ci.item_id::text AS item_id
        FROM catalog_items ci
        LEFT JOIN product_item_details pid ON pid.item_id = ci.item_id
        WHERE ci.business_id = ${businessId}::uuid
          AND ci.item_type = 'physical_product'
          AND ci.is_active = true
          AND ci.deleted_at IS NULL
          ${maxPrice ? Prisma.sql`AND ci.base_price <= ${Number(maxPrice)}` : Prisma.empty}
          AND (
            lower(ci.name) LIKE ${`%${term.toLowerCase()}%`}
            OR lower(coalesce(ci.description, '')) LIKE ${`%${term.toLowerCase()}%`}
            OR lower(coalesce(ci.category, '')) LIKE ${`%${term.toLowerCase()}%`}
            OR lower(coalesce(array_to_string(ci.ai_tags, ' '), '')) LIKE ${`%${term.toLowerCase()}%`}
            OR lower(coalesce(pid.brand, '') || ' ' || coalesce(pid.sku, '')) LIKE ${`%${term.toLowerCase()}%`}
            OR lower(coalesce(ci.name, '') || ' ' || coalesce(ci.description, '') || ' ' || coalesce(ci.category, '') || ' ' || coalesce(array_to_string(ci.ai_tags, ' '), '')) % ${term.toLowerCase()}
          )
        ORDER BY
          CASE
            WHEN lower(ci.name) = ${term.toLowerCase()} THEN 0
            WHEN lower(ci.name) LIKE ${`${term.toLowerCase()}%`} THEN 1
            WHEN lower(coalesce(pid.brand, '')) = ${term.toLowerCase()} THEN 2
            ELSE 3
          END,
          coalesce(ci.stock_quantity, -1) DESC,
          similarity(lower(coalesce(ci.name, '') || ' ' || coalesce(ci.description, '') || ' ' || coalesce(ci.category, '')), ${term.toLowerCase()}) DESC,
          ci.created_at DESC
        LIMIT ${take}
      `);
      const ids = rows.map((row) => row.item_id);
      if (!ids.length) return [];
      const items = await prisma.catalog_items.findMany({
        where: { ...baseWhere, item_id: { in: ids } },
        include: {
          variants: { where: { is_active: true }, orderBy: { price: 'asc' } },
          product_detail: true,
        },
      });
      const byId = new Map(items.map((item) => [item.item_id, item]));
      return ids.map((id) => byId.get(id)).filter(Boolean);
    } catch {
      // If pg_trgm migration has not run yet, keep the chatbot functional.
    }
  }

  return prisma.catalog_items.findMany({
    where: {
      ...baseWhere,
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { category: { contains: term, mode: 'insensitive' } },
              { ai_tags: { has: term.toLowerCase() } },
            ],
          }
        : {}),
    },
    include: {
      variants: { where: { is_active: true }, orderBy: { price: 'asc' } },
      product_detail: true,
    },
    orderBy: [{ stock_quantity: 'desc' }, { created_at: 'desc' }],
    take,
  });
}

function chooseProduct(products: any[], productName: string) {
  const exact = products.find((item) => item.name.toLowerCase() === productName.trim().toLowerCase());
  return exact ?? products[0];
}

function chooseVariant(product: any, variantName?: string) {
  if (!variantName) return null;
  return product.variants?.find((variant) =>
    variant.name.toLowerCase().includes(variantName.trim().toLowerCase()),
  ) ?? null;
}

async function findOrCreateCustomer(prisma: any, businessId: string, tenantId: string, phone: string, name?: string) {
  const cleanPhone = normalizePhone(phone);
  const existing = await prisma.customers.findFirst({
    where: { business_id: businessId, phone: cleanPhone, deleted_at: null },
  });
  if (existing) {
    if (name && !existing.name) {
      return prisma.customers.update({
        where: { customer_id: existing.customer_id },
        data: { name, updated_at: new Date() },
      });
    }
    return existing;
  }
  return prisma.customers.create({
    data: {
      business_id: businessId,
      tenant_id: tenantId,
      phone: cleanPhone,
      whatsapp_number: cleanPhone,
      name,
      engagement_score: 10,
    },
  });
}

async function markWhatsAppCatalogAvailabilityPending(tx: any, itemId: string) {
  await tx.external_catalog_items.updateMany({
    where: {
      item_id: itemId,
      provider: 'whatsapp',
      sync_status: { not: 'local_only' },
    },
    data: {
      sync_status: 'pending',
      updated_at: new Date(),
    },
  }).catch(() => undefined);
}

async function findProductOrderForCustomer(
  prisma: PrismaService,
  businessId: string,
  params: { orderId?: string; leadId?: string; phone?: string },
) {
  const include = {
    items: true,
    customer: { select: { customer_id: true, name: true, phone: true, whatsapp_number: true } },
    legacy_order: { select: { order_id: true, order_number: true, status: true, payment_status: true, payment_method: true } },
  } as const;

  if (params.orderId) {
    const orderId = params.orderId.trim();
    const filters: any[] = [{ order_number: orderId }];
    if (isUuid(orderId)) {
      filters.push({ product_order_id: orderId }, { legacy_order_id: orderId });
    }

    return prisma.product_orders.findFirst({
      where: { business_id: businessId, OR: filters },
      include,
      orderBy: { created_at: 'desc' },
    });
  }

  if (params.leadId) {
    const byLead = await prisma.product_orders.findFirst({
      where: {
        business_id: businessId,
        lead_id: params.leadId,
        status: { not: 'cancelled' },
      },
      include,
      orderBy: { created_at: 'desc' },
    });
    if (byLead) return byLead;
  }

  const phone = normalizePhone(params.phone);
  if (!phone) return null;

  return prisma.product_orders.findFirst({
    where: {
      business_id: businessId,
      status: { not: 'cancelled' },
      OR: [
        { shipping_phone: phone },
        { customer: { is: { OR: [{ phone }, { whatsapp_number: phone }] } } },
      ],
    },
    include,
    orderBy: { created_at: 'desc' },
  });
}

export function makeSearchProductsTool(prisma: PrismaService) {
  return tool(
    async ({ search, maxPrice }) => {
      const { businessId } = getRunContext();
      const filtered = await findProducts(prisma, businessId, search ?? '', 8, maxPrice);

      if (!filtered.length) {
        const message = search
          ? `No products found matching "${search}".`
          : 'No products are available right now.';
        return search ? appendSignal(message, { type: 'browse_empty', query: search }) : message;
      }

      const lines = filtered.slice(0, 5).map((item: any, index) => {
        const stock = item.stock_quantity == null
          ? 'stock not tracked'
          : item.stock_quantity > 0
            ? `${item.stock_quantity} in stock`
            : 'out of stock';
        const variants = item.variants?.length
          ? ` | variants: ${item.variants.slice(0, 3).map((v: any) => `${v.name} ${money(v.price, item.currency)}`).join(', ')}`
          : '';
        return `${index + 1}. ${item.name} - ${money(item.base_price, item.currency)} - ${stock}${variants}`;
      });

      return `Available products:\n${lines.join('\n')}`;
    },
    {
      name: 'search_products',
      description: 'Search physical products for product-seller businesses. Use before recommending products. Do not show internal IDs.',
      schema: z.object({
        search: z.string().optional().describe('Product name, category, brand, keyword, or customer need'),
        maxPrice: z.number().optional().describe('Maximum customer budget if mentioned'),
      }),
    },
  );
}

export function makeReserveProductStockTool(prisma: PrismaService) {
  return tool(
    async ({ productName, quantity, variantName, holdMinutes }) => {
      const ctx = getRunContext();
      const businessId = ctx.businessId;
      const leadId = ctx.leadId;
      if (!leadId) {
        return 'I need the customer conversation to be linked to a lead before reserving stock.';
      }

      const settings = await sellerSettings(prisma, businessId);
      const holdFor = Math.max(5, Math.min(Number(holdMinutes ?? settings.stock_hold_minutes ?? 15), 120));

      return prisma.$transaction(async (tx) => {
        const products = await findProducts(tx as any, businessId, productName, 5);
        if (!products.length) return `I could not find "${productName}" in stock.`;
        if (products.length > 1 && !products.some((item) => item.name.toLowerCase() === productName.trim().toLowerCase())) {
          return `I found multiple matching products: ${products.map((item) => item.name).join(', ')}. Please ask which one they want.`;
        }

        const product = chooseProduct(products, productName);
        const variant = chooseVariant(product, variantName);
        const qty = Math.max(1, Number(quantity));

        if (variantName && !variant) {
          return `I found ${product.name}, but not the variant "${variantName}". Available variants: ${product.variants.map((v: any) => v.name).join(', ')}`;
        }

        if (variant) {
          const updated = await tx.item_variants.updateMany({
            where: {
              variant_id: variant.variant_id,
              item_id: product.item_id,
              stock_quantity: { gte: qty },
            },
            data: { stock_quantity: { decrement: qty }, updated_at: new Date() },
          });
          if (updated.count === 0) return `${product.name} (${variant.name}) has only ${variant.stock_quantity} in stock.`;
          await markWhatsAppCatalogAvailabilityPending(tx, product.item_id);
        } else {
          const updated = await tx.catalog_items.updateMany({
            where: {
              item_id: product.item_id,
              stock_quantity: { not: null, gte: qty },
            },
            data: { stock_quantity: { decrement: qty }, updated_at: new Date() },
          });
          if (updated.count === 0) return `${product.name} has only ${product.stock_quantity ?? 0} in stock.`;
          await markWhatsAppCatalogAvailabilityPending(tx, product.item_id);
        }

        const expiresAt = new Date(Date.now() + holdFor * 60 * 1000);
        await tx.cart_reservations.create({
          data: {
            lead_id: leadId,
            item_id: product.item_id,
            variant_id: variant?.variant_id ?? null,
            quantity: qty,
            expires_at: expiresAt,
            status: 'active',
          },
        });

        await tx.product_inquiries.create({
          data: {
            business_id: businessId,
            tenant_id: product.tenant_id,
            lead_id: leadId,
            item_id: product.item_id,
            variant_id: variant?.variant_id ?? null,
            quantity: qty,
            status: 'reserved',
            metadata: {
              source: 'whatsapp_ai',
              hold_minutes: holdFor,
              expires_at: expiresAt.toISOString(),
            },
          },
        });

        await tx.$queryRawUnsafe(
          `INSERT INTO seller_ai_audit_logs
             (business_id, tenant_id, ai_employee, action, decision, risk_level, entity_type, entity_id, input_summary, output_summary, guardrails)
           VALUES ($1, $2, 'AI Inventory Employee', 'reserve_product_stock', 'reserved', 'low', 'catalog_item', $3, $4, $5, $6::jsonb)`,
          businessId,
          product.tenant_id,
          product.item_id,
          `Customer requested ${product.name} x${qty}`,
          `Stock reserved until ${expiresAt.toISOString()}`,
          JSON.stringify({ quantity: qty, variant_id: variant?.variant_id ?? null, expires_at: expiresAt }),
        ).catch(() => undefined);

        const variantText = variant ? ` (${variant.name})` : '';
        return `${product.name}${variantText} x${qty} is reserved for ${holdFor} minutes. Ask for delivery address and payment preference to confirm the order.`;
      });
    },
    {
      name: 'reserve_product_stock',
      description: 'Reserve product stock after the customer chooses a specific product and quantity. Use only after product name and quantity are clear.',
      schema: z.object({
        productName: z.string().describe('Exact product name chosen by customer'),
        quantity: z.number().min(1).describe('Quantity requested'),
        variantName: z.string().optional().describe('Variant name such as size/color if customer chose it'),
        holdMinutes: z.number().optional().describe('Hold duration in minutes'),
      }),
    },
  );
}

export function makeCreateProductOrderTool(prisma: PrismaService) {
  return tool(
    async ({ productName, quantity, variantName, customerName, deliveryAddress, paymentMethod }) => {
      const ctx = getRunContext();
      const businessId = ctx.businessId;
      const leadId = ctx.leadId;
      const phone = normalizePhone(ctx.phone);
      if (!leadId || !phone) {
        return 'I need the customer phone and lead context before creating an order.';
      }

      const settings = await sellerSettings(prisma, businessId);
      const holdFor = Math.max(5, Math.min(Number(settings.stock_hold_minutes ?? 15), 24 * 60));

      return prisma.$transaction(async (tx) => {
        const products = await findProducts(tx as any, businessId, productName, 5);
        if (!products.length) return `I could not find "${productName}" to create the order.`;
        if (products.length > 1 && !products.some((item) => item.name.toLowerCase() === productName.trim().toLowerCase())) {
          return `I found multiple matching products: ${products.map((item) => item.name).join(', ')}. Please confirm the exact product.`;
        }

        const product = chooseProduct(products, productName);
        const variant = chooseVariant(product, variantName);
        const qty = Math.max(1, Number(quantity));
        const unitPrice = Number(variant?.price ?? product.base_price);
        const total = unitPrice * qty;
        const customer = await findOrCreateCustomer(tx, businessId, product.tenant_id, phone, customerName);

        const existingHold = await tx.cart_reservations.findFirst({
          where: {
            lead_id: leadId,
            item_id: product.item_id,
            variant_id: variant?.variant_id ?? null,
            status: 'active',
            expires_at: { gt: new Date() },
            quantity: { gte: qty },
          },
          orderBy: { expires_at: 'asc' },
        });

        if (existingHold) {
          await tx.cart_reservations.update({
            where: { reservation_id: existingHold.reservation_id },
            data: { status: 'converted', updated_at: new Date() },
          });
        } else if (variant) {
          const updated = await tx.item_variants.updateMany({
            where: {
              variant_id: variant.variant_id,
              item_id: product.item_id,
              stock_quantity: { gte: qty },
            },
            data: { stock_quantity: { decrement: qty }, updated_at: new Date() },
          });
          if (updated.count === 0) return `${product.name} (${variant.name}) has only ${variant.stock_quantity} in stock.`;
          await markWhatsAppCatalogAvailabilityPending(tx, product.item_id);
        } else {
          const updated = await tx.catalog_items.updateMany({
            where: {
              item_id: product.item_id,
              stock_quantity: { not: null, gte: qty },
            },
            data: { stock_quantity: { decrement: qty }, updated_at: new Date() },
          });
          if (updated.count === 0) return `${product.name} has only ${product.stock_quantity ?? 0} in stock.`;
          await markWhatsAppCatalogAvailabilityPending(tx, product.item_id);
        }

        const orderNumber = makeOrderNumber('WA');
        const normalizedPayment = String(paymentMethod ?? 'upi').toLowerCase();
        const paymentExpiresAt = existingHold?.expires_at ?? new Date(Date.now() + holdFor * 60 * 1000);
        const order = await tx.orders.create({
          data: {
            business_id: businessId,
            tenant_id: product.tenant_id,
            customer_id: customer.customer_id,
            lead_id: leadId,
            order_number: orderNumber,
            order_type: 'product',
            status: 'pending',
            subtotal: total,
            discount_amount: 0,
            tax_amount: 0,
            shipping_fee: 0,
            total_amount: total,
            payment_status: 'pending',
            payment_method: normalizedPayment,
            payment_expires_at: paymentExpiresAt,
            shipping_address: deliveryAddress,
            shipping_phone: phone,
            source: 'whatsapp_ai',
            notes: 'Created by WhatsApp AI product seller flow',
          },
        });

        const productOrder = await tx.product_orders.create({
          data: {
            business_id: businessId,
            tenant_id: product.tenant_id,
            legacy_order_id: order.order_id,
            customer_id: customer.customer_id,
            lead_id: leadId,
            order_number: orderNumber,
            status: 'pending',
            payment_status: 'pending',
            subtotal: total,
            discount_amount: 0,
            tax_amount: 0,
            shipping_fee: 0,
            total_amount: total,
            source: 'whatsapp_ai',
            shipping_address: deliveryAddress,
            shipping_phone: phone,
            notes: 'Created by WhatsApp AI product seller flow',
            metadata: {
              payment_method: normalizedPayment,
              payment_expires_at: paymentExpiresAt.toISOString(),
              converted_hold_id: existingHold?.reservation_id ?? null,
            },
          },
        });

        const snapshot = {
          source: 'whatsapp_ai',
          item_name: product.name,
          variant_name: variant?.name ?? null,
          price: unitPrice,
        };

        await tx.order_items.create({
          data: {
            order_id: order.order_id,
            item_id: product.item_id,
            variant_id: variant?.variant_id ?? null,
            product_name: product.name,
            variant_name: variant?.name ?? null,
            sku: variant?.sku ?? product.product_detail?.sku ?? null,
            quantity: qty,
            unit_price: unitPrice,
            discount: 0,
            total_price: total,
            snapshot,
          },
        });

        await tx.product_order_items.create({
          data: {
            product_order_id: productOrder.product_order_id,
            item_id: product.item_id,
            variant_id: variant?.variant_id ?? null,
            product_name: product.name,
            variant_name: variant?.name ?? null,
            sku: variant?.sku ?? product.product_detail?.sku ?? null,
            quantity: qty,
            unit_price: unitPrice,
            discount: 0,
            total_price: total,
            snapshot,
          },
        });

        await tx.product_order_status_events.create({
          data: {
            product_order_id: productOrder.product_order_id,
            business_id: businessId,
            from_status: null,
            to_status: 'pending',
            actor: 'ai',
            data: { legacy_order_id: order.order_id },
          },
        });

        await tx.product_inquiries.create({
          data: {
            business_id: businessId,
            tenant_id: product.tenant_id,
            lead_id: leadId,
            item_id: product.item_id,
            variant_id: variant?.variant_id ?? null,
            quantity: qty,
            status: 'ordered',
            metadata: {
              product_order_id: productOrder.product_order_id,
              order_number: orderNumber,
              source: 'whatsapp_ai',
            },
          },
        });

        await tx.leads.updateMany({
          where: { business_id: businessId, lead_id: leadId, deleted_at: null },
          data: {
            status: 'contacted',
            lead_type: LeadTypes.PRODUCT_ORDER_PENDING,
            quoted_amount: total,
            context: {
              type: 'product',
              items: [{
                id: product.item_id,
                variant_id: variant?.variant_id ?? null,
                name: product.name,
                variant: variant?.name ?? null,
                qty,
              }],
              product_order_id: productOrder.product_order_id,
              order_id: order.order_id,
              order_number: orderNumber,
              order_status: 'pending',
              payment_status: 'pending',
              payment_expires_at: paymentExpiresAt.toISOString(),
            },
            updated_at: new Date(),
          },
        });

        await tx.lead_events.create({
          data: {
            lead_id: leadId,
            business_id: businessId,
            type: 'stock_held',
            actor: 'ai',
            data: {
              order_id: order.order_id,
              product_order_id: productOrder.product_order_id,
              order_number: orderNumber,
              item_id: product.item_id,
              item_name: product.name,
              quantity: qty,
              total_amount: total,
              payment_method: normalizedPayment,
              payment_expires_at: paymentExpiresAt.toISOString(),
            },
          },
        });

        await tx.$queryRawUnsafe(
          `INSERT INTO seller_owner_approvals
             (business_id, tenant_id, title, simple_summary, action_type, risk_level, source, entity_type, entity_id, payload, due_at, expires_at)
           VALUES ($1, $2, 'Confirm WhatsApp order payment', $3, 'payment_followup', 'medium', 'ai', 'product_order', $4, $5::jsonb, $6, $6)`,
          businessId,
          product.tenant_id,
          `${orderNumber} for ${money(total, product.currency)} is waiting for payment confirmation.`,
          productOrder.product_order_id,
          JSON.stringify({
            order_id: order.order_id,
            legacy_order_id: order.order_id,
            product_order_id: productOrder.product_order_id,
            order_number: orderNumber,
            payment_method: normalizedPayment,
            total_amount: total,
            payment_expires_at: paymentExpiresAt.toISOString(),
          }),
          paymentExpiresAt,
        ).catch(() => undefined);

        return `Order ${orderNumber} created for ${product.name} x${qty}. Total ${money(total, product.currency)}. Payment status is pending until ${paymentExpiresAt.toISOString()}. Ask the customer to pay by ${normalizedPayment.toUpperCase()} or wait for owner confirmation.`;
      });
    },
    {
      name: 'create_product_order',
      description: 'Create a product order after product, quantity, phone, delivery address, and payment preference are known. Converts an active hold instead of double-deducting stock.',
      schema: z.object({
        productName: z.string().describe('Exact product name'),
        quantity: z.number().min(1).describe('Quantity requested'),
        variantName: z.string().optional().describe('Variant name such as size/color'),
        customerName: z.string().optional().describe('Customer name if known'),
        deliveryAddress: z.string().optional().describe('Delivery address if delivery is required'),
        paymentMethod: z.string().optional().describe('upi, cod, cash, card, or other'),
      }),
    },
  );
}

export function makeGetProductOrderTool(prisma: PrismaService) {
  return tool(
    async ({ orderId }) => {
      const ctx = getRunContext();
      const order = await findProductOrderForCustomer(prisma, ctx.businessId, {
        orderId,
        leadId: ctx.leadId,
        phone: ctx.phone,
      });

      if (!order) {
        return orderId
          ? `No order found with ID ${orderId}. Please check the order number.`
          : 'No recent product order found for this customer.';
      }

      const itemLines = (order.items ?? [])
        .map((item: any) => `${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''} x${item.quantity}`)
        .join(', ');
      const customerName = order.customer?.name ? ` | Customer: ${order.customer.name}` : '';
      const paymentMethod = (order.metadata as any)?.payment_method ?? order.legacy_order?.payment_method ?? null;
      const paymentText = paymentMethod ? `${order.payment_status} via ${String(paymentMethod).toUpperCase()}` : order.payment_status;
      const address = order.shipping_address ? ` | Delivery: ${order.shipping_address}` : '';

      return (
        `Order #${order.order_number}` +
        ` | Status: ${order.status}` +
        ` | Payment: ${paymentText}` +
        ` | Total: ${money(order.total_amount)}` +
        `${customerName}` +
        `${itemLines ? ` | Items: ${itemLines}` : ''}` +
        `${address}`
      );
    },
    {
      name: 'get_product_order',
      description:
        "Look up a product customer's order status. If orderId is omitted, uses the current lead/phone's most recent product order.",
      schema: z.object({
        orderId: z.string().optional().describe('Product order number or ID. Optional.'),
      }),
    },
  );
}

export function makeGetProductPaymentTool(prisma: PrismaService) {
  return tool(
    async ({ orderId }) => {
      const ctx = getRunContext();
      const order = await findProductOrderForCustomer(prisma, ctx.businessId, {
        orderId,
        leadId: ctx.leadId,
        phone: ctx.phone,
      });

      if (!order) {
        return orderId
          ? `No order found with ID ${orderId}. Please check the order number.`
          : 'No recent product order found for this customer.';
      }

      const payment = order.legacy_order_id
        ? await prisma.payments.findFirst({
            where: { business_id: ctx.businessId, order_id: order.legacy_order_id },
            orderBy: { created_at: 'desc' },
          })
        : null;

      const method = payment?.method ?? (order.metadata as any)?.payment_method ?? order.legacy_order?.payment_method ?? null;
      const amount = payment?.amount ?? order.total_amount;
      const status = payment?.status === 'captured' ? 'paid' : (payment?.status ?? order.payment_status);
      const methodText = method ? ` via ${String(method).toUpperCase()}` : '';

      return `Payment for order #${order.order_number}: ${status}${methodText}. Amount ${money(amount)}.`;
    },
    {
      name: 'get_product_payment',
      description:
        "Look up payment status for a product order. If orderId is omitted, uses the current lead/phone's most recent product order.",
      schema: z.object({
        orderId: z.string().optional().describe('Product order number or ID. Optional.'),
      }),
    },
  );
}
