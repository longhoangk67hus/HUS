/**
 * Base-Core Library - Barrel Export
 * Complete CRUD library with TypeORM, Redis cache, JWT authentication
 */

// Entities
export * from './entities/base.entity';

// DTOs
export * from './dto/service-response.dto';

// Repository
export * from './repository/base.repository';

// Service
export * from './service/base.service';

// Cache
export * from './cache/cache.service';

// Auth (coming soon)
// export * from './auth/auth.service';
// export * from './auth/jwt.strategy';
