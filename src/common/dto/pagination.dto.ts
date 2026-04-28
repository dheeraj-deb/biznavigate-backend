import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Pagination DTO
 * Base class for pagination parameters
 *
 * @example
 * ```typescript
 * export class FilterLeadDto extends PaginationDto {
 *   @IsOptional()
 *   @IsString()
 *   status?: string;
 * }
 * ```
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

    @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

    @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

    @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: 'asc' | 'desc' = 'desc';

  /**
   * Calculate skip value for database queries
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Calculate take value for database queries
   */
  get take(): number {
    return this.limit;
  }
}

/**
 * Helper function to create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
) {
  const total_pages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}
