import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Sync all products to inventory_current table
   * Creates inventory records for products that don't have them
   */
  async syncAllProductsToInventory(
    organizationId?: string,
    defaultStock: number = 100,
    defaultLocation: string = 'MAIN'
  ): Promise<{
    created: number;
    updated: number;
    total: number;
  }> {
    try {
      this.logger.log(`Starting inventory sync for organization: ${organizationId || 'all'}`);

      // Get all active products
      const products = await this.prisma.products.findMany({
        where: {
          ...(organizationId && { organization_id: organizationId }),
          status: 'active'
        },
        select: {
          id: true,
          organization_id: true,
          name: true
        }
      });

      this.logger.log(`Found ${products.length} active products to sync`);

      let created = 0;
      let updated = 0;

      for (const product of products) {
        try {
          // Check if inventory record exists
          const existingInventory = await this.prisma.inventory_current.findFirst({
            where: {
              product_id: product.id,
              organization_id: product.organization_id,
              location_code: defaultLocation
            }
          });

          if (existingInventory) {
            // Update existing record (only if stock is 0 or null)
            if (!existingInventory.available_stock || Number(existingInventory.available_stock) === 0) {
              await this.prisma.inventory_current.update({
                where: {
                  id: existingInventory.id
                },
                data: {
                  available_stock: defaultStock,
                  updated_at: new Date()
                }
              });
              updated++;
              this.logger.debug(`Updated inventory for product: ${product.name}`);
            }
          } else {
            // Create new inventory record
            await this.prisma.inventory_current.create({
              data: {
                product_id: product.id,
                organization_id: product.organization_id,
                available_stock: defaultStock,
                minimum_stock: 10,
                location_code: defaultLocation,
                created_at: new Date(),
                updated_at: new Date()
              }
            });
            created++;
            this.logger.debug(`Created inventory for product: ${product.name}`);
          }
        } catch (error) {
          this.logger.error(`Failed to sync inventory for product ${product.id}:`, error);
        }
      }

      this.logger.log(`Inventory sync completed: ${created} created, ${updated} updated, ${products.length} total`);

      return {
        created,
        updated,
        total: products.length
      };
    } catch (error) {
      this.logger.error('Inventory sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync inventory for a specific product
   */
  async syncProductInventory(
    productId: string,
    organizationId: string,
    availableStock: number = 100,
    locationCode: string = 'MAIN'
  ): Promise<void> {
    try {
      await this.prisma.inventory_current.upsert({
        where: {
          organization_id_product_id_location_code: {
            organization_id: organizationId,
            product_id: productId,
            location_code: locationCode
          }
        },
        create: {
          product_id: productId,
          organization_id: organizationId,
          available_stock: availableStock,
          minimum_stock: 10,
          location_code: locationCode,
          created_at: new Date(),
          updated_at: new Date()
        },
        update: {
          available_stock: availableStock,
          updated_at: new Date()
        }
      });

      this.logger.log(`Synced inventory for product ${productId}: ${availableStock} units`);
    } catch (error) {
      this.logger.error(`Failed to sync product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Add stock to a product
   */
  async addStock(
    productId: string,
    organizationId: string,
    quantity: number,
    locationCode: string = 'MAIN'
  ): Promise<number> {
    try {
      const inventory = await this.prisma.inventory_current.findFirst({
        where: {
          product_id: productId,
          organization_id: organizationId,
          location_code: locationCode
        }
      });

      if (!inventory) {
        // Create new inventory record
        await this.prisma.inventory_current.create({
          data: {
            product_id: productId,
            organization_id: organizationId,
            available_stock: quantity,
            minimum_stock: 10,
            location_code: locationCode,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        return quantity;
      } else {
        // Add to existing stock
        const newStock = Number(inventory.available_stock || 0) + quantity;
        await this.prisma.inventory_current.update({
          where: { id: inventory.id },
          data: {
            available_stock: newStock,
            updated_at: new Date()
          }
        });
        return newStock;
      }
    } catch (error) {
      this.logger.error(`Failed to add stock for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Reduce stock (when order is placed)
   */
  async reduceStock(
    productId: string,
    organizationId: string,
    quantity: number,
    locationCode: string = 'MAIN'
  ): Promise<number> {
    try {
      const inventory = await this.prisma.inventory_current.findFirst({
        where: {
          product_id: productId,
          organization_id: organizationId,
          location_code: locationCode
        }
      });

      if (!inventory) {
        throw new Error(`No inventory found for product ${productId}`);
      }

      const currentStock = Number(inventory.available_stock || 0);
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock. Available: ${currentStock}, Required: ${quantity}`);
      }

      const newStock = currentStock - quantity;
      await this.prisma.inventory_current.update({
        where: { id: inventory.id },
        data: {
          available_stock: newStock,
          updated_at: new Date()
        }
      });

      this.logger.log(`Reduced stock for product ${productId}: ${currentStock} -> ${newStock}`);
      return newStock;
    } catch (error) {
      this.logger.error(`Failed to reduce stock for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get current stock level
   */
  async getStock(
    productId: string,
    organizationId: string,
    locationCode: string = 'MAIN'
  ): Promise<number> {
    try {
      const inventory = await this.prisma.inventory_current.findFirst({
        where: {
          product_id: productId,
          organization_id: organizationId,
          location_code: locationCode
        }
      });

      return inventory?.available_stock ? Number(inventory.available_stock) : 0;
    } catch (error) {
      this.logger.error(`Failed to get stock for product ${productId}:`, error);
      return 0;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(organizationId: string): Promise<Array<{
    productId: string;
    productName: string;
    currentStock: number;
    minimumStock: number;
  }>> {
    try {
      // Get all inventory items for the organization
      const inventoryItems = await this.prisma.inventory_current.findMany({
        where: {
          organization_id: organizationId
        },
        select: {
          product_id: true,
          available_stock: true,
          minimum_stock: true
        }
      });

      // Filter low stock items
      const lowStockItems = inventoryItems.filter(item => {
        const currentStock = Number(item.available_stock || 0);
        const minStock = Number(item.minimum_stock || 0);
        return currentStock <= minStock;
      });

      // Get product names
      const results = await Promise.all(
        lowStockItems.map(async (item) => {
          const product = await this.prisma.products.findUnique({
            where: { id: item.product_id },
            select: { name: true }
          });

          return {
            productId: item.product_id,
            productName: product?.name || 'Unknown',
            currentStock: Number(item.available_stock || 0),
            minimumStock: Number(item.minimum_stock || 0)
          };
        })
      );

      return results;
    } catch (error) {
      this.logger.error('Failed to get low stock products:', error);
      return [];
    }
  }
}
