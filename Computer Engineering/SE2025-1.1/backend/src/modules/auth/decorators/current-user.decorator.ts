import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../dto';

/**
 * Current User decorator
 * Get authenticated user from request
 * Example: getCurrentUser(@CurrentUser() user: JwtPayload)
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
