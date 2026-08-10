import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator
 * Mark routes with required roles
 * Example: @Roles('ADMIN', 'USER')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
