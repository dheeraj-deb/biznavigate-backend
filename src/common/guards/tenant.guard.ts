import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Tenant Guard
 * Ensures that every request has a valid tenant_id from the authenticated user
 * This guard should be used after JwtAuthGuard to enforce multi-tenancy
 *
 * @example
 * ```typescript
 * @Controller('leads')
 * @UseGuards(JwtAuthGuard, TenantGuard)
 * export class LeadController { ... }
 * ```
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenant_id;

    if (!tenantId) {
      throw new UnauthorizedException(
        'Tenant ID not found. Please ensure you are authenticated.',
      );
    }

    // Inject tenant_id into request for easy access in services
    request.tenantId = tenantId;
    return true;
  }
}
