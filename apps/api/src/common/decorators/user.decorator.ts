import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User Decorator
 * Extracts user information from the authenticated user's JWT token
 *
 * @example
 * ```typescript
 * // Get entire user object
 * @Post()
 * async create(@User() user: JwtPayload) {
 *   return this.service.create(user);
 * }
 *
 * // Get specific field
 * @Post()
 * async create(@User('user_id') userId: string) {
 *   return this.service.create(userId);
 * }
 * ```
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return null;
    return data ? user?.[data] : user;
  },
);
