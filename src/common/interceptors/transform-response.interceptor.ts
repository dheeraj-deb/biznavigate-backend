import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standard API Response Interface
 */
export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}

/**
 * Pagination Metadata Interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Transform Response Interceptor
 * Standardizes all API responses to a consistent format
 *
 * @example Response format:
 * ```json
 * {
 *   "success": true,
 *   "data": { ... },
 *   "message": "Success",
 *   "meta": {
 *     "timestamp": "2024-01-01T00:00:00.000Z",
 *     "pagination": {
 *       "page": 1,
 *       "limit": 20,
 *       "total": 100,
 *       "total_pages": 5,
 *       "has_next": true,
 *       "has_prev": false
 *     }
 *   }
 * }
 * ```
 *
 * Apply globally in main.ts:
 * ```typescript
 * app.useGlobalInterceptors(new TransformResponseInterceptor());
 * ```
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in StandardResponse format, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Transform to standard format
        return {
          success: true,
          data: data?.data !== undefined ? data.data : data,
          message: data?.message || 'Success',
          meta: {
            timestamp: new Date().toISOString(),
            ...(data?.meta && { ...data.meta }),
            ...(data?.pagination && { pagination: data.pagination }),
          },
        };
      }),
    );
  }
}
