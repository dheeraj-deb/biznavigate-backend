import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProductRepositoryPrisma } from '../../infrastructure/product.repository.prisma';
import { Product, ProductVariant } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { BulkUploadProductDto } from '../dto/bulk-upload-product.dto';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepositoryPrisma,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    if (!dto.business_id || !dto.tenant_id) {
      throw new BadRequestException('business_id and tenant_id are required');
    }

    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.catalog_items.create({
        data: {
          business_id: dto.business_id!,
          tenant_id: dto.tenant_id!,
          item_type: this.toItemType(dto.product_type),
          name: dto.name,
          description: dto.description,
          category: dto.category,
          base_price: dto.price,
          compare_price: dto.compare_price,
          currency: dto.currency ?? 'INR',
          stock_quantity: dto.track_inventory === false ? null : (dto.stock_quantity ?? 0),
          primary_image_url: dto.primary_image_url,
          image_urls: dto.image_urls,
          attributes: {
            low_stock_threshold: dto.low_stock_threshold ?? 5,
            track_inventory: dto.track_inventory ?? true,
            dimensions: dto.dimensions,
            weight: dto.weight,
          },
          ai_tags: this.buildAiTags(dto),
          is_active: dto.is_active ?? true,
        },
      });

      await tx.product_item_details.create({
        data: {
          item_id: created.item_id,
          business_id: dto.business_id!,
          brand: dto.brand,
          sku: dto.sku,
          condition: dto.condition,
          weight: dto.weight,
          dimensions: dto.dimensions ? { value: dto.dimensions } : undefined,
          metadata: {
            low_stock_threshold: dto.low_stock_threshold ?? 5,
            track_inventory: dto.track_inventory ?? true,
          },
        },
      });

      if (dto.variants?.length) {
        await tx.item_variants.createMany({
          data: dto.variants.map((variant) => ({
            item_id: created.item_id,
            business_id: dto.business_id!,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock_quantity: variant.quantity ?? 0,
            options: variant.variant_options,
            is_active: true,
          })),
        });
      }

      return tx.catalog_items.findUnique({
        where: { item_id: created.item_id },
        include: {
          product_detail: true,
          variants: { where: { is_active: true }, orderBy: { created_at: 'asc' } },
        },
      });
    });

    this.logger.log(`Product created in catalog: ${item?.item_id} - ${dto.name}`);
    return this.toProduct(item);
  }

  async findById(productId: string): Promise<Product & { variants?: ProductVariant[] }> {
    const item = await this.prisma.catalog_items.findFirst({
      where: { item_id: productId, item_type: 'physical_product', deleted_at: null },
      include: {
        product_detail: true,
        variants: { where: { is_active: true }, orderBy: { created_at: 'asc' } },
      },
    });
    if (!item) throw new NotFoundException('Product not found');
    return this.toProduct(item);
  }

  async findAll(query: ProductQueryDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: any = {
      business_id: query.business_id,
      item_type: 'physical_product',
      deleted_at: null,
    };
    if (query.is_active !== undefined) where.is_active = query.is_active;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { ai_tags: { has: query.search.toLowerCase() } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.catalog_items.findMany({
        where,
        skip,
        take: limit,
        include: {
          product_detail: true,
          variants: { where: { is_active: true }, orderBy: { created_at: 'asc' } },
          external_catalog_items: {
            where: { provider: 'whatsapp' },
            take: 1,
            orderBy: { created_at: 'desc' },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.catalog_items.count({ where }),
    ]);

    return { data: items.map((item) => this.toProduct(item)), total, page, limit };
  }

  async update(productId: string, dto: UpdateProductDto): Promise<Product> {
    await this.findById(productId);
    const item = await this.prisma.$transaction(async (tx) => {
      await tx.catalog_items.update({
        where: { item_id: productId },
        data: {
          name: dto.name,
          description: dto.description,
          category: dto.category,
          base_price: dto.price,
          compare_price: dto.compare_price,
          currency: dto.currency,
          stock_quantity: dto.track_inventory === false ? null : dto.stock_quantity,
          primary_image_url: dto.primary_image_url,
          image_urls: dto.image_urls,
          is_active: dto.is_active,
          attributes: {
            low_stock_threshold: dto.low_stock_threshold,
            track_inventory: dto.track_inventory,
            dimensions: dto.dimensions,
            weight: dto.weight,
          },
          ...(dto.name || dto.description || dto.category || dto.sku || dto.brand
            ? { ai_tags: this.buildAiTags({ ...dto, name: dto.name ?? '' } as CreateProductDto) }
            : {}),
          updated_at: new Date(),
        },
      });

      await tx.product_item_details.upsert({
        where: { item_id: productId },
        create: {
          item_id: productId,
          business_id: (await tx.catalog_items.findUnique({ where: { item_id: productId }, select: { business_id: true } }))!.business_id,
          brand: dto.brand,
          sku: dto.sku,
          condition: dto.condition,
          weight: dto.weight,
          dimensions: dto.dimensions ? { value: dto.dimensions } : undefined,
          metadata: {
            low_stock_threshold: dto.low_stock_threshold,
            track_inventory: dto.track_inventory,
          },
        },
        update: {
          brand: dto.brand,
          sku: dto.sku,
          condition: dto.condition,
          weight: dto.weight,
          dimensions: dto.dimensions ? { value: dto.dimensions } : undefined,
          metadata: {
            low_stock_threshold: dto.low_stock_threshold,
            track_inventory: dto.track_inventory,
          },
          updated_at: new Date(),
        },
      });

      return tx.catalog_items.findUnique({
        where: { item_id: productId },
        include: {
          product_detail: true,
          variants: { where: { is_active: true }, orderBy: { created_at: 'asc' } },
        },
      });
    });

    return this.toProduct(item);
  }

  async delete(productId: string): Promise<void> {
    await this.findById(productId);
    await this.prisma.catalog_items.update({
      where: { item_id: productId },
      data: { is_active: false, deleted_at: new Date(), updated_at: new Date() },
    });
  }

  async bulkCreate(dto: BulkUploadProductDto): Promise<{ created: number; failed: number; errors: any[] }> {
    let created = 0;
    const errors: any[] = [];
    for (const [index, product] of dto.products.entries()) {
      try {
        await this.create(product);
        created += 1;
      } catch (error: any) {
        errors.push({ index, name: product.name, error: error.message });
      }
    }
    return { created, failed: errors.length, errors };
  }

  async checkStockAvailability(productId: string, quantity: number): Promise<{ available: boolean; currentStock: number }> {
    const item = await this.prisma.catalog_items.findFirst({
      where: { item_id: productId, item_type: 'physical_product', deleted_at: null },
      select: { stock_quantity: true },
    });
    if (!item) throw new NotFoundException('Product not found');
    const currentStock = item.stock_quantity ?? 0;
    return { available: currentStock >= quantity, currentStock };
  }

  async updateStock(productId: string, quantity: number, operation: 'increment' | 'decrement'): Promise<void> {
    if (quantity <= 0) throw new BadRequestException('Quantity must be greater than zero');
    if (operation === 'decrement') {
      const updated = await this.prisma.catalog_items.updateMany({
        where: { item_id: productId, stock_quantity: { not: null, gte: quantity } },
        data: { stock_quantity: { decrement: quantity }, updated_at: new Date() },
      });
      if (updated.count === 0) throw new ConflictException('Insufficient stock');
      return;
    }
    await this.prisma.catalog_items.updateMany({
      where: { item_id: productId, stock_quantity: { not: null } },
      data: { stock_quantity: { increment: quantity }, updated_at: new Date() },
    });
  }

  async reserveStock(productId: string, quantity: number): Promise<void> {
    await this.updateStock(productId, quantity, 'decrement');
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.updateStock(productId, quantity, 'increment');
  }

  async createVariant(productId: string, dto: any): Promise<ProductVariant> {
    const product = await this.findById(productId);
    const variant = await this.prisma.item_variants.create({
      data: {
        item_id: product.product_id,
        business_id: product.business_id,
        name: dto.name,
        sku: dto.sku,
        price: dto.price,
        stock_quantity: dto.quantity ?? dto.stock_quantity ?? 0,
        options: dto.variant_options ?? dto.options,
      },
    });
    return this.toVariant(variant);
  }

  async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    await this.findById(productId);
    const variants = await this.prisma.item_variants.findMany({
      where: { item_id: productId, is_active: true },
      orderBy: { created_at: 'asc' },
    });
    return variants.map((variant) => this.toVariant(variant));
  }

  async updateVariant(variantId: string, dto: any): Promise<ProductVariant> {
    const variant = await this.prisma.item_variants.update({
      where: { variant_id: variantId },
      data: {
        name: dto.name,
        sku: dto.sku,
        price: dto.price,
        stock_quantity: dto.quantity ?? dto.stock_quantity,
        options: dto.variant_options ?? dto.options,
        is_active: dto.is_active,
        updated_at: new Date(),
      },
    });
    return this.toVariant(variant);
  }

  async deleteVariant(variantId: string): Promise<void> {
    await this.prisma.item_variants.update({
      where: { variant_id: variantId },
      data: { is_active: false, updated_at: new Date() },
    });
  }

  private toItemType(productType?: string) {
    return productType === 'physical' || !productType ? 'physical_product' : productType;
  }

  private toProduct(item: any): Product & { variants?: ProductVariant[] } {
    const detail = item?.product_detail ?? {};
    const attrs = item?.attributes ?? {};
    const external = item?.external_catalog_items?.[0];
    return {
      product_id: item.item_id,
      id: item.item_id,
      business_id: item.business_id,
      tenant_id: item.tenant_id,
      product_type: 'physical',
      item_type: item.item_type,
      name: item.name,
      description: item.description ?? undefined,
      category: item.category ?? undefined,
      price: Number(item.base_price ?? 0),
      base_price: Number(item.base_price ?? 0),
      compare_price: item.compare_price != null ? Number(item.compare_price) : undefined,
      currency: item.currency,
      stock_quantity: item.stock_quantity ?? 0,
      low_stock_threshold: Number(detail?.metadata?.low_stock_threshold ?? attrs?.low_stock_threshold ?? 5),
      image_urls: item.image_urls,
      primary_image_url: item.primary_image_url ?? undefined,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      sku: detail?.sku ?? undefined,
      brand: detail?.brand ?? undefined,
      condition: detail?.condition ?? undefined,
      weight: detail?.weight != null ? Number(detail.weight) : undefined,
      dimensions: detail?.dimensions?.value ?? attrs?.dimensions,
      track_inventory: item.stock_quantity !== null,
      in_stock: (item.stock_quantity ?? 0) > 0,
      ai_generated_tags: item.ai_tags,
      has_variants: Boolean(item.variants?.length),
      variants: item.variants?.map((variant: any) => this.toVariant(variant)) ?? [],
      in_whatsapp_catalog: Boolean(external),
      whatsapp_sync_status: external?.sync_status,
      whatsapp_sync_error: external?.raw_payload?.error,
    } as Product & { variants?: ProductVariant[] };
  }

  private toVariant(variant: any): ProductVariant {
    return {
      variant_id: variant.variant_id,
      product_id: variant.item_id,
      name: variant.name,
      sku: variant.sku ?? undefined,
      price: Number(variant.price ?? 0),
      quantity: variant.stock_quantity ?? 0,
      in_stock: (variant.stock_quantity ?? 0) > 0,
      variant_options: variant.options,
      created_at: variant.created_at,
      updated_at: variant.updated_at,
    };
  }

  private buildAiTags(dto: Partial<CreateProductDto>) {
    return [
      dto.name,
      dto.description,
      dto.category,
      dto.brand,
      dto.sku,
      dto.condition,
    ]
      .filter(Boolean)
      .flatMap((value) => String(value).toLowerCase().split(/[,\s]+/))
      .filter((value, index, values) => value.length > 1 && values.indexOf(value) === index)
      .slice(0, 20);
  }
}
