import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Suspicious activity tracking
const suspiciousActivityStore = new Map<
  string,
  { violations: number; lastViolation: number; blocked: boolean }
>();

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Only count failed requests
  bypassPremium?: boolean; // Allow premium users to bypass limits
}

/**
 * Rate limiting middleware
 * Limits requests per user/IP within a time window
 */
export function withRateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests default
    skipSuccessfulRequests = false,
    bypassPremium = false,
    keyGenerator = (req) => {
      // Use user ID if authenticated, otherwise use IP
      const userId = req.headers.get('x-user-id');
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      return userId || ip;
    },
  } = options;

  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const key = keyGenerator(request);
    const now = Date.now();

    // Check if IP/user is blocked due to suspicious activity
    const suspiciousEntry = suspiciousActivityStore.get(key);
    if (suspiciousEntry?.blocked) {
      const blockDuration = 60 * 60 * 1000; // 1 hour
      if (now - suspiciousEntry.lastViolation < blockDuration) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BLOCKED',
              message: 'Access temporarily blocked due to suspicious activity',
            },
          },
          { status: 403 }
        );
      } else {
        // Unblock after duration
        suspiciousActivityStore.delete(key);
      }
    }

    // Check for premium bypass
    if (bypassPremium) {
      const subscriptionTier = request.headers.get('x-subscription-tier');
      if (subscriptionTier === 'premium') {
        return handler(request);
      }
    }

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    // Reset if window has passed
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      // Track suspicious activity
      trackSuspiciousActivity(key);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            details: {
              retryAfter,
            },
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      );
    }

    // Call handler and add rate limit headers
    const response = await handler(request);

    // Only count if not skipping successful requests
    if (skipSuccessfulRequests && response.status < 400) {
      entry.count--;
    }

    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

    return response;
  };
}

/**
 * Per-user rate limiting with subscription tier support
 */
export function withUserRateLimit(options: {
  free?: number;
  accelerator?: number;
  premium?: number;
  windowMs?: number;
} = {}) {
  const {
    free = 100,
    accelerator = 500,
    premium = -1, // Unlimited
    windowMs = 15 * 60 * 1000,
  } = options;

  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const subscriptionTier = request.headers.get('x-subscription-tier') || 'free';
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return handler(request);
    }

    // Determine max requests based on tier
    let maxRequests: number;
    switch (subscriptionTier) {
      case 'premium':
        if (premium === -1) return handler(request); // Unlimited
        maxRequests = premium;
        break;
      case 'accelerator':
        maxRequests = accelerator;
        break;
      default:
        maxRequests = free;
    }

    // Apply rate limit
    return withRateLimit({
      windowMs,
      maxRequests,
      keyGenerator: () => `user:${userId}`,
    })(request, handler);
  };
}

/**
 * IP-based rate limiting
 * More aggressive limits for unauthenticated requests
 */
export function withIpRateLimit(options: {
  maxRequests?: number;
  windowMs?: number;
} = {}) {
  const { maxRequests = 50, windowMs = 15 * 60 * 1000 } = options;

  return withRateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (req) => {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';
      return `ip:${ip}`;
    },
  });
}

/**
 * Track suspicious activity
 */
function trackSuspiciousActivity(key: string): void {
  const now = Date.now();
  let entry = suspiciousActivityStore.get(key);

  if (!entry) {
    entry = { violations: 0, lastViolation: now, blocked: false };
    suspiciousActivityStore.set(key, entry);
  }

  entry.violations++;
  entry.lastViolation = now;

  // Block after 5 violations within 1 hour
  if (entry.violations >= 5) {
    entry.blocked = true;
    console.warn(`Blocked suspicious activity from: ${key}`);
  }
}

/**
 * Get rate limit monitoring data
 */
export function getRateLimitStats(): {
  totalKeys: number;
  suspiciousActivities: number;
  blockedKeys: number;
} {
  let blockedKeys = 0;
  for (const entry of suspiciousActivityStore.values()) {
    if (entry.blocked) blockedKeys++;
  }

  return {
    totalKeys: rateLimitStore.size,
    suspiciousActivities: suspiciousActivityStore.size,
    blockedKeys,
  };
}

/**
 * Cleanup old entries from rate limit store
 * Should be called periodically
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();

  // Cleanup rate limit store
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // Cleanup suspicious activity store
  const oneHour = 60 * 60 * 1000;
  for (const [key, entry] of suspiciousActivityStore.entries()) {
    if (now - entry.lastViolation > oneHour && !entry.blocked) {
      suspiciousActivityStore.delete(key);
    }
  }
}

/**
 * Clear rate limit for a specific key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
  suspiciousActivityStore.delete(key);
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
