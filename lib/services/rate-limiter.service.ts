import { SecurityEventService } from './security-event.service';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitInfo {
  count: number;
  resetAt: number;
  queue: Array<() => Promise<any>>;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Service for rate limiting API requests
 */
export class RateLimiterService {
  private static limits = new Map<string, RateLimitInfo>();
  private static processing = new Map<string, boolean>();

  /**
   * Check if request is within rate limit
   */
  static checkLimit(
    key: string,
    config: RateLimitConfig
  ): RateLimitResult {
    const now = Date.now();
    const limitInfo = this.limits.get(key);

    // Initialize or reset if window expired
    if (!limitInfo || now > limitInfo.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
        queue: [],
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Check if within limit
    if (limitInfo.count < config.maxRequests) {
      limitInfo.count++;
      return {
        allowed: true,
        remaining: config.maxRequests - limitInfo.count,
        resetAt: limitInfo.resetAt,
      };
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((limitInfo.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: limitInfo.resetAt,
      retryAfter,
    };
  }

  /**
   * Execute request with rate limiting and automatic queueing
   */
  static async executeWithLimit<T>(
    key: string,
    config: RateLimitConfig,
    fn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const limitResult = this.checkLimit(key, config);

    if (limitResult.allowed) {
      return fn();
    }

    // Rate limit exceeded - queue the request
    if (userId) {
      await SecurityEventService.logRateLimitExceeded(
        userId,
        'intel_academy_api',
        {
          key,
          retryAfter: limitResult.retryAfter,
        }
      );
    }

    console.log(`Rate limit exceeded for ${key}, queueing request`);

    // Add to queue and wait
    return new Promise<T>((resolve, reject) => {
      const limitInfo = this.limits.get(key);
      if (!limitInfo) {
        reject(new Error('Rate limit info not found'));
        return;
      }

      limitInfo.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Start processing queue if not already processing
      this.processQueue(key, config);
    });
  }

  /**
   * Process queued requests when rate limit resets
   */
  private static async processQueue(
    key: string,
    config: RateLimitConfig
  ): Promise<void> {
    // Prevent multiple queue processors
    if (this.processing.get(key)) {
      return;
    }

    this.processing.set(key, true);

    const limitInfo = this.limits.get(key);
    if (!limitInfo) {
      this.processing.set(key, false);
      return;
    }

    // Wait until rate limit resets
    const now = Date.now();
    const waitTime = Math.max(0, limitInfo.resetAt - now);
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Process queued requests
    while (limitInfo.queue.length > 0) {
      const limitResult = this.checkLimit(key, config);
      
      if (!limitResult.allowed) {
        // Wait for next window
        const waitTime = Math.max(0, limitResult.resetAt - Date.now());
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      const request = limitInfo.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Error processing queued request:', error);
        }
      }
    }

    this.processing.set(key, false);
  }

  /**
   * Get rate limit headers for HTTP responses
   */
  static getRateLimitHeaders(
    key: string,
    config: RateLimitConfig
  ): Record<string, string> {
    const limitResult = this.checkLimit(key, config);

    return {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': limitResult.remaining.toString(),
      'X-RateLimit-Reset': new Date(limitResult.resetAt).toISOString(),
      ...(limitResult.retryAfter && {
        'Retry-After': limitResult.retryAfter.toString(),
      }),
    };
  }

  /**
   * Clear rate limit for a key (useful for testing)
   */
  static clearLimit(key: string): void {
    this.limits.delete(key);
    this.processing.delete(key);
  }

  /**
   * Clear all rate limits
   */
  static clearAll(): void {
    this.limits.clear();
    this.processing.clear();
  }

  /**
   * Get current rate limit status
   */
  static getStatus(key: string): {
    count: number;
    resetAt: number;
    queueLength: number;
  } | null {
    const limitInfo = this.limits.get(key);
    if (!limitInfo) {
      return null;
    }

    return {
      count: limitInfo.count,
      resetAt: limitInfo.resetAt,
      queueLength: limitInfo.queue.length,
    };
  }
}
