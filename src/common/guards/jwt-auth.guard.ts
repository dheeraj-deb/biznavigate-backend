import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * JWT Auth Guard (Mock Implementation)
 *
 * ⚠️ THIS IS A TEMPORARY MOCK GUARD FOR DEVELOPMENT
 *
 * In production, replace this with proper JWT authentication:
 * 1. Install: npm install @nestjs/jwt @nestjs/passport passport passport-jwt
 * 2. Create JwtStrategy extending PassportStrategy
 * 3. Replace this guard with: @UseGuards(AuthGuard('jwt'))
 *
 * Current behavior: Injects a mock user for testing purposes
 *
 * @example Production implementation:
 * ```typescript
 * import { AuthGuard } from '@nestjs/passport';
 *
 * @Controller('leads')
 * @UseGuards(AuthGuard('jwt'), TenantGuard)
 * export class LeadController { ... }
 * ```
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // TODO: Replace this mock implementation with real JWT validation
    // For now, we'll inject a mock user for development/testing

    // Check if Authorization header exists
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // For development: Inject mock user
      // In production: throw UnauthorizedException
      request.user = {
        user_id: '00000000-0000-0000-0000-000000000001',
        tenant_id: '00000000-0000-0000-0000-000000000001',
        business_id: '00000000-0000-0000-0000-000000000001',
        role_id: '00000000-0000-0000-0000-000000000001',
        email: 'dev@example.com',
        name: 'Development User',
      };
      return true;
    }

    // Basic token extraction (replace with proper JWT validation)
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    // Mock user - replace with JWT decode logic
    request.user = {
      user_id: '00000000-0000-0000-0000-000000000001',
      tenant_id: '00000000-0000-0000-0000-000000000001',
      business_id: '00000000-0000-0000-0000-000000000001',
      role_id: '00000000-0000-0000-0000-000000000001',
      email: 'dev@example.com',
      name: 'Development User',
    };

    return true;
  }
}

/**
 * JWT Payload Interface
 * Define the structure of the decoded JWT token
 */
export interface JwtPayload {
  user_id: string;
  tenant_id: string;
  business_id: string;
  role_id: string;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}
