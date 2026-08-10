import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RedisService } from '../../../common/services/redis.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

/**
 * Rate Limiting Guard for Reservation Creation
 * Prevents spam: Max 3 reservation attempts per minute per IP
 * 
 * @author HNLong
 * @since 2025-11-06
 */
@Injectable()
export class ReservationRateLimitGuard implements CanActivate {
  private readonly MAX_REQUESTS_PER_MINUTE = 3;
  private readonly WINDOW_SECONDS = 60;
  private readonly logger = new Logger(ReservationRateLimitGuard.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ipAddress = request.ip || request.socket.remoteAddress || 'unknown';
    
    // Rate limit key: rate_limit:reservation:create:{ip}
    const rateLimitKey = `rate_limit:reservation:create:${ipAddress}`;

    try {
      // If request contains an Authorization header with a valid admin token,
      // skip rate limiting for admin users so they can create many reservations.
      const authHeader = request.headers?.authorization || request.headers?.Authorization;
      if (authHeader && typeof authHeader === 'string') {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        try {
          const secret = this.configService.get<string>('JWT_SECRET', 'default-secret');
          const payload: any = jwt.verify(token, secret);
          // payload may contain roles or role or isAdmin flag
          if (
            payload && (
              (Array.isArray(payload.roles) && payload.roles.includes('ADMIN')) ||
              payload.role === 'ADMIN' ||
              payload.isAdmin === true
            )
          ) {
            this.logger.debug('Admin token detected - skipping reservation rate limit');
            return true;
          }
        } catch (e) {
          // token invalid - ignore and proceed with rate limit
          this.logger.debug('Failed to verify auth token for rate limit bypass:', (e as any)?.message || e);
        }
      }
      // Get current count
      const currentCount = await this.redisService.get<number>(rateLimitKey);

      if (currentCount && currentCount >= this.MAX_REQUESTS_PER_MINUTE) {
        const ttl = await this.redisService.getTtl(rateLimitKey);
        
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Bạn đã tạo quá nhiều reservation. Vui lòng thử lại sau ${ttl} giây`,
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Increment counter
      if (currentCount) {
        await this.redisService.set(
          rateLimitKey,
          currentCount + 1,
          this.WINDOW_SECONDS,
        );
      } else {
        // First request in window
        await this.redisService.set(
          rateLimitKey,
          1,
          this.WINDOW_SECONDS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // On Redis error, allow request to proceed (fail-open)
      return true;
    }
  }
}
