import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Admin Guard - Check if user has admin role
 * For now, simplified check - in real app would check database roles
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // For now, check if user exists and has admin privileges
    // In production, you should check user roles from database
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Simple admin check - can be enhanced with role-based access
    // For now, allow all authenticated users to act as admin (dev mode)
    // TODO: Implement proper role checking
    const isAdmin = true; // user.roles?.includes('admin') || user.email === 'admin@cinema.com'

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}