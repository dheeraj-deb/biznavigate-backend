import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../../../prisma/prisma.service';
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

async function findProducts(prisma: PrismaService, businessId: string, search: string, take = 5) {
  const term = search.trim();
  return prisma.catalog_items.findMany({
    where: {
      business_id: businessId,
      item_type: 'physical_product',
      is_active: true,
      deleted_at: null,
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

export function makeSearchProductsTool(prisma: PrismaService) {
  return tool(
    async ({ search, maxPrice }) => {
      const { businessId } = getRunContext();
      const results = await findProducts(prisma, businessId, search ?? '', 8);
      const filtered = maxPrice
        ? results.filter((item) => Number(item.base_price) <= Number(maxPrice))
        : results;

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
        } else {
          const updated = await tx.catalog_items.updateMany({
            where: {
              item_id: product.item_id,
              stock_quantity: { not: null, gte: qty },
            },
            data: { stock_quantity: { decrement: qty }, updated_at: new Date() },
          });
          if (updated.count === 0) return `${product.name} has only ${product.stock_quantity ?? 0} in stock.`;
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
        } else {
          const updated = await tx.catalog_items.updateMany({
            where: {
              item_id: product.item_id,
              stock_quantity: { not: null, gte: qty },
            },
            data: { stock_quantity: { decrement: qty }, updated_at: new Date() },
          });
          if (updated.count === 0) return `${product.name} has only ${product.stock_quantity ?? 0} in stock.`;
        }

        const orderNumber = makeOrderNumber('WA');
        const normalizedPayment = String(paymentMethod ?? 'upi').toLowerCase();
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

        await tx.$queryRawUnsafe(
          `INSERT INTO seller_owner_approvals
             (business_id, tenant_id, title, simple_summary, action_type, risk_level, source, entity_type, entity_id, payload)
           VALUES ($1, $2, 'Confirm WhatsApp order payment', $3, 'payment_followup', 'medium', 'ai', 'product_order', $4, $5::jsonb)`,
          businessId,
          product.tenant_id,
          `${orderNumber} for ${money(total, product.currency)} is waiting for payment confirmation.`,
          productOrder.product_order_id,
          JSON.stringify({ order_number: orderNumber, payment_method: normalizedPayment, total_amount: total }),
        ).catch(() => undefined);

        return `Order ${orderNumber} created for ${product.name} x${qty}. Total ${money(total, product.currency)}. Payment status is pending. Ask the customer to pay by ${normalizedPayment.toUpperCase()} or wait for owner confirmation.`;
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
