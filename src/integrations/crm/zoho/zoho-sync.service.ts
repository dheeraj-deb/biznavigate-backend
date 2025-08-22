import { Injectable, Logger } from "@nestjs/common";
import { ZohoItem } from "./interfaces/zoho-item.interface";
import { ZohoService } from "./zoho.service";
import { PrismaService } from "src/prisma/prisma.service";
import { InventoryDatabaseService } from "src/integrations/dbsync/inventory-database.service";

@Injectable()
export class ZohoSyncService {
  private readonly logger = new Logger(ZohoSyncService.name);
  constructor(
    private inventoryDatabaseService: InventoryDatabaseService,
    private prisma: PrismaService,
    private zohoService: ZohoService
  ) {}

  async syncZohoProduct(whatsappnumber: string) {
    try {
      const { client_id, client_secret, organization_id, code, refresh_token } =
        await this.prisma.zoho_user_credential.findUnique({
          where: { whatsapp_number: whatsappnumber },
        });

      const { access_token } = await this.zohoService.getAccessToken(
        client_id,
        client_secret,
        code,
        "refresh_token",
        refresh_token
      );

      const items: ZohoItem[] = await this.zohoService.getItems(
        organization_id,
        access_token
      );

      console.log("items", items)

      let productResult;
      items.forEach(async (item, index) => {
        productResult = await this.inventoryDatabaseService.syncProduct({
          organizationId: organization_id,
          externalSystem: "zoho",
          externalId: item.item_id,
          productData: this.transformZohoProduct(item),
        });
      });

      items.forEach(async (item, index) => {
        if (item.locations && item.locations.length > 0) {
          const inventoryData = this.transformZohoInventory(item.locations);
          await this.inventoryDatabaseService.syncInventory({
            organizationId: organization_id,
            productId: item.item_id,
            inventoryData,
            externalSystem: "zoho",
          });

          productResult.forEach(async (result) => {
            if (result.action === "updated") {
              await this.inventoryDatabaseService.createInventoryMovement({
                organizationId: organization_id,
                productId: item.item_id,
                locationCode: "MAIN",
                movementType: "update",
                transactionType: "sync",
                quantityBefore: result.quantityBefore,
                quantityChange: result.quantityChange,
                quantityAfter: result.quantityAfter,
                unitCost: result.unitCost,
                referenceType: "zoho",
                referenceId: item.item_id,
                sourceSystem: "zoho",
                createdBy: whatsappnumber,
                notes: "Synced from Zoho",
              });
            }
          });
        }
      });
      this.logger.log(
        `Successfully synced products ${items.map((item) => item.name).join(", ")}`
      );
      return {
        success: true,
        productIds: items.map((item) => item.item_id),
        action: productResult.action,
        zohoItemIds: items.map((item) => item.item_id),
      };
    } catch (error) {
      this.logger.error(`Failed to sync Zoho products: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private transformZohoProduct(zohoItem: ZohoItem) {
    return {
      name: zohoItem.name,
      description: zohoItem.description,
      sku: zohoItem.sku,
      sellingPrice: zohoItem.rate ? parseFloat(zohoItem.rate.toString()) : 0,
      purchasePrice: zohoItem.purchase_rate
        ? parseFloat(zohoItem.purchase_rate.toString())
        : 0,
      taxRate: zohoItem.tax_percentage
        ? parseFloat(zohoItem.tax_percentage.toString())
        : 0,
      isActive: zohoItem.status === "active",
      categoryName: zohoItem.group_name,
      reorderLevel: zohoItem.reorder_level
        ? parseFloat(zohoItem.reorder_level.toString())
        : 0,
      attributes: {
        productType: zohoItem.product_type,
        attributeName1: zohoItem.attribute_name1,
        attributeOption1: zohoItem.attribute_option_name1,
        hsnCode: zohoItem.hsn_or_sac,
        upc: zohoItem.upc,
        ean: zohoItem.ean,
        isbn: zohoItem.isbn,
        partNumber: zohoItem.part_number,
        isTaxable: zohoItem.is_taxable,
        taxName: zohoItem.tax_name,
        customFields: zohoItem.custom_fields?.reduce((acc, field) => {
          acc[field.customfield_id] = field.value;
          return acc;
        }, {}),
      },
      images: zohoItem.image_name
        ? [
            {
              name: zohoItem.image_name,
              type: zohoItem.image_type || "jpg",
            },
          ]
        : [],
    };
  }

  private transformZohoInventory(locations: ZohoItem["locations"]) {
    let totalStock = 0;
    let totalAvailable = 0;

    for (const location of locations) {
      const stockOnHand = location.location_stock_on_hand
        ? parseFloat(location.location_stock_on_hand.toString())
        : 0;
      const availableStock = location.location_available_stock
        ? parseFloat(location.location_available_stock.toString())
        : 0;

      totalStock += stockOnHand;
      totalAvailable += availableStock;
    }

    return {
      quantityOnHand: totalStock,
      availableStock: totalAvailable,
      reservedStock: totalStock - totalAvailable,
    };
  }
}
