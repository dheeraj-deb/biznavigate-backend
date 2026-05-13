/**
 * Backfill industry-owned tables from legacy orders/catalog attributes.
 *
 * Usage:
 *   node scripts/backfill-industry-domain-tables.js
 *   node scripts/backfill-industry-domain-tables.js --business <business_id>
 *   node scripts/backfill-industry-domain-tables.js --dry-run
 *
 * This script is safe to re-run. Domain rows are skipped when legacy_order_id
 * already exists, and catalog detail rows are upserted by item_id.
 */

const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const PRODUCT_ORDER_TYPES = new Set([
  'product',
  'product_order',
  'physical_product',
  'retail',
  'ecommerce',
]);

const HOSPITALITY_ORDER_TYPES = new Set([
  'hospitality',
  'hospitality_booking',
  'booking',
  'accommodation',
  'room',
  'hotel',
]);

function parseArgs(argv) {
  const args = {
    businessId: null,
    dryRun: false,
    batchSize: 100,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--business' || arg === '--business-id') {
      args.businessId = argv[i + 1];
      i += 1;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--batch-size') {
      args.batchSize = Number(argv[i + 1]) || args.batchSize;
      i += 1;
    }
  }

  return args;
}

function asPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asDateOnly(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function normalizeType(orderType) {
  return String(orderType || '').toLowerCase().trim();
}

function isProductOrder(order) {
  const orderType = normalizeType(order.order_type);
  return PRODUCT_ORDER_TYPES.has(orderType);
}

function isHospitalityOrder(order) {
  const orderType = normalizeType(order.order_type);
  if (HOSPITALITY_ORDER_TYPES.has(orderType)) {
    return true;
  }

  return order.order_items.some((item) => {
    const snapshot = asPlainObject(item.snapshot);
    return Boolean(snapshot.check_in || snapshot.checkIn || snapshot.check_out || snapshot.checkOut);
  });
}

function productStatus(order) {
  const status = String(order.status || order.delivery_status || 'pending').toLowerCase();
  if (['confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'draft'].includes(status)) {
    return status;
  }
  if (status === 'paid' || status === 'processing') {
    return 'confirmed';
  }
  return 'pending';
}

function hospitalityStatus(order) {
  const status = String(order.status || order.service_status || order.delivery_status || 'confirmed').toLowerCase();
  if (['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'].includes(status)) {
    return status;
  }
  if (status === 'completed' || status === 'delivered') {
    return 'checked_out';
  }
  return 'confirmed';
}

function paymentStatus(order) {
  const status = String(order.payment_status || 'pending').toLowerCase();
  if (['pending', 'paid', 'failed', 'refunded'].includes(status)) {
    return status;
  }
  return 'pending';
}

function firstItemSnapshot(order) {
  return asPlainObject(order.order_items[0]?.snapshot);
}

function extractBookingDates(order) {
  const snapshot = firstItemSnapshot(order);
  const checkIn = asDateOnly(snapshot.check_in || snapshot.checkIn || snapshot.start_date || snapshot.startDate);
  const explicitCheckOut = asDateOnly(snapshot.check_out || snapshot.checkOut || snapshot.end_date || snapshot.endDate);

  if (!checkIn) {
    return { checkIn: null, checkOut: null };
  }

  const nights = Math.max(asInt(snapshot.nights, 1), 1);
  return {
    checkIn,
    checkOut: explicitCheckOut || addDays(checkIn, nights),
  };
}

function extractGuests(order) {
  const snapshot = firstItemSnapshot(order);
  return Math.max(
    asInt(snapshot.guests, null) ||
      asInt(snapshot.num_guests, null) ||
      asInt(snapshot.guest_count, null) ||
      asInt(snapshot.adults, null) ||
      1,
    1,
  );
}

function extractGuestRow(order) {
  const snapshot = firstItemSnapshot(order);
  if (!snapshot.guest_name && !snapshot.name && !snapshot.phone && !snapshot.shipping_phone) {
    return null;
  }

  return {
    name: snapshot.guest_name || snapshot.name || null,
    phone: snapshot.phone || snapshot.shipping_phone || order.shipping_phone || null,
    age: asInt(snapshot.age, null),
    address: snapshot.address || order.shipping_address || null,
    pin_code: snapshot.pin_code || snapshot.pincode || order.shipping_pincode || null,
    metadata: {
      source: 'legacy_order_snapshot',
      legacy_order_id: order.order_id,
    },
    created_at: order.created_at,
  };
}

function productDetailData(item) {
  const attrs = asPlainObject(item.attributes);

  return {
    business_id: item.business_id,
    brand: attrs.brand || null,
    sku: attrs.sku || null,
    condition: attrs.condition || null,
    weight: attrs.weight ?? null,
    dimensions: attrs.dimensions || null,
    warranty: attrs.warranty || null,
    metadata: attrs,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

function hospitalityDetailData(item) {
  const attrs = asPlainObject(item.attributes);
  const amenities =
    attrs.amenities ||
    {
      has_ac: attrs.has_ac ?? attrs.hasAc ?? null,
      has_wifi: attrs.has_wifi ?? attrs.hasWifi ?? null,
      has_pool: attrs.has_pool ?? attrs.hasPool ?? null,
      meal_plan: attrs.meal_plan ?? attrs.mealPlan ?? null,
    };

  return {
    business_id: item.business_id,
    service_type: attrs.service_type || attrs.serviceType || 'accommodation',
    capacity: asInt(attrs.capacity, null),
    total_units: asInt(attrs.total_units ?? attrs.totalUnits, null),
    max_adults: asInt(attrs.max_adults ?? attrs.maxAdults, null),
    bed_type: attrs.bed_type || attrs.bedType || null,
    check_in_time: attrs.check_in_time || attrs.checkInTime || null,
    check_out_time: attrs.check_out_time || attrs.checkOutTime || null,
    amenities,
    cancellation_policy: attrs.cancellation_policy || attrs.cancellationPolicy || null,
    tax_percentage: attrs.tax_percentage ?? attrs.taxPercentage ?? null,
    extra_guest_charge: attrs.extra_guest_charge ?? attrs.extraGuestCharge ?? null,
    metadata: attrs,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

async function backfillCatalogDetails({ businessId, dryRun, batchSize }) {
  console.log('Backfilling catalog detail tables...');

  let cursor = null;
  let scanned = 0;
  let productDetails = 0;
  let hospitalityDetails = 0;

  for (;;) {
    const items = await prisma.catalog_items.findMany({
      where: {
        business_id: businessId || undefined,
        item_type: { in: ['physical_product', 'accommodation'] },
      },
      orderBy: { item_id: 'asc' },
      take: batchSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { item_id: cursor } : undefined,
    });

    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      scanned += 1;

      if (item.item_type === 'physical_product') {
        productDetails += 1;
        if (!dryRun) {
          await prisma.product_item_details.upsert({
            where: { item_id: item.item_id },
            create: {
              item_id: item.item_id,
              ...productDetailData(item),
            },
            update: productDetailData(item),
          });
        }
      }

      if (item.item_type === 'accommodation') {
        hospitalityDetails += 1;
        if (!dryRun) {
          await prisma.hospitality_item_details.upsert({
            where: { item_id: item.item_id },
            create: {
              item_id: item.item_id,
              ...hospitalityDetailData(item),
            },
            update: hospitalityDetailData(item),
          });
        }
      }
    }

    cursor = items[items.length - 1].item_id;
  }

  console.log(`Catalog detail scan complete: ${scanned} items, ${productDetails} product details, ${hospitalityDetails} hospitality details.`);
}

async function createProductOrder(order) {
  const status = productStatus(order);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.product_orders.findUnique({
      where: { legacy_order_id: order.order_id },
      select: { product_order_id: true },
    });

    if (existing) {
      return { created: false };
    }

    const productOrder = await tx.product_orders.create({
      data: {
        business_id: order.business_id,
        tenant_id: order.tenant_id,
        legacy_order_id: order.order_id,
        customer_id: order.customer_id,
        lead_id: order.lead_id,
        order_number: order.order_number,
        status,
        payment_status: paymentStatus(order),
        subtotal: order.subtotal || order.total_amount,
        discount_amount: order.discount_amount || 0,
        tax_amount: order.tax_amount || 0,
        shipping_fee: order.shipping_fee || 0,
        total_amount: order.total_amount,
        source: order.source || 'legacy_backfill',
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_state: order.shipping_state,
        shipping_pincode: order.shipping_pincode,
        shipping_phone: order.shipping_phone,
        notes: order.notes || order.admin_notes,
        metadata: {
          backfilled_from: 'orders',
          legacy_order_type: order.order_type,
          payment_id: order.payment_id,
          payment_method: order.payment_method,
          payment_reference: order.payment_reference,
          tracking_number: order.tracking_number,
        },
        paid_at: order.paid_at,
        cancelled_at: order.cancelled_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: {
          create: order.order_items.map((item) => ({
            item_id: item.item_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            sku: item.sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            total_price: item.total_price,
            snapshot: item.snapshot,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })),
        },
        events: {
          create: {
            business_id: order.business_id,
            to_status: status,
            actor: 'system',
            data: {
              source: 'legacy_backfill',
              legacy_order_id: order.order_id,
            },
            created_at: order.created_at,
          },
        },
      },
    });

    if (order.lead_id && order.order_items.length > 0) {
      await tx.product_inquiries.createMany({
        data: order.order_items.map((item) => ({
          business_id: order.business_id,
          tenant_id: order.tenant_id,
          lead_id: order.lead_id,
          item_id: item.item_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          delivery_pincode: order.shipping_pincode,
          budget: item.total_price,
          status: 'ordered',
          metadata: {
            source: 'legacy_order_backfill',
            legacy_order_id: order.order_id,
            product_order_id: productOrder.product_order_id,
          },
          created_at: order.created_at,
          updated_at: order.updated_at,
        })),
      });
    }

    return { created: true };
  });
}

async function createHospitalityBooking(order) {
  const { checkIn, checkOut } = extractBookingDates(order);
  if (!checkIn || !checkOut) {
    return { created: false, skippedReason: 'missing booking dates' };
  }

  const status = hospitalityStatus(order);
  const guests = extractGuests(order);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.hospitality_bookings.findUnique({
      where: { legacy_order_id: order.order_id },
      select: { hospitality_booking_id: true },
    });

    if (existing) {
      return { created: false };
    }

    const booking = await tx.hospitality_bookings.create({
      data: {
        business_id: order.business_id,
        tenant_id: order.tenant_id,
        legacy_order_id: order.order_id,
        customer_id: order.customer_id,
        lead_id: order.lead_id,
        booking_number: order.order_number,
        status,
        payment_status: paymentStatus(order),
        check_in: checkIn,
        check_out: checkOut,
        guests,
        subtotal: order.subtotal || order.total_amount,
        tax_amount: order.tax_amount || 0,
        discount_amount: order.discount_amount || 0,
        total_amount: order.total_amount,
        source: order.source || 'legacy_backfill',
        notes: order.notes || order.admin_notes,
        metadata: {
          backfilled_from: 'orders',
          legacy_order_type: order.order_type,
          payment_id: order.payment_id,
          payment_method: order.payment_method,
          payment_reference: order.payment_reference,
        },
        cancelled_at: order.cancelled_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
        rooms: {
          create: order.order_items.map((item) => {
            const snapshot = asPlainObject(item.snapshot);
            return {
              item_id: item.item_id,
              item_name: item.product_name,
              quantity: item.quantity,
              nights: Math.max(asInt(snapshot.nights, 1), 1),
              unit_price: item.unit_price,
              total_price: item.total_price,
              snapshot: item.snapshot,
              created_at: item.created_at,
              updated_at: item.updated_at,
            };
          }),
        },
        events: {
          create: {
            business_id: order.business_id,
            to_status: status,
            actor: 'system',
            data: {
              source: 'legacy_backfill',
              legacy_order_id: order.order_id,
            },
            created_at: order.created_at,
          },
        },
      },
    });

    const guest = extractGuestRow(order);
    if (guest) {
      await tx.hospitality_booking_guests.create({
        data: {
          hospitality_booking_id: booking.hospitality_booking_id,
          ...guest,
        },
      });
    }

    if (order.lead_id && order.order_items.length > 0) {
      await tx.hospitality_inquiries.create({
        data: {
          business_id: order.business_id,
          tenant_id: order.tenant_id,
          lead_id: order.lead_id,
          preferred_item_id: order.order_items[0].item_id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          budget: order.total_amount,
          status: 'booked',
          metadata: {
            source: 'legacy_order_backfill',
            legacy_order_id: order.order_id,
            hospitality_booking_id: booking.hospitality_booking_id,
          },
          created_at: order.created_at,
          updated_at: order.updated_at,
        },
      });
    }

    return { created: true };
  });
}

async function backfillOrders({ businessId, dryRun, batchSize }) {
  console.log('Backfilling legacy orders into industry tables...');

  let cursor = null;
  let scanned = 0;
  let productCreated = 0;
  let hospitalityCreated = 0;
  let skipped = 0;
  const skippedReasons = {};

  for (;;) {
    const orders = await prisma.orders.findMany({
      where: { business_id: businessId || undefined },
      include: {
        order_items: {
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { order_id: 'asc' },
      take: batchSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { order_id: cursor } : undefined,
    });

    if (orders.length === 0) {
      break;
    }

    for (const order of orders) {
      scanned += 1;

      if (isProductOrder(order)) {
        if (dryRun) {
          productCreated += 1;
        } else {
          const result = await createProductOrder(order);
          productCreated += result.created ? 1 : 0;
          skipped += result.created ? 0 : 1;
        }
        continue;
      }

      if (isHospitalityOrder(order)) {
        if (dryRun) {
          hospitalityCreated += 1;
        } else {
          const result = await createHospitalityBooking(order);
          hospitalityCreated += result.created ? 1 : 0;
          skipped += result.created ? 0 : 1;
          if (result.skippedReason) {
            skippedReasons[result.skippedReason] = (skippedReasons[result.skippedReason] || 0) + 1;
          }
        }
        continue;
      }

      skipped += 1;
      skippedReasons.unsupported_order_type = (skippedReasons.unsupported_order_type || 0) + 1;
    }

    cursor = orders[orders.length - 1].order_id;
  }

  console.log(`Order scan complete: ${scanned} orders.`);
  console.log(`Product orders created/planned: ${productCreated}.`);
  console.log(`Hospitality bookings created/planned: ${hospitalityCreated}.`);
  console.log(`Skipped: ${skipped}.`);

  if (Object.keys(skippedReasons).length > 0) {
    console.log('Skip reasons:', skippedReasons);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.dryRun) {
    console.log('Dry run enabled. No data will be written.');
  }

  if (args.businessId) {
    console.log(`Restricting backfill to business_id=${args.businessId}`);
  }

  await backfillCatalogDetails(args);
  await backfillOrders(args);
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
