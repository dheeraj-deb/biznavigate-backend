import { IsUUID, IsOptional, IsDateString, IsIn } from 'class-validator';

/**
 * Query DTO for analytics endpoints
 * Supports filtering by business, tenant, and time range
 */
export class AnalyticsQueryDto {
    @IsUUID()
  businessId: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'thisYear'])
  period?: string;
}

/**
 * Query DTO for top products analytics
 */
export class TopProductsQueryDto extends AnalyticsQueryDto {
    @IsOptional()
  limit?: number;
}
