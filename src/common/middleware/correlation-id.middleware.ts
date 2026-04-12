import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TenantContext } from '../../prisma/tenant-context';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * CorrelationIdMiddleware — generates or propagates a correlation ID for every request.
 * Stored in TenantContext (AsyncLocalStorage) so all log entries automatically include it.
 * The ID is echoed back in the response header.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers[CORRELATION_ID_HEADER] as string) || uuidv4();

    // Attach to response so clients can trace requests
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    // Store in TenantContext if it already has a store; otherwise just attach to req
    TenantContext.setCorrelationId(correlationId);
    (req as any).correlationId = correlationId;

    next();
  }
}
