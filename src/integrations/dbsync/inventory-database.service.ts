import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  InventorySyncData,
  ProductSyncData,
} from "./interface/inventory-database.interface";
import { Prisma } from "generated/prisma";
import { randomUUID } from "crypto";

@Injectable()
export class InventoryDatabaseService {
  private readonly logger = new Logger(InventoryDatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncProduct(params: {
    organizationId: string;
    externalSystem: "zoho" | "tally" | "custom";
    externalId: string;
    productData: ProductSyncData;
  }) {
    this.logger.log(
      `Syncing product data for organization ${params.organizationId}`
    );
    // Implement the sync logic here

    const { organizationId, externalSystem, externalId, productData } = params;

    try {
      let categoryId: string | null = null;
      if (productData.categoryName) {
        categoryId = await this.upsertCategory(
          organizationId,
          productData.categoryName,
          externalSystem,
          externalId
        );
      }

      const externalIdField = this.getExternalIdField(externalSystem);
      const externalDataField = this.getExternalDataField(externalSystem);
      const lastSyncField = this.getLastSyncField(externalSystem);

      const existingProduct = await this.prisma.products.findFirst({
        where: {
          organization_id: organizationId,
          [externalIdField]: externalId,
        },
      });

      let productId: string;

      if (existingProduct) {
        console.log("existingProduct.id", existingProduct.id);
        const updatedProduct = await this.prisma.products.update({
          where: {
            id: existingProduct.id,
          },
          data: {
            ...(categoryId && { category_id: categoryId }),
            name: productData.name,
            description: productData.description,
            sku: productData.sku,
            selling_price: productData.sellingPrice,
            purchase_price: productData.purchasePrice,
            tax_rate: productData.taxRate,
            status: productData.isActive ? "active" : "incative",
            reorder_level: productData.reorderLevel,
            attributes: productData.attributes as Prisma.JsonValue,
            images: productData.images as Prisma.JsonValue,
            [externalIdField]: externalId,
            [externalDataField]: productData.systemData as Prisma.JsonValue,
            [lastSyncField]: new Date(),
            updated_at: new Date(),
          },
        });
        productId = updatedProduct.id;
        this.logger.log(
          `Updated product ${updatedProduct.name} from ${externalSystem}`
        );
      } else {
        console.log("Here");
        const newProduct = await this.prisma.products.create({
          data: {
            id: randomUUID(),
            organization_id: organizationId,
            ...(categoryId && {
              product_categories: {
                connect: { id: categoryId },
              },
            }),
            name: productData.name,
            description: productData.description,
            sku: productData.sku,
            selling_price: productData.sellingPrice || 0,
            purchase_price: productData.purchasePrice || 0,
            tax_rate: productData.taxRate || 0,
            status: productData.isActive ? "active" : "inactive",
            reorder_level: productData.reorderLevel || 0,
            attributes: productData.attributes as Prisma.JsonValue,
            images: productData.images as Prisma.JsonValue,
            [externalIdField]: externalId,
            [externalDataField]: productData.systemData as Prisma.JsonValue,
            [lastSyncField]: new Date(),
          },
        });
        productId = newProduct.id;
        this.logger.log(
          `Created new product ${newProduct.name} from ${externalSystem}`
        );

        return {
          success: true,
          productId,
          action: existingProduct ? "updated" : "created",
        };
      }
    } catch (error) {
      this.logger.error(
        `Error syncing product ${params.externalId} from ${params.externalSystem}: ${error.message}, ${error.stack}`
      );
      throw error;
    }
  }

  async syncInventory(params: {
    organizationId: string;
    productId: string;
    locationCode?: string;
    inventoryData: InventorySyncData;
    externalSystem: "zoho" | "tally" | "custom";
  }): Promise<{ success: boolean }> {
    const {
      organizationId,
      productId,
      locationCode = "MAIN",
      inventoryData,
      externalSystem,
    } = params;
    try {
      const syncDataField = this.getStockSyncField(externalSystem);
      const lastSyncField = this.getInventoryLastSyncField(externalSystem);

      const isOutOfStock = inventoryData.quantityOnHand === 0;
      const isLowStock =
        inventoryData.quantityOnHand <= (await this.getReorderLevel(productId));

      await this.prisma.inventory_current.upsert({
        where: {
          organization_id_product_id_location_code: {
            organization_id: organizationId,
            product_id: productId,
            location_code: locationCode,
          },
        },
        create: {
          organization_id: organizationId,
          product_id: productId,
          location_code: locationCode,
          location_name: `Location ${locationCode}`,
          quantity_on_hand: inventoryData.quantityOnHand,
          available_stock: inventoryData.availableStock,
          reserved_stock: inventoryData.reservedStock || 0,
          on_order_stock: inventoryData.onOrderStock || 0,
          average_cost: inventoryData.averageCost || 0,
          last_purchase_cost: inventoryData.lastCost || 0,
          is_out_of_stock: isOutOfStock,
          is_low_stock: isLowStock,
          needs_reorder: isLowStock,
          [syncDataField]: {
            [externalSystem]: inventoryData,
          } as unknown as Prisma.JsonValue,
          [lastSyncField]: new Date(),
        },
        update: {
          quantity_on_hand: inventoryData.quantityOnHand,
          available_stock: inventoryData.availableStock,
          reserved_stock: inventoryData.reservedStock || 0,
          on_order_stock: inventoryData.onOrderStock || 0,
          average_cost: inventoryData.averageCost,
          last_purchase_cost: inventoryData.lastCost,
          is_out_of_stock: isOutOfStock,
          is_low_stock: isLowStock,
          needs_reorder: isLowStock,
          last_movement_date: new Date(),
          [syncDataField]: {
            [externalSystem]: inventoryData,
          } as unknown as Prisma.JsonValue,
          [lastSyncField]: new Date(),
          updated_at: new Date(),
        },
      });
      this.logger.log(
        `Synced inventory for product ${productId} from ${externalSystem}`
      );
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error syncing inventory for product ${productId} in organization ${organizationId}: ${error.message}, ${error.stack}`
      );
      throw error;
    }
  }

  async createInventoryMovement(params: {
    organizationId: string;
    productId: string;
    locationCode: string;
    movementType: string;
    transactionType: string;
    quantityBefore: number;
    quantityChange: number;
    quantityAfter: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    sourceSystem?: string;
    createdBy?: string;
    notes?: string;
  }) {
    try {
      const movement = await this.prisma.inventory_movements.create({
        data: {
          organization_id: params.organizationId,
          product_id: params.productId,
          location_code: params.locationCode,
          movement_type: params.movementType,
          transaction_type: params.transactionType,
          quantity_before: params.quantityBefore,
          quantity_change: params.quantityChange,
          quantity_after: params.quantityAfter,
          unit_cost: params.unitCost,
          total_cost: params.quantityChange * (params.unitCost || 0),
          reference_type: params.referenceType,
          reference_id: params.referenceId,
          source_system: params.sourceSystem,
          created_by: params.createdBy,
          notes: params.notes,
        },
      });

      return movement;
    } catch (error) {
      this.logger.error(
        `Failed to create inventory movement: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private async upsertCategory(
    organizationId: string,
    categoryName: string,
    externalSystem: string,
    externalId: string
  ): Promise<string | null> {
    this.logger.log(
      `Upserting category ${categoryName} for organization ${organizationId}`
    );
    const externalField =
      externalSystem === "zoho"
        ? "zohoGroupId"
        : externalSystem === "tally"
          ? "tallyCategory"
          : "customCategoryId";

    const category = await this.prisma.product_categories.upsert({
      where: {
        organization_id_name: {
          organization_id: organizationId,
          name: categoryName,
        },
      },
      create: {
        organization_id: organizationId,
        name: categoryName,
        [externalField]: externalId,
      },
      update: {
        name: categoryName,
        [externalField]: externalId,
      },
    });

    return category.id;
  }

  private getExternalIdField(system: string): string {
    const fieldMap = {
      zoho: "zoho_item_id",
      tally: "tally_item_name",
      custom: "custom_item_id",
    };
    return fieldMap[system];
  }

  private getExternalDataField(system: string): string {
    const fieldMap = {
      zoho: "zoho_data",
      tally: "tally_data",
      custom: "custom_data",
    };
    return fieldMap[system];
  }

  private getLastSyncField(system: string): string {
    const fieldMap = {
      zoho: "last_synced_zoho",
      tally: "last_synced_tally",
      custom: "last_synced_custom",
    };
    return fieldMap[system];
  }

  private getStockSyncField(system: string): string {
    const fieldMap = {
      zoho: "zohoStockSync",
      tally: "tallyStockSync",
      custom: "customStockSync",
    };
    return fieldMap[system];
  }

  private getInventoryLastSyncField(system: string): string {
    const fieldMap = {
      zoho: "last_synced_zoho",
      tally: "last_synced_tally",
      custom: "last_synced_custom",
    };
    return fieldMap[system];
  }

  private async getReorderLevel(productId: string): Promise<number> {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
      select: { reorder_level: true },
    });
    return product?.reorder_level ? product.reorder_level.toNumber() : 0;
  }
}
