import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InventorySyncService } from '../application/services/inventory-sync.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventorySyncController {
  constructor(private inventorySyncService: InventorySyncService) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Sync all products to inventory_current table',
    description: 'Creates inventory records for products that don\'t have them. Useful for initial setup.'
  })
  @ApiResponse({ status: 200, description: 'Sync completed successfully' })
  async syncAllProducts(
    @Body() body: {
      organizationId?: string;
      defaultStock?: number;
      defaultLocation?: string;
    }
  ) {
    const result = await this.inventorySyncService.syncAllProductsToInventory(
      body.organizationId,
      body.defaultStock || 100,
      body.defaultLocation || 'MAIN'
    );

    return {
      success: true,
      message: `Inventory sync completed: ${result.created} created, ${result.updated} updated`,
      data: result
    };
  }

  @Post('sync/:productId')
  @ApiOperation({ summary: 'Sync specific product inventory' })
  async syncProduct(
    @Param('productId') productId: string,
    @Body() body: {
      organizationId: string;
      availableStock?: number;
      locationCode?: string;
    }
  ) {
    await this.inventorySyncService.syncProductInventory(
      productId,
      body.organizationId,
      body.availableStock || 100,
      body.locationCode || 'MAIN'
    );

    return {
      success: true,
      message: `Product inventory synced successfully`
    };
  }

  @Post('add-stock')
  @ApiOperation({ summary: 'Add stock to a product' })
  async addStock(
    @Body() body: {
      productId: string;
      organizationId: string;
      quantity: number;
      locationCode?: string;
    }
  ) {
    const newStock = await this.inventorySyncService.addStock(
      body.productId,
      body.organizationId,
      body.quantity,
      body.locationCode || 'MAIN'
    );

    return {
      success: true,
      message: `Stock added successfully. New stock: ${newStock}`,
      data: { newStock }
    };
  }

  @Post('reduce-stock')
  @ApiOperation({ summary: 'Reduce stock (when order placed)' })
  async reduceStock(
    @Body() body: {
      productId: string;
      organizationId: string;
      quantity: number;
      locationCode?: string;
    }
  ) {
    try {
      const newStock = await this.inventorySyncService.reduceStock(
        body.productId,
        body.organizationId,
        body.quantity,
        body.locationCode || 'MAIN'
      );

      return {
        success: true,
        message: `Stock reduced successfully. Remaining stock: ${newStock}`,
        data: { newStock }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get('stock/:productId')
  @ApiOperation({ summary: 'Get current stock for a product' })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({ name: 'locationCode', required: false })
  async getStock(
    @Param('productId') productId: string,
    @Query('organizationId') organizationId: string,
    @Query('locationCode') locationCode?: string
  ) {
    const stock = await this.inventorySyncService.getStock(
      productId,
      organizationId,
      locationCode || 'MAIN'
    );

    return {
      success: true,
      data: {
        productId,
        organizationId,
        locationCode: locationCode || 'MAIN',
        availableStock: stock
      }
    };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiQuery({ name: 'organizationId', required: true })
  async getLowStockProducts(
    @Query('organizationId') organizationId: string
  ) {
    const products = await this.inventorySyncService.getLowStockProducts(organizationId);

    return {
      success: true,
      data: products,
      count: products.length
    };
  }
}
