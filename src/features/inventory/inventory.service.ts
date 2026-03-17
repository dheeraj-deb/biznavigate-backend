import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateServiceDto {
  name: string;
  type: string;
  description?: string;
  base_price: number;
  capacity: number;
  attributes?: Record<string, any>;
  image_urls?: string[];
}

export interface SetAvailabilityDto {
  /** Array of dates (YYYY-MM-DD) to open */
  dates: string[];
  total_slots: number;
  effective_price?: number;
}

export interface CreateHoldDto {
  service_id: string;
  check_in_date: string;   // YYYY-MM-DD
  check_out_date: string;  // YYYY-MM-DD
  slots_held?: number;
  lead_id?: string;
}

export interface CreateBookingDto {
  service_id?: string;
  customer_name: string;
  customer_phone: string;
  check_in_date?: string;
  check_out_date?: string;
  slots_booked?: number;
  special_requests?: string;
  lead_id?: string;
  hold_id?: string;        // if provided, converts an existing hold to booking (no slot re-deduction)
}

export interface UpdateProductStockDto {
  quantity: number;
  low_stock_threshold?: number;
}

export interface UpdateVariantStockDto {
  quantity: number;
  low_stock_threshold?: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVICES (ROOMS / EVENTS / CAMPING)
  // ═══════════════════════════════════════════════════════════════════════════

  async createService(businessId: string, tenantId: string, dto: CreateServiceDto) {
    const service = await this.prisma.services.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        name: dto.name,
        type: dto.type,
        description: dto.description ?? null,
        base_price: dto.base_price,
        capacity: dto.capacity,
        attributes: dto.attributes ?? Prisma.JsonNull,
        image_urls: dto.image_urls ? dto.image_urls : Prisma.JsonNull,
      },
    });

    // Auto-generate availability for the next 365 days so the service is immediately bookable
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = Array.from({ length: 365 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });
    await this.prisma.$transaction(
      dates.map((date) =>
        this.prisma.$executeRaw`
          INSERT INTO service_availability
            (service_id, business_id, date, total_slots, booked_slots, available_slots, effective_price, is_blocked, created_at, updated_at)
          VALUES
            (${service.service_id}::uuid, ${businessId}::uuid, ${date}::date,
             ${dto.capacity}, 0, ${dto.capacity}, NULL, false, NOW(), NOW())
          ON CONFLICT (service_id, date) DO NOTHING
        `
      )
    );

    return service;
  }

  async getServices(businessId: string, type?: string) {
    return this.prisma.services.findMany({
      where: {
        business_id: businessId,
        is_active: true,
        ...(type && { type }),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getServiceById(serviceId: string, businessId: string) {
    if (!serviceId || serviceId === 'undefined') {
      throw new BadRequestException('service_id is required and must be a valid UUID');
    }
    const service = await this.prisma.services.findFirst({
      where: { service_id: serviceId, business_id: businessId },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async updateService(serviceId: string, businessId: string, dto: Partial<CreateServiceDto>) {
    await this.getServiceById(serviceId, businessId);
    return this.prisma.services.update({
      where: { service_id: serviceId },
      data: { ...dto, updated_at: new Date() },
    });
  }

  async deleteService(serviceId: string, businessId: string) {
    await this.getServiceById(serviceId, businessId);
    return this.prisma.services.update({
      where: { service_id: serviceId },
      data: { is_active: false },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AVAILABILITY
  // ═══════════════════════════════════════════════════════════════════════════

  async setAvailability(serviceId: string, businessId: string, dto: SetAvailabilityDto) {
    const service = await this.getServiceById(serviceId, businessId);
    const capacity = service.capacity;

    const rows = dto.dates.map((d) => ({
      service_id: serviceId,
      business_id: businessId,
      date: new Date(d),
      total_slots: dto.total_slots ?? capacity,
      booked_slots: 0,
      available_slots: dto.total_slots ?? capacity,
      effective_price: dto.effective_price ?? null,
      is_blocked: false,
    }));

    // Upsert each date — if already exists, update total/price but preserve bookings
    await this.prisma.$transaction(
      rows.map((row) =>
        this.prisma.$executeRaw`
          INSERT INTO service_availability
            (service_id, business_id, date, total_slots, booked_slots, available_slots, effective_price, is_blocked, created_at, updated_at)
          VALUES
            (${row.service_id}::uuid, ${row.business_id}::uuid, ${row.date}::date,
             ${row.total_slots}, 0, ${row.total_slots},
             ${row.effective_price ?? null}, false, NOW(), NOW())
          ON CONFLICT (service_id, date) DO UPDATE SET
            total_slots     = EXCLUDED.total_slots,
            available_slots = GREATEST(0, EXCLUDED.total_slots - service_availability.booked_slots),
            effective_price = EXCLUDED.effective_price,
            updated_at      = NOW()
        `
      ),
    );

    return { message: `${dto.dates.length} date(s) set successfully` };
  }

  async getAvailability(serviceId: string, from: string, to: string) {
    return this.prisma.service_availability.findMany({
      where: {
        service_id: serviceId,
        date: { gte: new Date(from), lte: new Date(to) },
      },
      orderBy: { date: 'asc' },
    });
  }

  async blockDate(serviceId: string, businessId: string, date: string) {
    await this.getServiceById(serviceId, businessId);
    return this.prisma.service_availability.updateMany({
      where: { service_id: serviceId, date: new Date(date) },
      data: { is_blocked: true, updated_at: new Date() },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOLDS — Soft-lock slots during checkout (15 min timer)
  // ═══════════════════════════════════════════════════════════════════════════

  private readonly HOLD_MINUTES = 15;

  async createHold(businessId: string, dto: CreateHoldDto) {
    const slots = dto.slots_held ?? 1;
    const checkIn = new Date(dto.check_in_date);
    const checkOut = new Date(dto.check_out_date);

    if (checkOut <= checkIn) {
      throw new BadRequestException('check_out_date must be after check_in_date');
    }

    const dateCount = await this.prisma.service_availability.count({
      where: {
        service_id: dto.service_id,
        date: { gte: checkIn, lt: checkOut },
        is_blocked: false,
      },
    });

    if (dateCount === 0) {
      throw new BadRequestException('No availability found for the requested dates');
    }

    return this.prisma.$transaction(async (tx) => {
      // Atomically decrement available_slots — same guard as booking
      const result = await tx.$executeRaw`
        UPDATE service_availability
        SET
          available_slots = available_slots - ${slots},
          updated_at      = NOW()
        WHERE
          service_id          = ${dto.service_id}::uuid
          AND date           >= ${checkIn}::date
          AND date            < ${checkOut}::date
          AND available_slots >= ${slots}
          AND is_blocked      = false
      `;

      if (result < dateCount) {
        throw new ConflictException(
          'One or more dates in the selected range are fully booked or unavailable',
        );
      }

      const expiresAt = new Date(Date.now() + this.HOLD_MINUTES * 60 * 1000);

      return tx.service_holds.create({
        data: {
          service_id: dto.service_id,
          business_id: businessId,
          lead_id: dto.lead_id ?? null,
          check_in_date: checkIn,
          check_out_date: checkOut,
          slots_held: slots,
          expires_at: expiresAt,
        },
      });
    });
  }

  async releaseHold(holdId: string, businessId: string) {
    const hold = await this.prisma.service_holds.findFirst({
      where: { hold_id: holdId, business_id: businessId, status: 'active' },
    });
    if (!hold) throw new NotFoundException('Active hold not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE service_availability
        SET
          available_slots = LEAST(total_slots, available_slots + ${hold.slots_held}),
          updated_at      = NOW()
        WHERE
          service_id = ${hold.service_id}::uuid
          AND date  >= ${hold.check_in_date}::date
          AND date   < ${hold.check_out_date}::date
      `;

      return tx.service_holds.update({
        where: { hold_id: holdId },
        data: { status: 'released' },
      });
    });
  }

  /** Called by background job — release all expired holds */
  async releaseExpiredHolds() {
    const now = new Date();
    const expired = await this.prisma.service_holds.findMany({
      where: { status: 'active', expires_at: { lt: now } },
    });

    if (!expired.length) return 0;

    await this.prisma.$transaction(
      expired.map((hold) =>
        this.prisma.$executeRaw`
          UPDATE service_availability
          SET
            available_slots = LEAST(total_slots, available_slots + ${hold.slots_held}),
            updated_at      = NOW()
          WHERE
            service_id = ${hold.service_id}::uuid
            AND date  >= ${hold.check_in_date}::date
            AND date   < ${hold.check_out_date}::date
        `,
      ),
    );

    await this.prisma.service_holds.updateMany({
      where: { status: 'active', expires_at: { lt: now } },
      data: { status: 'released' },
    });

    return expired.length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOKINGS — Atomic double-booking prevention
  // ═══════════════════════════════════════════════════════════════════════════

  async createBooking(businessId: string, dto: CreateBookingDto) {
    const slots = dto.slots_booked ?? 1;
    const checkIn = new Date(dto.check_in_date);
    const checkOut = new Date(dto.check_out_date);

    if (checkOut <= checkIn) {
      throw new BadRequestException('check_out_date must be after check_in_date');
    }

    return this.prisma.$transaction(async (tx) => {
      // ── Path A: converting an existing hold ─────────────────────────────
      if (dto.hold_id) {
        const hold = await tx.service_holds.findFirst({
          where: { hold_id: dto.hold_id, business_id: businessId, status: 'active' },
        });

        if (!hold) {
          throw new ConflictException('Hold has expired or does not exist. Please re-select your dates.');
        }
        if (hold.expires_at < new Date()) {
          throw new ConflictException('Hold has expired. Please re-select your dates.');
        }

        // Mark hold converted — slots already deducted at hold creation
        await tx.service_holds.update({
          where: { hold_id: dto.hold_id },
          data: { status: 'converted' },
        });

        // Move available_slots to booked_slots (slots were already removed from available at hold time)
        await tx.$executeRaw`
          UPDATE service_availability
          SET booked_slots = booked_slots + ${hold.slots_held}, updated_at = NOW()
          WHERE service_id = ${hold.service_id}::uuid
            AND date >= ${hold.check_in_date}::date
            AND date  < ${hold.check_out_date}::date
        `;

        const availability = await tx.service_availability.findMany({
          where: { service_id: hold.service_id, date: { gte: checkIn, lt: checkOut } },
          include: { services: { select: { base_price: true } } },
        });

        const totalPrice = availability.reduce((sum, av) => {
          return sum + Number(av.effective_price ?? av.services.base_price) * hold.slots_held;
        }, 0);

        return tx.service_bookings.create({
          data: {
            service_id: hold.service_id,
            business_id: businessId,
            lead_id: dto.lead_id ?? hold.lead_id ?? null,
            customer_name: dto.customer_name,
            customer_phone: dto.customer_phone,
            check_in_date: hold.check_in_date,
            check_out_date: hold.check_out_date,
            slots_booked: hold.slots_held,
            total_price: totalPrice,
            special_requests: dto.special_requests ?? null,
          },
        });
      }

      // ── Path B: direct booking without prior hold ────────────────────────
      if (!dto.service_id || !dto.check_in_date || !dto.check_out_date) {
        throw new BadRequestException(
          'service_id, check_in_date, and check_out_date are required when hold_id is not provided',
        );
      }

      const dateCount = await tx.service_availability.count({
        where: {
          service_id: dto.service_id,
          date: { gte: checkIn, lt: checkOut },
          is_blocked: false,
        },
      });

      if (dateCount === 0) {
        throw new BadRequestException('No availability found for the requested dates');
      }

      const result = await tx.$executeRaw`
        UPDATE service_availability
        SET
          booked_slots    = booked_slots + ${slots},
          available_slots = available_slots - ${slots},
          updated_at      = NOW()
        WHERE
          service_id          = ${dto.service_id}::uuid
          AND date           >= ${checkIn}::date
          AND date            < ${checkOut}::date
          AND available_slots >= ${slots}
          AND is_blocked      = false
      `;

      if (result < dateCount) {
        throw new ConflictException(
          'One or more dates in the selected range are fully booked or unavailable',
        );
      }

      const availability = await tx.service_availability.findMany({
        where: { service_id: dto.service_id, date: { gte: checkIn, lt: checkOut } },
        include: { services: { select: { base_price: true } } },
      });

      const totalPrice = availability.reduce((sum, av) => {
        return sum + Number(av.effective_price ?? av.services.base_price) * slots;
      }, 0);

      return tx.service_bookings.create({
        data: {
          service_id: dto.service_id,
          business_id: businessId,
          lead_id: dto.lead_id ?? null,
          customer_name: dto.customer_name,
          customer_phone: dto.customer_phone,
          check_in_date: checkIn,
          check_out_date: checkOut,
          slots_booked: slots,
          total_price: totalPrice,
          special_requests: dto.special_requests ?? null,
        },
      });
    });
  }

  async cancelBooking(bookingId: string, businessId: string) {
    const booking = await this.prisma.service_bookings.findFirst({
      where: { booking_id: bookingId, business_id: businessId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking already cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      // Release slots back
      await tx.$executeRaw`
        UPDATE service_availability
        SET
          booked_slots    = GREATEST(0, booked_slots - ${booking.slots_booked}),
          available_slots = LEAST(total_slots, available_slots + ${booking.slots_booked}),
          updated_at      = NOW()
        WHERE
          service_id = ${booking.service_id}::uuid
          AND date  >= ${booking.check_in_date}::date
          AND date   < ${booking.check_out_date}::date
      `;

      return tx.service_bookings.update({
        where: { booking_id: bookingId },
        data: { status: 'cancelled', updated_at: new Date() },
      });
    });
  }

  async getBookings(businessId: string, status?: string) {
    return this.prisma.service_bookings.findMany({
      where: {
        business_id: businessId,
        ...(status && { status }),
      },
      include: { services: { select: { name: true, type: true, base_price: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCT STOCK — with low-stock alert trigger
  // ═══════════════════════════════════════════════════════════════════════════

  async updateProductStock(productId: string, businessId: string, dto: UpdateProductStockDto) {
    const product = await this.prisma.products.findFirst({
      where: { product_id: productId, business_id: businessId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const threshold = dto.low_stock_threshold ?? product.low_stock_threshold ?? 10;
    const newQty = dto.quantity;
    const isLowStock = newQty <= threshold;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.products.update({
        where: { product_id: productId },
        data: {
          stock_quantity: newQty,
          in_stock: newQty > 0,
          low_stock_threshold: dto.low_stock_threshold ?? undefined,
          updated_at: new Date(),
        },
      });

      await this.handleProductStockAlert(tx, {
        businessId,
        productId,
        variantId: null,
        productName: product.name,
        variantName: null,
        currentStock: newQty,
        threshold,
        isLowStock,
      });

      return updated;
    });
  }

  async updateVariantStock(variantId: string, businessId: string, dto: UpdateVariantStockDto) {
    const variant = await this.prisma.product_variants.findFirst({
      where: { variant_id: variantId },
      include: { product: true },
    });
    if (!variant || variant.product.business_id !== businessId)
      throw new NotFoundException('Variant not found');

    const threshold =
      dto.low_stock_threshold ??
      variant.low_stock_threshold ??
      variant.product.low_stock_threshold ??
      10;
    const newQty = dto.quantity;
    const isLowStock = newQty <= threshold;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product_variants.update({
        where: { variant_id: variantId },
        data: {
          quantity: newQty,
          in_stock: newQty > 0,
          low_stock_threshold: dto.low_stock_threshold ?? undefined,
          updated_at: new Date(),
        },
      });

      await this.handleProductStockAlert(tx, {
        businessId,
        productId: variant.product_id,
        variantId,
        productName: variant.product.name,
        variantName: variant.name,
        currentStock: newQty,
        threshold,
        isLowStock,
      });

      return updated;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STOCK ALERTS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleProductStockAlert(
    tx: Prisma.TransactionClient,
    data: {
      businessId: string;
      productId: string;
      variantId: string | null;
      productName: string;
      variantName: string | null;
      currentStock: number;
      threshold: number;
      isLowStock: boolean;
    },
  ) {
    if (data.isLowStock) {
      // Upsert alert (one active alert per product/variant at a time)
      await tx.$executeRaw`
        INSERT INTO product_stock_alerts
          (alert_id, business_id, product_id, variant_id, product_name, variant_name, current_stock, threshold, status, created_at, updated_at)
        VALUES
          (gen_random_uuid(), ${data.businessId}::uuid, ${data.productId}::uuid,
           ${data.variantId}::uuid, ${data.productName}, ${data.variantName},
           ${data.currentStock}, ${data.threshold}, 'active', NOW(), NOW())
        ON CONFLICT (product_id, variant_id, status)
        DO UPDATE SET
          current_stock = EXCLUDED.current_stock,
          threshold     = EXCLUDED.threshold,
          updated_at    = NOW()
        WHERE product_stock_alerts.status = 'active'
      `;
    } else {
      // Stock back above threshold — auto-resolve any active alert
      await tx.product_stock_alerts.updateMany({
        where: {
          product_id: data.productId,
          variant_id: data.variantId,
          status: 'active',
        },
        data: { status: 'resolved', resolved_at: new Date(), updated_at: new Date() },
      });
    }
  }

  async getLowStockAlerts(businessId: string, _tenantId: string) {
    return this.getStockAlerts(businessId, 'active');
  }

  async getInventoryTurnoverByProduct(
    businessId: string,
    _tenantId: string,
    _startDate?: Date,
    _endDate?: Date,
  ) {
    return this.prisma.products.findMany({
      where: { business_id: businessId, is_active: true },
      select: {
        product_id: true,
        name: true,
        stock_quantity: true,
        low_stock_threshold: true,
      },
    });
  }

  async getStockAlerts(businessId: string, status?: string) {
    return this.prisma.product_stock_alerts.findMany({
      where: {
        business_id: businessId,
        status: status ?? 'active',
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async acknowledgeAlert(alertId: string, businessId: string) {
    const alert = await this.prisma.product_stock_alerts.findFirst({
      where: { alert_id: alertId, business_id: businessId },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.status !== 'active') throw new BadRequestException('Alert is not active');

    return this.prisma.product_stock_alerts.update({
      where: { alert_id: alertId },
      data: { status: 'acknowledged', acknowledged_at: new Date(), updated_at: new Date() },
    });
  }
}
