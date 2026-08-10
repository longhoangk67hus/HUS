import Redis from 'ioredis';

/**
 * Cache Service - Tương tự ICacheService trong C#
 * Wrapper cho Redis operations
 */
export class CacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_HOST || 'localhost:6379');

    this.redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value to cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (default: 1 hour)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      const expiryTime = ttl || this.defaultTTL;

      if (expiryTime > 0) {
        await this.redis.setex(key, expiryTime, data);
      } else {
        await this.redis.set(key, data);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set lock (for concurrency control)
   * @param key Lock key
   * @param ttl Lock duration in seconds
   * @returns true if lock acquired, false otherwise
   */
  async acquireLock(key: string, ttl: number = 10): Promise<boolean> {
    try {
      const result = await this.redis.set(key, '1', 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error(`Lock acquire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Release lock
   */
  async releaseLock(key: string): Promise<void> {
    await this.delete(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
