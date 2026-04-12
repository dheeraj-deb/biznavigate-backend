import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * UsageMeterInterceptor — fire-and-forget per-request API usage tracking.
 * Increments a daily counter per (business_id, endpoint) after response is sent.
 * Never blocks the response — errors are silently swallowed.
 */
@Injectable()
export class UsageMeterInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest();
        const businessId: string | undefined = request.user?.business_id;
        const tenantId: string | undefined = request.user?.tenant_id;

        if (!businessId || !tenantId) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fire-and-forget — never await, never block
        this.prisma.api_usage_metrics
          .upsert({
            where: {
              business_id_endpoint_date: {
                business_id: businessId,
                endpoint: request.path,
                date: today,
              },
            },
            update: { count: { increment: 1 }, updated_at: new Date() },
            create: {
              business_id: businessId,
              tenant_id: tenantId,
              endpoint: request.path,
              date: today,
              count: 1,
            },
          })
          .catch(() => {
            // Silently ignore — metering must never affect the response
          });
      }),
    );
  }
}
