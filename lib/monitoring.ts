/**
 * Error monitoring and performance tracking
 * Integrates Sentry for error tracking
 */

import * as Sentry from '@sentry/nextjs';

interface MonitoringConfig {
  dsn?: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Initialize Sentry error monitoring
 */
export function initMonitoring() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('[Monitoring] Sentry DSN not configured');
    return;
  }

  const config: MonitoringConfig = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  };

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: config.tracesSampleRate,
    
    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
    
    // Performance monitoring
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/solosuccess\.ai/],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out known non-critical errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Filter out network errors that are expected
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        if (
          message.includes('Network request failed') ||
          message.includes('Failed to fetch') ||
          message.includes('Load failed')
        ) {
          return null;
        }
      }
      
      return event;
    },
    
    // Don't send errors in development
    enabled: process.env.NODE_ENV === 'production',
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, subscriptionTier?: string) {
  Sentry.setUser({
    id: userId,
    email,
    subscription_tier: subscriptionTier,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message with severity
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Measure performance of async operations
 */
export async function measurePerformance<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, 'function');
  
  try {
    const result = await operation();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * Track API response times
 */
export function trackApiPerformance(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
) {
  addBreadcrumb(
    `API ${method} ${endpoint}`,
    'api',
    statusCode >= 400 ? 'error' : 'info',
    {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
    }
  );
}

/**
 * Monitor critical business metrics
 */
export function trackBusinessMetric(metric: string, value: number, unit?: string) {
  Sentry.metrics.distribution(metric, value, {
    unit: unit || 'none',
    tags: {
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
