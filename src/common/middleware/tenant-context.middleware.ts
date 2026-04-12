import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../../prisma/tenant-context';

/**
 * TenantContextMiddleware — reads tenant_id from the authenticated JWT payload
 * (set by JwtStrategy) and stores it in AsyncLocalStorage for the duration of
 * the request. This enables the Prisma $use middleware to automatically scope
 * all queries to the current tenant without explicit where clauses.
 *
 * Apply AFTER JWT auth runs (i.e., the route must be authenticated).
 * Public routes (auth/*, webhooks/*, health/*) won't have request.user,
 * so TenantContext.getTenantId() returns undefined and Prisma skips injection.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const tenantId = (req as any).user?.tenant_id;
    const businessId = (req as any).user?.business_id;

    if (tenantId) {
      TenantContext.run({ tenantId, businessId }, () => next());
    } else {
      // No tenant context (public/webhook routes) — proceed normally
      next();
    }
  }
}
