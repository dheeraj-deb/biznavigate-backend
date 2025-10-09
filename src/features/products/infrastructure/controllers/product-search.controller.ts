import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  Logger,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { SemanticSearchService } from '../../application/services/semantic-search.service';
import {
  SemanticSearchRequestDto,
  SemanticSearchResponseDto,
  BulkProductSearchRequestDto,
  BulkProductSearchResponseDto,
  ProductSearchResultDto
} from '../../application/dto/product-search.dto';

@ApiTags('Product Search')
@Controller('api/products/search')
// @UseGuards(AuthGuard) // Uncomment when auth is implemented
export class ProductSearchController {
  private readonly logger = new Logger(ProductSearchController.name);

  constructor(private readonly semanticSearchService: SemanticSearchService) {}

  @Post('semantic')
  @ApiOperation({
    summary: 'Semantic product search',
    description: 'Search for products using natural language queries with semantic matching'
  })
  @ApiBody({ type: SemanticSearchRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search completed successfully',
    type: SemanticSearchResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid search parameters'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error'
  })
  async semanticSearch(
    @Body(ValidationPipe) request: SemanticSearchRequestDto
  ): Promise<SemanticSearchResponseDto> {
    this.logger.log(`Semantic search request: "${request.query}"`);

    try {
      const result = await this.semanticSearchService.searchProducts(request);

      this.logger.log(
        `Search completed: ${result.results.length} results in ${result.processingTime}ms`
      );

      return result;
    } catch (error) {
      this.logger.error('Semantic search failed:', error);
      throw error;
    }
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk semantic product search',
    description: 'Search for multiple product queries in a single request'
  })
  @ApiBody({ type: BulkProductSearchRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk search completed successfully',
    type: BulkProductSearchResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid search parameters'
  })
  async bulkSemanticSearch(
    @Body(ValidationPipe) request: BulkProductSearchRequestDto
  ): Promise<BulkProductSearchResponseDto> {
    this.logger.log(`Bulk semantic search: ${request.queries.length} queries`);

    try {
      const result = await this.semanticSearchService.bulkSearchProducts(request);

      this.logger.log(
        `Bulk search completed: ${request.queries.length} queries in ${result.processingTime}ms`
      );

      return result;
    } catch (error) {
      this.logger.error('Bulk semantic search failed:', error);
      throw error;
    }
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get product name suggestions',
    description: 'Get product name suggestions based on partial query'
  })
  @ApiQuery({
    name: 'query',
    description: 'Partial product name query',
    example: 'cem'
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Organization ID to scope suggestions'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of suggestions',
    example: 5
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suggestions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Portland Cement 50kg', 'White Cement 40kg', 'Quick Cement Mix']
        },
        query: { type: 'string', example: 'cem' },
        total: { type: 'number', example: 3 }
      }
    }
  })
  async getProductSuggestions(
    @Query('query') query: string,
    @Query('organizationId') organizationId?: string,
    @Query('limit') limit?: string
  ) {
    this.logger.log(`Getting suggestions for: "${query}"`);

    try {
      const limitNum = limit ? parseInt(limit, 10) : 5;
      const suggestions = await this.semanticSearchService.getProductSuggestions(
        query,
        organizationId,
        limitNum
      );

      return {
        suggestions,
        query,
        total: suggestions.length
      };
    } catch (error) {
      this.logger.error('Failed to get suggestions:', error);
      throw error;
    }
  }

  @Get('quick')
  @ApiOperation({
    summary: 'Quick product search',
    description: 'Quick search endpoint with query parameters'
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    example: 'cement bags'
  })
  @ApiQuery({
    name: 'org',
    required: false,
    description: 'Organization ID'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results',
    example: 10
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    description: 'Minimum similarity threshold',
    example: 0.3
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quick search completed',
    type: SemanticSearchResponseDto
  })
  async quickSearch(
    @Query('q') query: string,
    @Query('org') organizationId?: string,
    @Query('limit') limit?: string,
    @Query('threshold') threshold?: string
  ): Promise<SemanticSearchResponseDto> {
    this.logger.log(`Quick search: "${query}"`);

    const request: SemanticSearchRequestDto = {
      query,
      organizationId,
      limit: limit ? parseInt(limit, 10) : 10,
      threshold: threshold ? parseFloat(threshold) : 0.3,
      includeStockInfo: true
    };

    return this.semanticSearch(request);
  }

  @Post('parse-order')
  @ApiOperation({
    summary: 'Parse order text into structured products',
    description: 'Parse natural language order text into structured product list with matching'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderText: {
          type: 'string',
          example: 'I need 100 bags of cement and 50 steel rods'
        },
        organizationId: {
          type: 'string',
          example: 'org-123-456'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order parsed successfully',
    schema: {
      type: 'object',
      properties: {
        parsedItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalText: { type: 'string' },
              quantity: { type: 'number' },
              productMatches: {
                type: 'array',
                items: { $ref: '#/components/schemas/ProductSearchResultDto' }
              }
            }
          }
        },
        processingTime: { type: 'number' }
      }
    }
  })
  async parseOrderText(
    @Body() body: { orderText: string; organizationId?: string }
  ) {
    this.logger.log(`Parsing order text: "${body.orderText}"`);

    const startTime = Date.now();

    try {
      // Parse order text into individual items with quantities
      const parsedItems = await this.parseOrderIntoItems(body.orderText);

      // Search for each item
      const results = [];
      for (const item of parsedItems) {
        const searchResult = await this.semanticSearchService.searchProducts({
          query: item.productName,
          organizationId: body.organizationId,
          limit: 3,
          threshold: 0.2,
          includeStockInfo: true
        });

        results.push({
          originalText: item.originalText,
          quantity: item.quantity,
          productMatches: searchResult.results
        });
      }

      const processingTime = Date.now() - startTime;

      return {
        parsedItems: results,
        processingTime
      };
    } catch (error) {
      this.logger.error('Failed to parse order text:', error);
      throw error;
    }
  }

  private async parseOrderIntoItems(orderText: string): Promise<Array<{
    originalText: string;
    productName: string;
    quantity: number;
  }>> {
    const items = [];
    const lines = orderText.split(/[,\n]/).map(line => line.trim()).filter(line => line);

    for (const line of lines) {
      // Try different patterns to extract quantity and product
      const patterns = [
        /^(\d+)\s+(.+)$/,  // "100 cement bags"
        /^(.+?)\s*x\s*(\d+)$/i,  // "cement x 100"
        /^(.+?)\s+(\d+)$/,  // "cement bags 100"
        /(\d+)\s*(.+)/      // "100cement bags"
      ];

      let matched = false;

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          let quantity: number;
          let productName: string;

          if (pattern.source.includes('x')) {
            // "cement x 100" format
            productName = match[1].trim();
            quantity = parseInt(match[2], 10);
          } else {
            // Other formats
            if (isNaN(parseInt(match[1]))) {
              productName = match[1].trim();
              quantity = parseInt(match[2], 10);
            } else {
              quantity = parseInt(match[1], 10);
              productName = match[2].trim();
            }
          }

          if (!isNaN(quantity) && quantity > 0 && productName) {
            items.push({
              originalText: line,
              productName: productName.replace(/\b(bags?|pieces?|units?|boxes?|packets?)\b/gi, '').trim(),
              quantity
            });
            matched = true;
            break;
          }
        }
      }

      // If no pattern matched, treat whole line as product with quantity 1
      if (!matched) {
        items.push({
          originalText: line,
          productName: line,
          quantity: 1
        });
      }
    }

    return items;
  }
}