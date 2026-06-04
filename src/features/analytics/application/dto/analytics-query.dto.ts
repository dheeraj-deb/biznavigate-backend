import { IsOptional, IsDateString, IsIn } from 'class-validator';

export class AnalyticsQueryDto {
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

export class TopProductsQueryDto extends AnalyticsQueryDto {
  @IsOptional()
  limit?: number;
}
