import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis Service for atomic seat locking operations
 * Provides SETNX, EXISTS, TTL, DEL commands for race-condition free seat reservations
 * 
 * @author HNLong
 * @since 2025-11-06
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis connection error:', error);
    });
  }

  /**
   * SETNX: Set if Not Exists (Atomic operation)
   * Returns true if key was set, false if key already exists
   * Used for acquiring seat locks without race conditions
   * 
   * @param key - Redis key (e.g., "seat_lock:1:123")
   * @param value - Value to store (can be object, will be JSON stringified)
   * @param ttlSeconds - Time to live in seconds
   * @returns true if lock acquired, false if already locked
   */
  async setIfNotExists<T = any>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<boolean> {
    try {
      const stringValue = JSON.stringify(value);
      
      // SET key value NX EX ttl
      // NX: Only set if key does not exist
      // EX: Set expiry time in seconds
      const result = await this.client.set(
        key,
        stringValue,
        'EX',
        ttlSeconds,
        'NX',
      );

      return result === 'OK';
    } catch (error) {
      this.logger.error(`Error in setIfNotExists for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get value from Redis
   * Returns parsed JSON object or null if not found
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error in get for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set value in Redis with TTL
   */
  async set<T = any>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, stringValue, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Error in set for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   * Returns true if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error in exists for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get TTL (Time To Live) of a key in seconds
   * Returns remaining seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async getTtl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error in getTtl for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete key from Redis
   * Returns number of keys deleted (0 or 1)
   */
  async delete(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error in delete for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple keys at once
   * Returns number of keys deleted
   */
  async deleteMany(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;
      return await this.client.del(...keys);
    } catch (error) {
      this.logger.error(`Error in deleteMany:`, error);
      throw error;
    }
  }

  /**
   * Get all keys matching a pattern
   * WARNING: Use carefully in production, can be slow with many keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Error in keys for pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Increment value atomically
   * Returns new value after increment
   */
  async increment(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error in increment for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set expiry on existing key
   * Returns true if timeout was set, false if key doesn't exist
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error in expire for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Flush all keys in current database
   * WARNING: Use only for testing/development
   */
  async flushDb(): Promise<void> {
    try {
      await this.client.flushdb();
      this.logger.warn('⚠️ Redis database flushed');
    } catch (error) {
      this.logger.error('Error in flushDb:', error);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Get native Redis client (for advanced operations)
   */
  getClient(): Redis {
    return this.client;
  }
}
