import { IsString, IsOptional, IsNumber, Min, Max, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SemanticSearchRequestDto {
  @ApiProperty({
    description: 'Search query for product matching',
    example: 'cement bags for construction'
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Organization ID to scope the search',
    example: 'org-123-456'
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 10,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Minimum similarity threshold (0-1)',
    example: 0.5,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number = 0.3;

  @ApiPropertyOptional({
    description: 'Include only products with available stock',
    example: true
  })
  @IsOptional()
  includeStockInfo?: boolean = true;
}

export class ProductSearchResultDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'prod-123-456'
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Portland Cement 50kg Bag'
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality Portland cement suitable for construction'
  })
  description?: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'CEMENT-50KG-001'
  })
  sku?: string;

  @ApiProperty({
    description: 'Selling price',
    example: 450.00
  })
  sellingPrice?: number;

  @ApiProperty({
    description: 'Purchase price',
    example: 400.00
  })
  purchasePrice?: number;

  @ApiProperty({
    description: 'MRP',
    example: 500.00
  })
  mrp?: number;

  @ApiProperty({
    description: 'HSN code',
    example: '25232990'
  })
  hsnCode?: string;

  @ApiProperty({
    description: 'Product status',
    example: 'active'
  })
  status?: string;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 150
  })
  availableStock?: number;

  @ApiProperty({
    description: 'Minimum stock level',
    example: 20
  })
  minimumStock?: number;

  @ApiProperty({
    description: 'Similarity score (0-1)',
    example: 0.95
  })
  similarityScore: number;

  @ApiProperty({
    description: 'Whether product is available in stock',
    example: true
  })
  available: boolean;

  @ApiProperty({
    description: 'Confidence level of the match',
    example: 0.95
  })
  confidence: number;
}

export class SemanticSearchResponseDto {
  @ApiProperty({
    description: 'Array of matching products',
    type: [ProductSearchResultDto]
  })
  @IsArray()
  results: ProductSearchResultDto[];

  @ApiProperty({
    description: 'Total number of results found',
    example: 25
  })
  total: number;

  @ApiProperty({
    description: 'Query that was searched',
    example: 'cement bags for construction'
  })
  query: string;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 156
  })
  processingTime: number;
}

export class BulkProductSearchRequestDto {
  @ApiProperty({
    description: 'Array of product queries to search',
    example: ['cement x 100', 'steel rods x 50', 'paint buckets']
  })
  @IsArray()
  @IsString({ each: true })
  queries: string[];

  @ApiPropertyOptional({
    description: 'Organization ID to scope the search',
    example: 'org-123-456'
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Maximum results per query',
    example: 5,
    minimum: 1,
    maximum: 20
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limitPerQuery?: number = 5;

  @ApiPropertyOptional({
    description: 'Minimum similarity threshold',
    example: 0.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number = 0.3;
}

export class BulkProductSearchResponseDto {
  @ApiProperty({
    description: 'Results organized by query',
    example: {
      'cement x 100': [/* ProductSearchResultDto[] */],
      'steel rods x 50': [/* ProductSearchResultDto[] */]
    }
  })
  results: Record<string, ProductSearchResultDto[]>;

  @ApiProperty({
    description: 'Total processing time in milliseconds',
    example: 456
  })
  processingTime: number;

  @ApiProperty({
    description: 'Number of queries processed',
    example: 3
  })
  totalQueries: number;
}