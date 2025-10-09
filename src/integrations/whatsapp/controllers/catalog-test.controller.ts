import { Controller, Get, Query, Post, Body, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductCatalogService } from '../services/product-catalog.service';

@ApiTags('WhatsApp Catalog Testing')
@Controller('api/whatsapp/catalog')
export class CatalogTestController {
  private readonly logger = new Logger(CatalogTestController.name);

  constructor(private catalogService: ProductCatalogService) {}

  @Get('quick')
  @ApiOperation({
    summary: 'Generate quick catalog message',
    description: 'Get a quick catalog message for WhatsApp showing top products'
  })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID (optional)', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quick catalog generated successfully'
  })
  async getQuickCatalog(@Query('organizationId') organizationId?: string) {
    this.logger.log(`Generating quick catalog for org: ${organizationId || 'all'}`);

    // If no organizationId provided, use empty string to get all products
    const orgId = organizationId || '';
    const message = await this.catalogService.generateQuickCatalog(orgId);

    return {
      message,
      organizationIdUsed: orgId,
      generatedAt: new Date().toISOString()
    };
  }

  @Get('test-no-filter')
  @ApiOperation({
    summary: 'Test catalog with no organization filter',
    description: 'Test catalog generation without organization filter to see if products exist'
  })
  async testNoFilter() {
    this.logger.log(`Testing catalog with no organization filter`);

    const result = await this.catalogService.generateCatalogMessage({
      organizationId: '', // Empty string to skip org filter
      includeStockInfo: false,
      includePrice: true,
      maxProducts: 5
    });

    return {
      foundProducts: result.products.length,
      totalProducts: result.totalProducts,
      message: result.message,
      testNote: 'This test uses no organization filter to check if products exist in DB'
    };
  }

  @Get('full')
  @ApiOperation({
    summary: 'Generate full catalog message',
    description: 'Get a paginated full catalog message for WhatsApp'
  })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'category', description: 'Category ID filter', required: false })
  @ApiQuery({ name: 'search', description: 'Search query', required: false })
  @ApiQuery({ name: 'sortBy', description: 'Sort by field', required: false, enum: ['name', 'price', 'stock'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Full catalog generated successfully'
  })
  async getFullCatalog(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'name' | 'price' | 'stock'
  ) {
    this.logger.log(`Generating full catalog for org: ${organizationId}, page: ${page}`);

    const result = await this.catalogService.generateCatalogMessage({
      organizationId,
      page: page ? parseInt(page, 10) : 1,
      category,
      searchQuery: search,
      sortBy,
      includeStockInfo: true,
      includePrice: true,
      maxProducts: 10
    });

    return result;
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Generate categories message',
    description: 'Get categories list message for WhatsApp'
  })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories message generated successfully'
  })
  async getCategories(@Query('organizationId') organizationId: string) {
    this.logger.log(`Generating categories for org: ${organizationId}`);

    const message = await this.catalogService.generateCategoriesMessage(organizationId);

    return {
      message,
      generatedAt: new Date().toISOString()
    };
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search products catalog',
    description: 'Search products and generate WhatsApp catalog message'
  })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'query', description: 'Search query', required: true })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results generated successfully'
  })
  async searchProducts(
    @Query('organizationId') organizationId: string,
    @Query('query') query: string,
    @Query('page') page?: string
  ) {
    this.logger.log(`Searching products for org: ${organizationId}, query: "${query}"`);

    const result = await this.catalogService.searchCatalog(organizationId, query, {
      page: page ? parseInt(page, 10) : 1
    });

    return result;
  }

  @Post('simulate')
  @ApiOperation({
    summary: 'Simulate WhatsApp catalog conversation',
    description: 'Simulate how catalog messages would appear in WhatsApp conversation'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Simulation completed successfully'
  })
  async simulateConversation(
    @Body() request: {
      organizationId: string;
      commands: string[];
    }
  ) {
    this.logger.log(`Simulating conversation for org: ${request.organizationId}`);

    const responses = [];

    for (const command of request.commands) {
      let response = '';

      try {
        const lowerCommand = command.toLowerCase().trim();

        if (lowerCommand === 'catalog' || lowerCommand === 'products') {
          const result = await this.catalogService.generateCatalogMessage({
            organizationId: request.organizationId,
            includeStockInfo: true,
            includePrice: true
          });
          response = result.message;

        } else if (lowerCommand === 'categories') {
          response = await this.catalogService.generateCategoriesMessage(request.organizationId);

        } else if (lowerCommand === 'quick') {
          response = await this.catalogService.generateQuickCatalog(request.organizationId);

        } else if (lowerCommand.startsWith('search ')) {
          const searchQuery = lowerCommand.replace('search ', '').trim();
          const result = await this.catalogService.searchCatalog(request.organizationId, searchQuery);
          response = result.message;

        } else if (lowerCommand === 'next') {
          const result = await this.catalogService.generateCatalogMessage({
            organizationId: request.organizationId,
            page: 2,
            includeStockInfo: true,
            includePrice: true
          });
          response = result.message;

        } else if (lowerCommand === 'prev') {
          const result = await this.catalogService.generateCatalogMessage({
            organizationId: request.organizationId,
            page: 1,
            includeStockInfo: true,
            includePrice: true
          });
          response = result.message;

        } else {
          response = `🤖 Command "${command}" not recognized.\n\nAvailable commands:\n• catalog\n• categories\n• search [keyword]\n• quick\n• next\n• prev`;
        }

      } catch (error) {
        response = `❌ Error processing command "${command}": ${error.message}`;
      }

      responses.push({
        command,
        response,
        timestamp: new Date().toISOString()
      });
    }

    return {
      organizationId: request.organizationId,
      totalCommands: request.commands.length,
      responses,
      simulatedAt: new Date().toISOString()
    };
  }

  @Post('cache/clear')
  @ApiOperation({
    summary: 'Clear catalog cache',
    description: 'Clear cached catalog data for an organization'
  })
  async clearCache(@Body() request: { organizationId: string }) {
    this.logger.log(`Clearing catalog cache for org: ${request.organizationId}`);

    await this.catalogService.clearCatalogCache(request.organizationId);

    return {
      message: 'Cache cleared successfully',
      organizationId: request.organizationId,
      clearedAt: new Date().toISOString()
    };
  }

  @Get('preview')
  @ApiOperation({
    summary: 'Preview catalog message formats',
    description: 'Get examples of different catalog message formats'
  })
  async previewFormats(@Query('organizationId') organizationId: string) {
    if (!organizationId) {
      return {
        error: 'organizationId is required'
      };
    }

    const [quickCatalog, fullCatalog, categories, searchResult] = await Promise.all([
      this.catalogService.generateQuickCatalog(organizationId),
      this.catalogService.generateCatalogMessage({
        organizationId,
        maxProducts: 5,
        includeStockInfo: true,
        includePrice: true
      }),
      this.catalogService.generateCategoriesMessage(organizationId),
      this.catalogService.searchCatalog(organizationId, 'cement', { maxProducts: 3 })
    ]);

    return {
      formats: {
        quickCatalog: {
          title: 'Quick Catalog (Top 5 Products)',
          message: quickCatalog
        },
        fullCatalog: {
          title: 'Full Catalog (Paginated)',
          message: fullCatalog.message,
          pagination: {
            currentPage: fullCatalog.currentPage,
            totalPages: fullCatalog.totalPages,
            totalProducts: fullCatalog.totalProducts
          }
        },
        categories: {
          title: 'Categories List',
          message: categories
        },
        searchResult: {
          title: 'Search Results',
          message: searchResult.message,
          query: 'cement',
          totalResults: searchResult.totalProducts
        }
      },
      generatedAt: new Date().toISOString()
    };
  }
}