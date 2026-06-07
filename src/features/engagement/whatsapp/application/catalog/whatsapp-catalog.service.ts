import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { WhatsAppApiClientService } from '../../infrastructure/whatsapp-api-client.service';
import * as crypto from 'crypto';

type ImportedProduct = {
  id: string;
  retailer_id?: string;
  name?: string;
  description?: string;
  price?: string | number;
  currency?: string;
  availability?: string;
  image_url?: string;
};

@Injectable()
export class WhatsAppCatalogService {
  private readonly logger = new Logger(WhatsAppCatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappApiClient: WhatsAppApiClientService,
  ) {}

  async toggleProductInCatalog(productId: string, businessId: string, inCatalog: boolean) {
    await this.ensureProductOwned(productId, businessId);
    await this.prisma.external_catalog_items.upsert({
      where: {
        business_id_provider_external_product_id: {
          business_id: businessId,
          provider: 'whatsapp',
          external_product_id: productId,
        },
      },
      update: {
        item_id: productId,
        sync_status: inCatalog ? 'pending' : 'local_only',
        updated_at: new Date(),
      },
      create: {
        business_id: businessId,
        item_id: productId,
        provider: 'whatsapp',
        external_product_id: productId,
        retailer_id: productId,
        sync_status: inCatalog ? 'pending' : 'local_only',
      },
    });

    return {
      success: true,
      productId,
      inCatalog,
      message: inCatalog
        ? 'Product marked for WhatsApp catalog sync'
        : 'Product removed from WhatsApp catalog queue',
    };
  }

  async bulkUpdateCatalog(businessId: string, productIds: string[]) {
    const results = [];
    for (const productId of productIds) {
      results.push(await this.toggleProductInCatalog(productId, businessId, true));
    }
    return { success: true, updated: results.length, results };
  }

  async getCatalogProducts(businessId: string, filters?: Record<string, any>) {
    const statusByItem = await this.getStatusMap(businessId);
    const items = await this.prisma.catalog_items.findMany({
      where: {
        business_id: businessId,
        is_active: true,
        deleted_at: null,
        ...(filters?.item_type ? { item_type: filters.item_type } : {}),
      },
      select: {
        item_id: true,
        name: true,
        description: true,
        base_price: true,
        currency: true,
        stock_quantity: true,
        primary_image_url: true,
        item_type: true,
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });

    return items.map((item) => {
      const sync = statusByItem.get(item.item_id);
      return {
        ...item,
        in_whatsapp_catalog: !!sync && sync.sync_status !== 'local_only',
        whatsapp_sync_status: sync?.sync_status ?? 'not_synced',
        whatsapp_catalog_id: sync?.external_catalog_id ?? null,
        whatsapp_retailer_id: sync?.retailer_id ?? null,
        whatsapp_synced_at: sync?.last_synced_at ?? null,
      };
    });
  }

  async previewImport(businessId: string, limit = 100) {
    const account = await this.getWhatsAppAccount(businessId);
    const catalogId = account.whatsapp_catalog_id;
    if (!catalogId) {
      return {
        hasCatalog: false,
        catalogId: null,
        count: 0,
        products: [],
        message: 'No WhatsApp catalog id is connected for this business yet.',
      };
    }

    const products = await this.whatsappApiClient.getCatalogProducts(catalogId, limit);
    return {
      hasCatalog: true,
      catalogId,
      count: products.length,
      products: products.slice(0, 20).map((product) => this.toPreview(product)),
    };
  }

  async importFromWhatsApp(businessId: string, tenantId: string, limit = 100) {
    const account = await this.getWhatsAppAccount(businessId);
    const catalogId = account.whatsapp_catalog_id;
    if (!catalogId) {
      throw new BadRequestException('No WhatsApp catalog id is connected for this business yet.');
    }

    const itemType = await this.resolveCatalogItemType(businessId);
    const products: ImportedProduct[] = await this.whatsappApiClient.getCatalogProducts(catalogId, limit);
    let created = 0;
    let linked = 0;
    let skipped = 0;
    const imported: any[] = [];

    for (const product of products) {
      if (!product?.id || !product?.name) {
        skipped += 1;
        continue;
      }

      const remoteHash = this.hash(product);
      const existingMap = await this.prisma.external_catalog_items.findUnique({
        where: {
          business_id_provider_external_product_id: {
            business_id: businessId,
            provider: 'whatsapp',
            external_product_id: product.id,
          },
        },
      });

      if (existingMap?.item_id) {
        linked += 1;
        await this.prisma.external_catalog_items.update({
          where: { external_catalog_item_id: existingMap.external_catalog_item_id },
          data: {
            external_catalog_id: catalogId,
            retailer_id: product.retailer_id,
            sync_status: 'synced',
            remote_hash: remoteHash,
            raw_payload: product as any,
            last_synced_at: new Date(),
            updated_at: new Date(),
          },
        });
        continue;
      }

      const matched = await this.findLocalMatch(businessId, product, itemType);
      if (matched) {
        linked += 1;
        await this.upsertMapping({
          businessId,
          itemId: matched.item_id,
          catalogId,
          product,
          syncStatus: 'linked',
          remoteHash,
        });
        imported.push({ item_id: matched.item_id, name: matched.name, action: 'linked' });
        continue;
      }

      const price = this.parseMetaPrice(product.price);
      const item = await this.prisma.$transaction(async (tx) => {
        const createdItem = await tx.catalog_items.create({
          data: {
            business_id: businessId,
            tenant_id: tenantId,
            item_type: itemType,
            name: product.name!.trim(),
            description: product.description ?? null,
            category: 'Imported from WhatsApp',
            base_price: price,
            currency: product.currency || 'INR',
            stock_quantity: itemType === 'physical_product' || itemType === 'vehicle'
              ? this.resolveInitialStock(product.availability)
              : null,
            primary_image_url: product.image_url ?? null,
            image_urls: product.image_url ? [product.image_url] : undefined,
            attributes: {
              source: 'whatsapp_catalog',
              availability: product.availability,
              retailer_id: product.retailer_id,
            },
            ai_tags: this.buildAiTags(product),
          },
        });

        await this.createImportedItemDetails(tx, businessId, createdItem.item_id, itemType, product);

        await tx.external_catalog_items.create({
          data: {
            business_id: businessId,
            item_id: createdItem.item_id,
            provider: 'whatsapp',
            external_catalog_id: catalogId,
            external_product_id: product.id,
            retailer_id: product.retailer_id,
            sync_status: 'synced',
            last_synced_at: new Date(),
            remote_hash: remoteHash,
            local_hash: this.hash(createdItem),
            raw_payload: product as any,
          },
        });

        return createdItem;
      });

      created += 1;
      imported.push({ item_id: item.item_id, name: item.name, action: 'created' });
    }

    return {
      success: true,
      catalogId,
      fetched: products.length,
      created,
      linked,
      skipped,
      imported,
    };
  }

  async syncToWhatsApp(businessId: string, productIds?: string[]) {
    const account = await this.getWhatsAppAccount(businessId);
    const catalogId = account.whatsapp_catalog_id;
    if (!catalogId) {
      throw new BadRequestException('No WhatsApp catalog id is connected for this business yet.');
    }

    const deleteMappings = await this.prisma.external_catalog_items.findMany({
      where: {
        business_id: businessId,
        provider: 'whatsapp',
        sync_status: 'pending_delete',
        ...(productIds?.length ? { item_id: { in: productIds } } : {}),
      },
      take: 200,
    });

    const where: any = {
      business_id: businessId,
      is_active: true,
      deleted_at: null,
      item_type: { in: ['physical_product', 'vehicle', 'property'] },
      ...(productIds?.length ? { item_id: { in: productIds } } : {
        external_catalog_items: {
          some: {
            provider: 'whatsapp',
            sync_status: { in: ['pending', 'failed', 'linked', 'synced'] },
          },
        },
      }),
    };

    const items = await this.prisma.catalog_items.findMany({
      where,
      include: {
        external_catalog_items: {
          where: { provider: 'whatsapp' },
          orderBy: { updated_at: 'desc' },
          take: 1,
        },
      },
      take: 200,
    });

    let synced = 0;
    let failed = 0;
    let deleted = 0;
    let skipped = 0;
    const results: any[] = [];

    for (const mapping of deleteMappings) {
      try {
        if (mapping.external_product_id && mapping.last_synced_at) {
          await this.whatsappApiClient.deleteCatalogProduct(mapping.external_product_id);
        }
        await this.prisma.external_catalog_items.update({
          where: { external_catalog_item_id: mapping.external_catalog_item_id },
          data: {
            sync_status: 'local_only',
            updated_at: new Date(),
          },
        });
        deleted += 1;
        results.push({ item_id: mapping.item_id, status: 'deleted' });
      } catch (error: any) {
        failed += 1;
        await this.prisma.external_catalog_items.update({
          where: { external_catalog_item_id: mapping.external_catalog_item_id },
          data: {
            sync_status: 'failed',
            raw_payload: {
              ...((mapping.raw_payload as any) ?? {}),
              error: error?.response?.data?.error?.message ?? error?.message ?? 'Catalog delete failed',
            },
            updated_at: new Date(),
          },
        });
        results.push({
          item_id: mapping.item_id,
          status: 'failed',
          error: error?.response?.data?.error?.message ?? error?.message ?? 'Catalog delete failed',
        });
      }
    }

    for (const item of items) {
      const mapping = item.external_catalog_items?.[0] ?? null;
      const retailerId = mapping?.retailer_id ?? item.item_id;
      const localHash = this.hash(item);
      const existingProductId = mapping?.external_product_id && mapping.external_product_id !== item.item_id
        ? mapping.external_product_id
        : undefined;
      const readinessMissing = await this.getAppointmentListingReadiness(item);

      if (readinessMissing.length) {
        skipped += 1;
        await this.prisma.external_catalog_items.upsert({
          where: {
            business_id_provider_external_product_id: {
              business_id: businessId,
              provider: 'whatsapp',
              external_product_id: mapping?.external_product_id ?? item.item_id,
            },
          },
          update: {
            sync_status: 'needs_review',
            local_hash: localHash,
            raw_payload: {
              ...((mapping?.raw_payload as any) ?? {}),
              readiness_missing: readinessMissing,
            },
            updated_at: new Date(),
          },
          create: {
            business_id: businessId,
            item_id: item.item_id,
            provider: 'whatsapp',
            external_product_id: item.item_id,
            retailer_id: item.item_id,
            sync_status: 'needs_review',
            local_hash: localHash,
            raw_payload: {
              source: 'local_catalog_sync',
              readiness_missing: readinessMissing,
            },
          },
        });
        results.push({
          item_id: item.item_id,
          name: item.name,
          status: 'needs_review',
          missing: readinessMissing,
        });
        continue;
      }

      try {
        const response = await this.whatsappApiClient.syncCatalogProduct(
          catalogId,
          {
            retailer_id: retailerId,
            name: item.name,
            description: item.description ?? undefined,
            price: Number(item.base_price ?? 0),
            currency: item.currency ?? 'INR',
            availability: item.stock_quantity === 0 ? 'out of stock' : 'in stock',
            image_url: item.primary_image_url ?? undefined,
          },
          existingProductId,
        );

        await this.upsertSyncedLocalMapping({
          businessId,
          itemId: item.item_id,
          catalogId,
          externalProductId: response.id,
          retailerId,
          localHash,
          rawPayload: {
            source: 'local_catalog_sync',
            item_type: item.item_type,
          },
        });

        synced += 1;
        results.push({ item_id: item.item_id, name: item.name, status: 'synced', external_product_id: response.id });
      } catch (error: any) {
        failed += 1;
        await this.markLocalSyncFailed(businessId, item.item_id, retailerId, localHash, error);
        results.push({
          item_id: item.item_id,
          name: item.name,
          status: 'failed',
          error: error?.response?.data?.error?.message ?? error?.message ?? 'Catalog sync failed',
        });
      }
    }

    return {
      success: failed === 0,
      catalogId,
      scanned: items.length,
      synced,
      deleted,
      skipped,
      failed,
      results,
    };
  }

  async removeFromWhatsAppCatalog(productId: string, businessId: string) {
    await this.ensureProductOwned(productId, businessId);
    await this.prisma.external_catalog_items.updateMany({
      where: { business_id: businessId, item_id: productId, provider: 'whatsapp' },
      data: { sync_status: 'local_only', updated_at: new Date() },
    });
    return { success: true, productId };
  }

  async syncProductAvailabilityToCatalog(productId: string): Promise<void> {
    const item = await this.prisma.catalog_items.findUnique({ where: { item_id: productId } });
    if (!item) return;

    await this.prisma.external_catalog_items.updateMany({
      where: { business_id: item.business_id, item_id: productId, provider: 'whatsapp' },
      data: { sync_status: 'pending', local_hash: this.hash(item), updated_at: new Date() },
    });
  }

  async getCatalogId(businessId: string): Promise<string> {
    const account = await this.getWhatsAppAccount(businessId);
    if (!account.whatsapp_catalog_id) {
      throw new BadRequestException('No WhatsApp catalog id is connected for this business yet.');
    }
    return account.whatsapp_catalog_id;
  }

  async getSyncStatus(businessId: string) {
    const rows = await this.prisma.external_catalog_items.groupBy({
      by: ['sync_status'],
      where: { business_id: businessId, provider: 'whatsapp' },
      _count: { _all: true },
    });
    const latest = await this.prisma.external_catalog_items.findFirst({
      where: { business_id: businessId, provider: 'whatsapp', last_synced_at: { not: null } },
      orderBy: { last_synced_at: 'desc' },
      select: { last_synced_at: true },
    });

    const stats = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.sync_status] = row._count._all;
      return acc;
    }, {});

    return {
      stats,
      totalProducts: Object.values(stats).reduce((sum, count) => sum + count, 0),
      synced: stats.synced ?? 0,
      pending: stats.pending ?? 0,
      failed: stats.failed ?? 0,
      lastSync: latest?.last_synced_at ?? null,
      lastSyncAt: latest?.last_synced_at ?? null,
    };
  }

  private async getWhatsAppAccount(businessId: string) {
    const account = await this.prisma.social_accounts.findFirst({
      where: { business_id: businessId, platform: 'whatsapp', is_active: true },
      orderBy: { updated_at: 'desc' },
    });

    if (!account) {
      throw new BadRequestException('Connect WhatsApp before importing catalog products.');
    }
    return account;
  }

  private async ensureProductOwned(productId: string, businessId: string) {
    const product = await this.prisma.catalog_items.findFirst({
      where: { item_id: productId, business_id: businessId, deleted_at: null },
      select: { item_id: true },
    });
    if (!product) {
      throw new BadRequestException('Product not found for this business.');
    }
  }

  private async getStatusMap(businessId: string) {
    const rows = await this.prisma.external_catalog_items.findMany({
      where: { business_id: businessId, provider: 'whatsapp' },
      select: {
        item_id: true,
        sync_status: true,
        external_catalog_id: true,
        retailer_id: true,
        last_synced_at: true,
      },
    });
    return new Map(rows.filter((row) => row.item_id).map((row) => [row.item_id!, row]));
  }

  private async findLocalMatch(businessId: string, product: ImportedProduct, itemType = 'physical_product') {
    if (product.retailer_id && itemType === 'physical_product') {
      const bySku = await this.prisma.catalog_items.findFirst({
        where: {
          business_id: businessId,
          item_type: itemType,
          deleted_at: null,
          product_detail: { is: { sku: product.retailer_id } },
        },
      });
      if (bySku) return bySku;
    }

    return this.prisma.catalog_items.findFirst({
      where: {
        business_id: businessId,
        item_type: itemType,
        deleted_at: null,
        name: { equals: product.name ?? '', mode: 'insensitive' },
      },
    });
  }

  private async upsertMapping(params: {
    businessId: string;
    itemId: string;
    catalogId: string;
    product: ImportedProduct;
    syncStatus: string;
    remoteHash: string;
  }) {
    await this.prisma.external_catalog_items.upsert({
      where: {
        business_id_provider_external_product_id: {
          business_id: params.businessId,
          provider: 'whatsapp',
          external_product_id: params.product.id,
        },
      },
      update: {
        item_id: params.itemId,
        external_catalog_id: params.catalogId,
        retailer_id: params.product.retailer_id,
        sync_status: params.syncStatus,
        remote_hash: params.remoteHash,
        raw_payload: params.product as any,
        last_synced_at: new Date(),
        updated_at: new Date(),
      },
      create: {
        business_id: params.businessId,
        item_id: params.itemId,
        provider: 'whatsapp',
        external_catalog_id: params.catalogId,
        external_product_id: params.product.id,
        retailer_id: params.product.retailer_id,
        sync_status: params.syncStatus,
        remote_hash: params.remoteHash,
        raw_payload: params.product as any,
        last_synced_at: new Date(),
      },
    });
  }

  private async upsertSyncedLocalMapping(params: {
    businessId: string;
    itemId: string;
    catalogId: string;
    externalProductId: string;
    retailerId: string;
    localHash: string;
    rawPayload: Record<string, any>;
  }) {
    const existing = await this.prisma.external_catalog_items.findFirst({
      where: {
        business_id: params.businessId,
        item_id: params.itemId,
        provider: 'whatsapp',
      },
      orderBy: { updated_at: 'desc' },
    });

    if (existing) {
      await this.prisma.external_catalog_items.update({
        where: { external_catalog_item_id: existing.external_catalog_item_id },
        data: {
          external_catalog_id: params.catalogId,
          external_product_id: params.externalProductId,
          retailer_id: params.retailerId,
          sync_status: 'synced',
          local_hash: params.localHash,
          raw_payload: params.rawPayload,
          last_synced_at: new Date(),
          updated_at: new Date(),
        },
      });
      return;
    }

    await this.prisma.external_catalog_items.create({
      data: {
        business_id: params.businessId,
        item_id: params.itemId,
        provider: 'whatsapp',
        external_catalog_id: params.catalogId,
        external_product_id: params.externalProductId,
        retailer_id: params.retailerId,
        sync_status: 'synced',
        local_hash: params.localHash,
        raw_payload: params.rawPayload,
        last_synced_at: new Date(),
      },
    });
  }

  private async markLocalSyncFailed(
    businessId: string,
    itemId: string,
    retailerId: string,
    localHash: string,
    error: any,
  ) {
    const message = error?.response?.data?.error?.message ?? error?.message ?? 'Catalog sync failed';
    const existing = await this.prisma.external_catalog_items.findFirst({
      where: {
        business_id: businessId,
        item_id: itemId,
        provider: 'whatsapp',
      },
      orderBy: { updated_at: 'desc' },
    });

    if (existing) {
      await this.prisma.external_catalog_items.update({
        where: { external_catalog_item_id: existing.external_catalog_item_id },
        data: {
          retailer_id: existing.retailer_id ?? retailerId,
          sync_status: 'failed',
          local_hash: localHash,
          raw_payload: {
            ...(existing.raw_payload as any ?? {}),
            last_error: message,
          },
          updated_at: new Date(),
        },
      });
      return;
    }

    await this.prisma.external_catalog_items.create({
      data: {
        business_id: businessId,
        item_id: itemId,
        provider: 'whatsapp',
        external_product_id: itemId,
        retailer_id: retailerId,
        sync_status: 'failed',
        local_hash: localHash,
        raw_payload: { last_error: message },
      },
    });
  }

  private async resolveCatalogItemType(businessId: string): Promise<'physical_product' | 'vehicle' | 'property'> {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { business_type: true },
    });
    if (business?.business_type === 'used_cars') return 'vehicle';
    if (business?.business_type === 'real_estate') return 'property';
    return 'physical_product';
  }

  private async getAppointmentListingReadiness(item: any): Promise<string[]> {
    if (item.item_type !== 'vehicle' && item.item_type !== 'property') return [];

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT
         row_to_json(vid.*) AS vehicle,
         row_to_json(pid.*) AS property
       FROM catalog_items ci
       LEFT JOIN vehicle_item_details vid ON vid.item_id = ci.item_id
       LEFT JOIN property_item_details pid ON pid.item_id = ci.item_id
       WHERE ci.item_id = $1
       LIMIT 1`,
      item.item_id,
    );
    const details = item.item_type === 'property' ? (rows[0]?.property ?? {}) : (rows[0]?.vehicle ?? {});
    const missing: string[] = [];
    const hasText = (value: any) => typeof value === 'string' ? value.trim().length > 0 : Boolean(value);

    if (!hasText(item.primary_image_url)) missing.push('photo');
    if (Number(item.base_price ?? 0) <= 0) missing.push('price');
    if (!hasText(item.description)) missing.push('description');

    if (item.item_type === 'property') {
      if (!hasText(details.property_type)) missing.push('property type');
      if (!hasText(details.locality) && !hasText(details.city)) missing.push('location');
      if (!hasText(details.map_url) && !hasText(details.visit_landmark)) missing.push('map or landmark');
      if (!hasText(details.documents_status)) missing.push('documents');
      return missing;
    }

    if (!hasText(details.make)) missing.push('make');
    if (!hasText(details.model_name)) missing.push('model');
    if (!details.year) missing.push('year');
    if (details.km_driven === null || details.km_driven === undefined) missing.push('km driven');
    if (!hasText(details.registration_number) && !hasText(details.rc_status)) missing.push('RC or registration');
    if (!hasText(details.insurance_valid_until)) missing.push('insurance');
    return missing;
  }

  private async createImportedItemDetails(
    tx: any,
    businessId: string,
    itemId: string,
    itemType: 'physical_product' | 'vehicle' | 'property',
    product: ImportedProduct,
  ) {
    if (itemType === 'physical_product') {
      await tx.product_item_details.create({
        data: {
          item_id: itemId,
          business_id: businessId,
          sku: product.retailer_id ?? null,
          metadata: {
            source: 'whatsapp_catalog',
            external_product_id: product.id,
          },
        },
      });
      return;
    }

    if (itemType === 'vehicle') {
      const vehicle = this.parseVehicleFromCatalogProduct(product);
      await tx.vehicle_item_details.create({
        data: {
          item_id: itemId,
          business_id: businessId,
          make: vehicle.make,
          model_name: vehicle.model_name,
          year: vehicle.year,
          fuel_type: vehicle.fuel_type,
          transmission: vehicle.transmission,
          km_driven: vehicle.km_driven,
          condition: 'used',
          metadata: {
            source: 'whatsapp_catalog',
            external_product_id: product.id,
            retailer_id: product.retailer_id,
          },
        },
      });
      return;
    }

    await tx.$queryRawUnsafe(
      `INSERT INTO property_item_details
         (item_id, business_id, property_type, listing_type, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (item_id) DO NOTHING`,
      itemId,
      businessId,
      'flat',
      'sale',
      JSON.stringify({
        source: 'whatsapp_catalog',
        external_product_id: product.id,
        retailer_id: product.retailer_id,
      }),
    );
  }

  private parseVehicleFromCatalogProduct(product: ImportedProduct) {
    const text = `${product.name ?? ''} ${product.description ?? ''}`;
    const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
    const nameWithoutYear = String(product.name ?? 'Vehicle').replace(/\b(19\d{2}|20\d{2})\b/, '').trim();
    const parts = nameWithoutYear.split(/\s+/).filter(Boolean);
    const make = parts[0] ?? 'Vehicle';
    const modelName = parts.slice(1).join(' ') || nameWithoutYear || 'Vehicle';
    const fuel = text.match(/\b(petrol|diesel|cng|electric|ev|hybrid)\b/i)?.[1];
    const transmission = text.match(/\b(manual|automatic|amt)\b/i)?.[1];
    const kmMatch = text.match(/\b([\d,]+)\s*(km|kms|kilometer|kilometers)\b/i);
    const km = kmMatch ? Number(kmMatch[1].replace(/,/g, '')) : null;

    return {
      make,
      model_name: modelName,
      year,
      fuel_type: fuel ? fuel.toLowerCase() : null,
      transmission: transmission ? transmission.toLowerCase() : null,
      km_driven: Number.isFinite(km) ? km : null,
    };
  }

  private toPreview(product: ImportedProduct) {
    return {
      external_product_id: product.id,
      retailer_id: product.retailer_id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      availability: product.availability,
      image_url: product.image_url,
    };
  }

  private parseMetaPrice(value: string | number | undefined): number {
    if (typeof value === 'number') return Math.max(value, 0);
    if (!value) return 0;
    const parsed = Number(String(value).replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private resolveInitialStock(availability?: string): number {
    if (!availability) return 1;
    return ['out of stock', 'out_of_stock', 'unavailable'].includes(availability.toLowerCase()) ? 0 : 1;
  }

  private buildAiTags(product: ImportedProduct): string[] {
    return [product.name, product.description, product.retailer_id]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((tag, index, arr) => tag.length > 2 && arr.indexOf(tag) === index)
      .slice(0, 20);
  }

  private hash(value: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(value ?? {})).digest('hex');
  }
}
