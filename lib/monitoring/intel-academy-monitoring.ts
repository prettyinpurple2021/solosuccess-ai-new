/**
 * Intel Academy Integration Monitoring
 * Tracks metrics, errors, and performance for the Intel Academy integration
 */

import * as Sentry from '@sentry/nextjs';
import { captureException, addBreadcrumb, trackBusinessMetric } from '../monitoring';

/**
 * Integration event types for monitoring
 */
export enum IntegrationEventType {
  // Connection Events
  CONNECTION_INITIATED = 'intel_academy.connection.initiated',
  CONNECTION_SUCCESS = 'intel_academy.connection.success',
  CONNECTION_FAILED = 'intel_academy.connection.failed',
  DISCONNECTION = 'intel_academy.disconnection',
  
  // Token Events
  TOKEN_REFRESH_SUCCESS = 'intel_academy.token.refresh.success',
  TOKEN_REFRESH_FAILED = 'intel_academy.token.refresh.failed',
  TOKEN_EXPIRED = 'intel_academy.token.expired',
  
  // Sync Events
  SYNC_INITIATED = 'intel_academy.sync.initiated',
  SYNC_SUCCESS = 'intel_academy.sync.success',
  SYNC_FAILED = 'intel_academy.sync.failed',
  
  // Webhook Events
  WEBHOOK_RECEIVED = 'intel_academy.webhook.received',
  WEBHOOK_PROCESSED = 'intel_academy.webhook.processed',
  WEBHOOK_FAILED = 'intel_academy.webhook.failed',
  WEBHOOK_SIGNATURE_INVALID = 'intel_academy.webhook.signature_invalid',
  
  // SSO Events
  SSO_REDIRECT = 'intel_academy.sso.redirect',
  SSO_TOKEN_GENERATED = 'intel_academy.sso.token_generated',
  
  // API Events
  API_CALL_SUCCESS = 'intel_academy.api.success',
  API_CALL_FAILED = 'intel_academy.api.failed',
  API_RATE_LIMITED = 'intel_academy.api.rate_limited',
  
  // Security Events
  SECURITY_SIGNATURE_FAILED = 'intel_academy.security.signature_failed',
  SECURITY_UNAUTHORIZED_ACCESS = 'intel_academy.security.unauthorized',
  SECURITY_SUSPICIOUS_ACTIVITY = 'intel_academy.security.suspicious',
}

/**
 * Track integration event
 */
export function trackIntegrationEvent(
  eventType: IntegrationEventType,
  userId?: string,
  metadata?: Record<string, any>
) {
  // Add breadcrumb for debugging
  addBreadcrumb(
    eventType,
    'intel_academy',
    eventType.includes('failed') || eventType.includes('invalid') ? 'error' : 'info',
    {
      user_id: userId,
      ...metadata,
    }
  );
  
  // Track as custom metric
  trackBusinessMetric(eventType, 1, 'event');
  
  // Set user context if provided
  if (userId) {
    Sentry.setTag('intel_academy_user', userId);
  }
}

/**
 * Track OAuth connection attempt
 */
export function trackConnectionAttempt(userId: string, success: boolean, error?: Error) {
  if (success) {
    trackIntegrationEvent(IntegrationEventType.CONNECTION_SUCCESS, userId);
    trackBusinessMetric('intel_academy.connection.success_rate', 1);
  } else {
    trackIntegrationEvent(IntegrationEventType.CONNECTION_FAILED, userId, {
      error: error?.message,
    });
    trackBusinessMetric('intel_academy.connection.failure_rate', 1);
    
    if (error) {
      captureException(error, {
        user_id: userId,
        integration: 'intel_academy',
        operation: 'oauth_connection',
      });
    }
  }
}

/**
 * Track token refresh
 */
export function trackTokenRefresh(userId: string, success: boolean, error?: Error) {
  if (success) {
    trackIntegrationEvent(IntegrationEventType.TOKEN_REFRESH_SUCCESS, userId);
  } else {
    trackIntegrationEvent(IntegrationEventType.TOKEN_REFRESH_FAILED, userId, {
      error: error?.message,
    });
    
    if (error) {
      captureException(error, {
        user_id: userId,
        integration: 'intel_academy',
        operation: 'token_refresh',
      });
    }
  }
}

/**
 * Track subscription sync
 */
export function trackSubscriptionSync(
  userId: string,
  tier: string,
  success: boolean,
  duration: number,
  error?: Error
) {
  if (success) {
    trackIntegrationEvent(IntegrationEventType.SYNC_SUCCESS, userId, {
      tier,
      duration_ms: duration,
    });
    trackBusinessMetric('intel_academy.sync.duration', duration, 'millisecond');
    trackBusinessMetric('intel_academy.sync.success_rate', 1);
  } else {
    trackIntegrationEvent(IntegrationEventType.SYNC_FAILED, userId, {
      tier,
      error: error?.message,
    });
    trackBusinessMetric('intel_academy.sync.failure_rate', 1);
    
    if (error) {
      captureException(error, {
        user_id: userId,
        tier,
        integration: 'intel_academy',
        operation: 'subscription_sync',
      });
    }
  }
}

/**
 * Track webhook processing
 */
export function trackWebhookProcessing(
  eventType: string,
  eventId: string,
  success: boolean,
  duration: number,
  retryCount: number = 0,
  error?: Error
) {
  if (success) {
    trackIntegrationEvent(IntegrationEventType.WEBHOOK_PROCESSED, undefined, {
      event_type: eventType,
      event_id: eventId,
      duration_ms: duration,
      retry_count: retryCount,
    });
    trackBusinessMetric('intel_academy.webhook.processing_time', duration, 'millisecond');
    trackBusinessMetric('intel_academy.webhook.success_rate', 1);
  } else {
    trackIntegrationEvent(IntegrationEventType.WEBHOOK_FAILED, undefined, {
      event_type: eventType,
      event_id: eventId,
      retry_count: retryCount,
      error: error?.message,
    });
    trackBusinessMetric('intel_academy.webhook.failure_rate', 1);
    
    if (error) {
      captureException(error, {
        event_type: eventType,
        event_id: eventId,
        retry_count: retryCount,
        integration: 'intel_academy',
        operation: 'webhook_processing',
      });
    }
  }
}

/**
 * Track webhook signature verification failure
 */
export function trackSignatureVerificationFailure(
  sourceIp: string,
  eventType?: string
) {
  trackIntegrationEvent(IntegrationEventType.WEBHOOK_SIGNATURE_INVALID, undefined, {
    source_ip: sourceIp,
    event_type: eventType,
  });
  
  // This is a security event - capture with high severity
  Sentry.captureMessage(
    `Intel Academy webhook signature verification failed from IP: ${sourceIp}`,
    'warning'
  );
  
  trackBusinessMetric('intel_academy.security.signature_failures', 1);
}

/**
 * Track API call performance
 */
export function trackApiCall(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  const success = statusCode >= 200 && statusCode < 300;
  const rateLimited = statusCode === 429;
  
  if (success) {
    trackIntegrationEvent(IntegrationEventType.API_CALL_SUCCESS, userId, {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
    });
  } else if (rateLimited) {
    trackIntegrationEvent(IntegrationEventType.API_RATE_LIMITED, userId, {
      endpoint,
      method,
    });
    trackBusinessMetric('intel_academy.api.rate_limit_hits', 1);
  } else {
    trackIntegrationEvent(IntegrationEventType.API_CALL_FAILED, userId, {
      endpoint,
      method,
      status_code: statusCode,
    });
  }
  
  trackBusinessMetric('intel_academy.api.response_time', duration, 'millisecond');
  trackBusinessMetric(`intel_academy.api.status.${statusCode}`, 1);
}

/**
 * Track SSO redirect
 */
export function trackSsoRedirect(userId: string, success: boolean, error?: Error) {
  if (success) {
    trackIntegrationEvent(IntegrationEventType.SSO_REDIRECT, userId);
    trackBusinessMetric('intel_academy.sso.redirects', 1);
  } else if (error) {
    captureException(error, {
      user_id: userId,
      integration: 'intel_academy',
      operation: 'sso_redirect',
    });
  }
}

/**
 * Track security event
 */
export function trackSecurityEvent(
  eventType: 'signature_failed' | 'unauthorized' | 'suspicious',
  details: {
    sourceIp?: string;
    userId?: string;
    endpoint?: string;
    reason?: string;
  }
) {
  const eventMap = {
    signature_failed: IntegrationEventType.SECURITY_SIGNATURE_FAILED,
    unauthorized: IntegrationEventType.SECURITY_UNAUTHORIZED_ACCESS,
    suspicious: IntegrationEventType.SECURITY_SUSPICIOUS_ACTIVITY,
  };
  
  trackIntegrationEvent(eventMap[eventType], details.userId, details);
  
  // Capture as Sentry message with appropriate severity
  const severity = eventType === 'suspicious' ? 'warning' : 'error';
  Sentry.captureMessage(
    `Intel Academy security event: ${eventType}`,
    severity
  );
  
  trackBusinessMetric(`intel_academy.security.${eventType}`, 1);
}

/**
 * Create performance transaction for monitoring
 */
export function createPerformanceTransaction(
  name: string,
  operation: string,
  userId?: string
) {
  const transaction = Sentry.startTransaction({
    name: `intel_academy.${name}`,
    op: operation,
    tags: {
      integration: 'intel_academy',
      user_id: userId,
    },
  });
  
  return transaction;
}

/**
 * Monitor async operation with automatic error tracking
 */
export async function monitorOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  userId?: string,
  onError?: (error: Error) => void
): Promise<T> {
  const transaction = createPerformanceTransaction(operationName, 'function', userId);
  const startTime = Date.now();
  
  try {
    const result = await operation();
    transaction.setStatus('ok');
    
    const duration = Date.now() - startTime;
    trackBusinessMetric(`intel_academy.${operationName}.duration`, duration, 'millisecond');
    
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    
    const duration = Date.now() - startTime;
    trackBusinessMetric(`intel_academy.${operationName}.error`, 1);
    
    if (error instanceof Error) {
      captureException(error, {
        operation: operationName,
        user_id: userId,
        integration: 'intel_academy',
        duration_ms: duration,
      });
      
      if (onError) {
        onError(error);
      }
    }
    
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * Get current integration metrics
 */
export interface IntegrationMetrics {
  activeIntegrations: number;
  connectionSuccessRate: number;
  syncSuccessRate: number;
  webhookProcessingSuccessRate: number;
  apiErrorRate: number;
  averageApiResponseTime: number;
  pendingWebhookCount: number;
  rateLimitHitsToday: number;
}

/**
 * Alert thresholds for monitoring
 */
export const ALERT_THRESHOLDS = {
  CONNECTION_FAILURE_RATE: 0.1, // 10%
  SYNC_FAILURE_RATE: 0.2, // 20%
  WEBHOOK_PROCESSING_DELAY: 300000, // 5 minutes in ms
  API_ERROR_RATE: 0.05, // 5%
  RATE_LIMIT_HITS_PER_HOUR: 10,
  TOKEN_REFRESH_FAILURE_RATE: 0.15, // 15%
  SIGNATURE_FAILURES_PER_HOUR: 5,
};

/**
 * Check if alert threshold is exceeded
 */
export function checkAlertThreshold(
  metric: keyof typeof ALERT_THRESHOLDS,
  value: number
): boolean {
  const threshold = ALERT_THRESHOLDS[metric];
  return value >= threshold;
}

/**
 * Send alert to monitoring system
 */
export function sendAlert(
  alertType: string,
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  metadata?: Record<string, any>
) {
  // Capture as Sentry issue
  const sentryLevel = severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warning';
  
  Sentry.captureMessage(
    `[Intel Academy Alert] ${alertType}: ${message}`,
    sentryLevel
  );
  
  // Add context
  Sentry.setContext('alert', {
    type: alertType,
    severity,
    integration: 'intel_academy',
    ...metadata,
  });
  
  // Track alert metric
  trackBusinessMetric(`intel_academy.alerts.${alertType}`, 1);
}
