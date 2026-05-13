import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { CreateCatalogItemDto } from '../dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from '../dto/update-catalog-item.dto';
import { QueryCatalogDto } from '../dto/query-catalog.dto';
import { SetAvailabilityDto, BlockDateDto } from '../dto/set-availability.dto';
import { CreateVariantDto, UpdateVariantDto } from '../dto/create-variant.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Catalog Items ────────────────────────────────────────────────────────

  async getItems(filters: QueryCatalogDto) {
    const { businessId, item_type, category, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      business_id: businessId,
      is_active: true,
      deleted_at: null,
    };

    if (item_type) where.item_type = item_type;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ai_tags: { has: search.toLowerCase() } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.catalog_items.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          variants: { where: { is_active: true }, orderBy: { price: 'asc' } },
          product_detail: true,
          hospitality_detail: true,
        },
      }),
      this.prisma.catalog_items.count({ where }),
    ]);

    return {
      data: data.map((item) => this.withDetails(item)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getItemById(itemId: string, businessId: string) {
    const item = await this.prisma.catalog_items.findFirst({
      where: { item_id: itemId, business_id: businessId, deleted_at: null },
      include: {
        variants: { where: { is_active: true }, orderBy: { price: 'asc' } },
        product_detail: true,
        hospitality_detail: true,
      },
    });
    if (!item) throw new NotFoundException('Item not found');
    return this.withDetails(item);
  }

  async createItem(businessId: string, tenantId: string, dto: CreateCatalogItemDto) {
    const attributes = this.mergeLegacyAttributes(dto.item_type, dto.attributes, dto.details);

    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.catalog_items.create({
        data: {
          business_id: businessId,
          tenant_id: tenantId,
          item_type: dto.item_type,
          name: dto.name,
          description: dto.description,
          category: dto.category,
          base_price: dto.base_price,
          compare_price: dto.compare_price,
          currency: dto.currency ?? 'INR',
          stock_quantity: dto.stock_quantity,
          primary_image_url: dto.primary_image_url,
          image_urls: dto.image_urls,
          attributes,
          ai_tags: dto.ai_tags ?? [],
        },
      });

      await this.upsertItemDetails(tx, created.item_id, businessId, dto.item_type, attributes, dto.details);

      return tx.catalog_items.findUnique({
        where: { item_id: created.item_id },
        include: {
          variants: { where: { is_active: true }, orderBy: { price: 'asc' } },
          product_detail: true,
          hospitality_detail: true,
        },
      });
    });

    return this.withDetails(item);
  }

  async updateItem(itemId: string, businessId: string, dto: UpdateCatalogItemDto) {
    const existing = await this.getItemById(itemId, businessId);
    const { details, attributes: incomingAttributes, ...catalogData } = dto;
    const attributes = incomingAttributes || details
      ? this.mergeLegacyAttributes(existing.item_type, incomingAttributes ?? existing.attributes, details)
      : undefined;

    const item = await this.prisma.$transaction(async (tx) => {
      await tx.catalog_items.update({
        where: { item_id: itemId },
        data: { ...catalogData, ...(attributes !== undefined && { attributes }), updated_at: new Date() },
      });

      if (attributes !== undefined || details) {
        await this.upsertItemDetails(tx, itemId, businessId, existing.item_type, attributes ?? existing.attributes, details);
      }

      return tx.catalog_items.findUnique({
        where: { item_id: itemId },
        include: {
          variants: { where: { is_active: true }, orderBy: { price: 'asc' } },
          product_detail: true,
          hospitality_detail: true,
        },
      });
    });

    return this.withDetails(item);
  }

  async deleteItem(itemId: string, businessId: string) {
    await this.getItemById(itemId, businessId);
    await this.prisma.catalog_items.update({
      where: { item_id: itemId },
      data: { deleted_at: new Date(), is_active: false },
    });
    return { message: 'Item deleted' };
  }

  async updateStock(itemId: string, businessId: string, quantity: number) {
    await this.getItemById(itemId, businessId);
    return this.prisma.catalog_items.update({
      where: { item_id: itemId },
      data: { stock_quantity: quantity, updated_at: new Date() },
    });
  }

  // ─── Variants ─────────────────────────────────────────────────────────────

  async getVariants(itemId: string, businessId: string) {
    await this.getItemById(itemId, businessId);
    return this.prisma.item_variants.findMany({
      where: { item_id: itemId, is_active: true },
      orderBy: { price: 'asc' },
    });
  }

  async createVariant(itemId: string, businessId: string, dto: CreateVariantDto) {
    const item = await this.getItemById(itemId, businessId);
    if (item.item_type !== 'physical_product') {
      throw new BadRequestException('Variants are only supported for physical_product items');
    }
    return this.prisma.item_variants.create({
      data: {
        item_id: itemId,
        business_id: businessId,
        name: dto.name,
        sku: dto.sku,
        price: dto.price,
        stock_quantity: dto.stock_quantity ?? 0,
        options: dto.options,
      },
    });
  }

  async updateVariant(variantId: string, businessId: string, dto: UpdateVariantDto) {
    const variant = await this.prisma.item_variants.findFirst({
      where: { variant_id: variantId, business_id: businessId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    return this.prisma.item_variants.update({
      where: { variant_id: variantId },
      data: { ...dto, updated_at: new Date() },
    });
  }

  async deleteVariant(variantId: string, businessId: string) {
    const variant = await this.prisma.item_variants.findFirst({
      where: { variant_id: variantId, business_id: businessId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    await this.prisma.item_variants.update({
      where: { variant_id: variantId },
      data: { is_active: false },
    });
    return { message: 'Variant deleted' };
  }

  // ─── Availability ─────────────────────────────────────────────────────────

  async getAvailability(itemId: string, businessId: string, from: string, to: string) {
    await this.getItemById(itemId, businessId);
    const rows = await this.prisma.item_availability.findMany({
      where: {
        item_id: itemId,
        date: { gte: new Date(from), lte: new Date(to) },
      },
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => ({
      date: r.date,
      total_slots: r.total_slots,
      booked_slots: r.booked_slots,
      available_slots: r.is_blocked ? 0 : r.total_slots - r.booked_slots,
      price: r.price_override ?? null,
      is_blocked: r.is_blocked,
    }));
  }

  async setAvailability(itemId: string, businessId: string, dto: SetAvailabilityDto) {
    await this.getItemById(itemId, businessId);

    // Upsert each date — create if not exists, update total_slots / price_override
    const ops = dto.dates.map((d) =>
      this.prisma.item_availability.upsert({
        where: { item_id_date: { item_id: itemId, date: new Date(d) } },
        create: {
          item_id: itemId,
          business_id: businessId,
          date: new Date(d),
          total_slots: dto.total_slots,
          booked_slots: 0,
          price_override: dto.price_override ?? null,
          is_blocked: false,
        },
        update: {
          total_slots: dto.total_slots,
          price_override: dto.price_override ?? null,
          updated_at: new Date(),
        },
      }),
    );

    await Promise.all(ops);
    return { message: `Availability set for ${dto.dates.length} date(s)` };
  }

  async blockDate(itemId: string, businessId: string, dto: BlockDateDto) {
    await this.getItemById(itemId, businessId);
    await this.prisma.item_availability.upsert({
      where: { item_id_date: { item_id: itemId, date: new Date(dto.date) } },
      create: {
        item_id: itemId,
        business_id: businessId,
        date: new Date(dto.date),
        total_slots: 0,
        booked_slots: 0,
        is_blocked: true,
      },
      update: { is_blocked: true, updated_at: new Date() },
    });
    return { message: `Date ${dto.date} blocked` };
  }

  // ─── Agent / Chatbot query ─────────────────────────────────────────────────
  // Optimized read — returns availability-merged results for WhatsApp chatbot

  async queryForAgent(filters: QueryCatalogDto) {
    const { businessId, item_type, check_in, check_out, guests, search } = filters;

    const where: any = {
      business_id: businessId,
      is_active: true,
      deleted_at: null,
    };
    if (item_type) where.item_type = item_type;

    // For physical_product — simple stock check
    if (item_type === 'physical_product') {
      const items = await this.prisma.catalog_items.findMany({
        where: search
          ? { ...where, OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { ai_tags: { has: search.toLowerCase() } },
            ]}
          : where,
        include: { variants: { where: { is_active: true } }, product_detail: true },
        take: 10,
      });
      return items.map((i) => ({
        item_id: i.item_id,
        item_type: i.item_type,
        name: i.name,
        base_price: Number(i.base_price),
        attributes: i.attributes,
        details: this.productDetails(i.product_detail, i.attributes),
        stock_quantity: i.stock_quantity,
        variants: i.variants.map((v) => ({
          variant_id: v.variant_id,
          name: v.name,
          price: Number(v.price),
          stock_quantity: v.stock_quantity,
          options: v.options,
        })),
        primary_image_url: i.primary_image_url,
      }));
    }

    // For accommodation / activity / service — availability check
    const items = await this.prisma.catalog_items.findMany({
      where,
      take: 20,
      include: { hospitality_detail: true },
    });
    if (!items.length) return [];

    const checkIn = check_in ? new Date(check_in) : null;
    const checkOut = check_out ? new Date(check_out) : null;

    const results = await Promise.all(
      items.map(async (item) => {
        const details = this.hospitalityDetails(item.hospitality_detail, item.attributes);
        let availableSlots = details?.total_units ?? item.attributes?.['total_slots'] ?? null;
        let effectivePrice = Number(item.base_price);

        if (checkIn && checkOut) {
          const avRows = await this.prisma.item_availability.findMany({
            where: {
              item_id: item.item_id,
              date: { gte: checkIn, lt: checkOut },
              is_blocked: false,
            },
          });

          if (avRows.length === 0) return null; // no availability set for these dates

          const minAvailable = Math.min(
            ...avRows.map((r) => r.total_slots - r.booked_slots),
          );
          if (minAvailable <= 0) return null; // fully booked

          availableSlots = minAvailable;

          // Use price_override if set on any date in range (take the first override found)
          const overrideRow = avRows.find((r) => r.price_override !== null);
          if (overrideRow?.price_override) {
            effectivePrice = Number(overrideRow.price_override);
          }
        }

        // Filter by guest capacity if provided
        if (guests && details?.capacity) {
          if (details.capacity < guests) return null;
        }

        return {
          item_id: item.item_id,
          item_type: item.item_type,
          name: item.name,
          base_price: Number(item.base_price),
          effective_price: effectivePrice,
          attributes: item.attributes,
          details,
          available_slots: availableSlots,
          primary_image_url: item.primary_image_url,
        };
      }),
    );

    return results.filter(Boolean);
  }

  private withDetails(item: any) {
    if (!item) return item;
    const details = item.item_type === 'physical_product'
      ? this.productDetails(item.product_detail, item.attributes)
      : item.item_type === 'accommodation'
        ? this.hospitalityDetails(item.hospitality_detail, item.attributes)
        : item.attributes ?? null;

    const { product_detail, hospitality_detail, ...rest } = item;
    return { ...rest, details };
  }

  private mergeLegacyAttributes(
    itemType: string,
    attributes?: Record<string, any> | null,
    details?: Record<string, any> | null,
  ) {
    if (!details) return attributes;
    if (itemType !== 'physical_product' && itemType !== 'accommodation') {
      return { ...(attributes ?? {}), ...details };
    }
    return { ...(attributes ?? {}), ...details };
  }

  private async upsertItemDetails(
    tx: any,
    itemId: string,
    businessId: string,
    itemType: string,
    attributes?: Record<string, any> | null,
    details?: Record<string, any> | null,
  ) {
    const source = { ...(attributes ?? {}), ...(details ?? {}) };

    if (itemType === 'physical_product') {
      await tx.product_item_details.upsert({
        where: { item_id: itemId },
        create: {
          item_id: itemId,
          business_id: businessId,
          brand: source.brand,
          sku: source.sku,
          condition: source.condition,
          weight: source.weight,
          dimensions: source.dimensions,
          warranty: source.warranty,
          metadata: source,
        },
        update: {
          brand: source.brand,
          sku: source.sku,
          condition: source.condition,
          weight: source.weight,
          dimensions: source.dimensions,
          warranty: source.warranty,
          metadata: source,
          updated_at: new Date(),
        },
      });
    }

    if (itemType === 'accommodation') {
      await tx.hospitality_item_details.upsert({
        where: { item_id: itemId },
        create: {
          item_id: itemId,
          business_id: businessId,
          service_type: source.service_type,
          capacity: this.toOptionalInt(source.capacity),
          total_units: this.toOptionalInt(source.total_units),
          max_adults: this.toOptionalInt(source.max_adults),
          bed_type: source.bed_type,
          check_in_time: source.check_in_time,
          check_out_time: source.check_out_time,
          amenities: source.amenities,
          cancellation_policy: source.cancellation_policy,
          tax_percentage: source.tax_percentage,
          extra_guest_charge: source.extra_guest_charge,
          metadata: source,
        },
        update: {
          service_type: source.service_type,
          capacity: this.toOptionalInt(source.capacity),
          total_units: this.toOptionalInt(source.total_units),
          max_adults: this.toOptionalInt(source.max_adults),
          bed_type: source.bed_type,
          check_in_time: source.check_in_time,
          check_out_time: source.check_out_time,
          amenities: source.amenities,
          cancellation_policy: source.cancellation_policy,
          tax_percentage: source.tax_percentage,
          extra_guest_charge: source.extra_guest_charge,
          metadata: source,
          updated_at: new Date(),
        },
      });
    }
  }

  private productDetails(detail: any, attributes: any) {
    if (!detail) return attributes ?? null;
    return {
      brand: detail.brand,
      sku: detail.sku,
      condition: detail.condition,
      weight: detail.weight != null ? Number(detail.weight) : null,
      dimensions: detail.dimensions,
      warranty: detail.warranty,
      metadata: detail.metadata,
    };
  }

  private hospitalityDetails(detail: any, attributes: any) {
    if (!detail) return attributes ?? null;
    return {
      service_type: detail.service_type,
      capacity: detail.capacity,
      total_units: detail.total_units,
      max_adults: detail.max_adults,
      bed_type: detail.bed_type,
      check_in_time: detail.check_in_time,
      check_out_time: detail.check_out_time,
      amenities: detail.amenities,
      cancellation_policy: detail.cancellation_policy,
      tax_percentage: detail.tax_percentage != null ? Number(detail.tax_percentage) : null,
      extra_guest_charge: detail.extra_guest_charge != null ? Number(detail.extra_guest_charge) : null,
      metadata: detail.metadata,
    };
  }

  private toOptionalInt(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
  }
}
