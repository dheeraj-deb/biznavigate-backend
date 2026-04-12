import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User Decorator
 * Extracts user information from the authenticated user's JWT token.
 *
 * @example
 * ```typescript
 * // Get entire user object
 * @Get()
 * async findAll(@User() user: JwtPayload) {}
 *
 * // Get specific field
 * @Get()
 * async findAll(@User('user_id') userId: string) {}
 * ```
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
