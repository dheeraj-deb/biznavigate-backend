import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma } from '../../../../../generated/prisma';
import { CreateServiceDto, SetAvailabilityDto, CreateHoldDto, UpdateStockDto } from '../dto';

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
        total_units: dto.total_units ?? 1,
        check_in_time: dto.check_in_time ?? null,
        check_out_time: dto.check_out_time ?? null,
        cancellation_policy: dto.cancellation_policy ?? null,
        tax_percentage: dto.tax_percentage ?? null,
        extra_guest_charge: dto.extra_guest_charge ?? null,
        max_adults: dto.max_adults ?? null,
        attributes: dto.attributes ?? Prisma.JsonNull,
        image_urls: dto.image_urls ? dto.image_urls : Prisma.JsonNull,
      },
    });

    // Auto-generate availability for the next 365 days
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
      where: { business_id: businessId, is_active: true, ...(type && { type }) },
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
      effective_price: dto.effective_price ?? null,
    }));

    await this.prisma.$transaction(
      rows.map((row) =>
        this.prisma.$executeRaw`
          INSERT INTO service_availability
            (service_id, business_id, date, total_slots, booked_slots, available_slots, effective_price, is_blocked, created_at, updated_at)
          VALUES
            (${row.service_id}::uuid, ${row.business_id}::uuid, ${row.date}::date,
             ${row.total_slots}, 0, ${row.total_slots}, ${row.effective_price ?? null}, false, NOW(), NOW())
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
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const [service, blockedDates, bookings, holds] = await Promise.all([
      this.prisma.services.findUnique({
        where: { service_id: serviceId },
        select: { total_units: true, base_price: true },
      }),
      this.prisma.service_blocked_dates.findMany({
        where: { service_id: serviceId, date: { gte: fromDate, lt: toDate } },
        select: { date: true },
      }),
      this.prisma.service_bookings.findMany({
        where: {
          service_id: serviceId,
          status: { in: ['pending', 'confirmed'] },
          check_in_date: { lt: toDate },
          check_out_date: { gt: fromDate },
        },
        select: { check_in_date: true, check_out_date: true, slots_booked: true },
      }),
      this.prisma.service_holds.findMany({
        where: {
          service_id: serviceId,
          status: 'active',
          expires_at: { gt: new Date() },
          check_in_date: { lt: toDate },
          check_out_date: { gt: fromDate },
        },
        select: { check_in_date: true, check_out_date: true, slots_held: true },
      }),
    ]);

    const totalUnits = service?.total_units ?? 1;
    const pricePerNight = Number(service?.base_price ?? 0);
    const isBlocked = blockedDates.length > 0;

    let minAvailable = totalUnits;
    const cur = new Date(fromDate);
    while (cur < toDate) {
      const nextDay = new Date(cur);
      nextDay.setDate(nextDay.getDate() + 1);
      const bookedSlots = bookings
        .filter(b => b.check_in_date < nextDay && b.check_out_date > cur)
        .reduce((sum, b) => sum + b.slots_booked, 0);
      const heldSlots = holds
        .filter(h => h.check_in_date < nextDay && h.check_out_date > cur)
        .reduce((sum, h) => sum + h.slots_held, 0);
      const available = totalUnits - bookedSlots - heldSlots;
      if (available < minAvailable) minAvailable = available;
      cur.setDate(cur.getDate() + 1);
    }

    return { isBlocked, minAvailable, pricePerNight, totalUnits };
  }

  async blockDate(serviceId: string, businessId: string, date: string) {
    await this.getServiceById(serviceId, businessId);
    return this.prisma.service_availability.updateMany({
      where: { service_id: serviceId, date: new Date(date) },
      data: { is_blocked: true, updated_at: new Date() },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOLDS
  // ═══════════════════════════════════════════════════════════════════════════

  private readonly HOLD_MINUTES = 15;

  async createHold(businessId: string, dto: CreateHoldDto) {
    const checkIn = new Date(dto.check_in_date);
    const checkOut = new Date(dto.check_out_date);
    if (checkOut <= checkIn) throw new BadRequestException('check_out_date must be after check_in_date');

    return this.prisma.service_holds.create({
      data: {
        service_id: dto.service_id,
        business_id: businessId,
        lead_id: dto.lead_id ?? null,
        check_in_date: checkIn,
        check_out_date: checkOut,
        slots_held: dto.slots_held ?? 1,
        expires_at: new Date(Date.now() + this.HOLD_MINUTES * 60 * 1000),
      },
    });
  }

  async releaseHold(holdId: string, businessId: string) {
    const hold = await this.prisma.service_holds.findFirst({
      where: { hold_id: holdId, business_id: businessId, status: 'active' },
    });
    if (!hold) throw new NotFoundException('Active hold not found');
    return this.prisma.service_holds.update({
      where: { hold_id: holdId },
      data: { status: 'released' },
    });
  }

  async releaseExpiredHolds() {
    const expired = await this.prisma.service_holds.findMany({
      where: { status: 'active', expires_at: { lt: new Date() } },
    });
    if (!expired.length) return 0;
    await this.prisma.service_holds.updateMany({
      where: { status: 'active', expires_at: { lt: new Date() } },
      data: { status: 'released' },
    });
    return expired.length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCT STOCK
  // ═══════════════════════════════════════════════════════════════════════════

  async updateProductStock(productId: string, businessId: string, dto: UpdateStockDto) {
    const product = await this.prisma.products.findFirst({
      where: { product_id: productId, business_id: businessId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const threshold = dto.low_stock_threshold ?? product.low_stock_threshold ?? 10;
    const isLowStock = dto.quantity <= threshold;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.products.update({
        where: { product_id: productId },
        data: {
          stock_quantity: dto.quantity,
          in_stock: dto.quantity > 0,
          low_stock_threshold: dto.low_stock_threshold ?? undefined,
          updated_at: new Date(),
        },
      });
      await this._handleStockAlert(tx, {
        businessId, productId, variantId: null,
        productName: product.name, variantName: null,
        currentStock: dto.quantity, threshold, isLowStock,
      });
      return updated;
    });
  }

  async updateVariantStock(variantId: string, businessId: string, dto: UpdateStockDto) {
    const variant = await this.prisma.product_variants.findFirst({
      where: { variant_id: variantId },
      include: { product: true },
    });
    if (!variant || variant.product.business_id !== businessId)
      throw new NotFoundException('Variant not found');

    const threshold = dto.low_stock_threshold ?? variant.low_stock_threshold ?? variant.product.low_stock_threshold ?? 10;
    const isLowStock = dto.quantity <= threshold;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product_variants.update({
        where: { variant_id: variantId },
        data: {
          quantity: dto.quantity,
          in_stock: dto.quantity > 0,
          low_stock_threshold: dto.low_stock_threshold ?? undefined,
          updated_at: new Date(),
        },
      });
      await this._handleStockAlert(tx, {
        businessId, productId: variant.product_id, variantId,
        productName: variant.product.name, variantName: variant.name,
        currentStock: dto.quantity, threshold, isLowStock,
      });
      return updated;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STOCK ALERTS
  // ═══════════════════════════════════════════════════════════════════════════

  async getStockAlerts(businessId: string, status?: string) {
    return this.prisma.product_stock_alerts.findMany({
      where: { business_id: businessId, status: status ?? 'active' },
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

  async getLowStockAlerts(businessId: string, _tenantId: string) {
    return this.getStockAlerts(businessId, 'active');
  }

  async getInventoryTurnoverByProduct(businessId: string, _tenantId: string) {
    return this.prisma.products.findMany({
      where: { business_id: businessId, is_active: true },
      select: { product_id: true, name: true, stock_quantity: true, low_stock_threshold: true },
    });
  }

  private async _handleStockAlert(
    tx: Prisma.TransactionClient,
    data: {
      businessId: string; productId: string; variantId: string | null;
      productName: string; variantName: string | null;
      currentStock: number; threshold: number; isLowStock: boolean;
    },
  ) {
    if (data.isLowStock) {
      await tx.$executeRaw`
        INSERT INTO product_stock_alerts
          (alert_id, business_id, product_id, variant_id, product_name, variant_name, current_stock, threshold, status, created_at, updated_at)
        VALUES
          (gen_random_uuid(), ${data.businessId}::uuid, ${data.productId}::uuid,
           ${data.variantId}::uuid, ${data.productName}, ${data.variantName},
           ${data.currentStock}, ${data.threshold}, 'active', NOW(), NOW())
        ON CONFLICT (product_id, variant_id, status)
        DO UPDATE SET current_stock = EXCLUDED.current_stock, threshold = EXCLUDED.threshold, updated_at = NOW()
        WHERE product_stock_alerts.status = 'active'
      `;
    } else {
      await tx.product_stock_alerts.updateMany({
        where: { product_id: data.productId, variant_id: data.variantId, status: 'active' },
        data: { status: 'resolved', resolved_at: new Date(), updated_at: new Date() },
      });
    }
  }
}
