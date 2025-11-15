import { prisma } from '@/lib/prisma';

export enum SecurityEventType {
  WEBHOOK_SIGNATURE_FAILED = 'webhook_signature_failed',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  TOKEN_THEFT_ATTEMPT = 'token_theft_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_OAUTH_FLOW = 'suspicious_oauth_flow',
  INVALID_CRON_SECRET = 'invalid_cron_secret',
  TOKEN_REFRESH_FAILED = 'token_refresh_failed',
  INVALID_JWT = 'invalid_jwt',
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityEventDetails {
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
}

/**
 * Service for logging security events
 */
export class SecurityEventService {
  /**
   * Log a security event
   */
  static async logEvent(
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    eventDetails: SecurityEventDetails
  ): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          type,
          severity,
          userId: eventDetails.userId,
          ip: eventDetails.ip,
          userAgent: eventDetails.userAgent,
          resource: eventDetails.resource,
          action: eventDetails.action,
          details: eventDetails.details || {},
          timestamp: new Date(),
        },
      });

      // Log to console for immediate visibility
      console.warn(`[SECURITY EVENT] ${severity.toUpperCase()}: ${type}`, {
        ...eventDetails,
        timestamp: new Date().toISOString(),
      });

      // For critical events, you might want to send alerts
      if (severity === SecurityEventSeverity.CRITICAL) {
        // TODO: Integrate with alerting system (e.g., PagerDuty, Slack)
        console.error(`[CRITICAL SECURITY EVENT] ${type}`, eventDetails);
      }
    } catch (error) {
      // Don't throw - security logging should not break the application
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log failed webhook signature verification
   */
  static async logWebhookSignatureFailed(
    ip: string,
    userAgent: string | null,
    eventType: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.WEBHOOK_SIGNATURE_FAILED,
      SecurityEventSeverity.HIGH,
      {
        ip,
        userAgent: userAgent || undefined,
        resource: 'webhook',
        action: 'signature_verification',
        details: {
          eventType,
          ...details,
        },
      }
    );
  }

  /**
   * Log invalid cron secret attempt
   */
  static async logInvalidCronSecret(
    ip: string,
    userAgent: string | null,
    endpoint: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.INVALID_CRON_SECRET,
      SecurityEventSeverity.HIGH,
      {
        ip,
        userAgent: userAgent || undefined,
        resource: 'cron',
        action: 'authentication',
        details: {
          endpoint,
          ...details,
        },
      }
    );
  }

  /**
   * Log token refresh failure
   */
  static async logTokenRefreshFailed(
    userId: string,
    reason: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.TOKEN_REFRESH_FAILED,
      SecurityEventSeverity.MEDIUM,
      {
        userId,
        resource: 'intel_academy_integration',
        action: 'token_refresh',
        details: {
          reason,
          ...details,
        },
      }
    );
  }

  /**
   * Log suspicious OAuth flow
   */
  static async logSuspiciousOAuthFlow(
    userId: string | undefined,
    ip: string,
    userAgent: string | null,
    reason: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.SUSPICIOUS_OAUTH_FLOW,
      SecurityEventSeverity.HIGH,
      {
        userId,
        ip,
        userAgent: userAgent || undefined,
        resource: 'oauth',
        action: 'authorization',
        details: {
          reason,
          ...details,
        },
      }
    );
  }

  /**
   * Log rate limit exceeded
   */
  static async logRateLimitExceeded(
    userId: string,
    resource: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventSeverity.MEDIUM,
      {
        userId,
        resource,
        action: 'api_call',
        details,
      }
    );
  }

  /**
   * Log unauthorized access attempt
   */
  static async logUnauthorizedAccess(
    userId: string | undefined,
    ip: string,
    userAgent: string | null,
    resource: string,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventSeverity.HIGH,
      {
        userId,
        ip,
        userAgent: userAgent || undefined,
        resource,
        action,
        details,
      }
    );
  }

  /**
   * Get recent security events for monitoring
   */
  static async getRecentEvents(
    limit: number = 100,
    severity?: SecurityEventSeverity
  ): Promise<any[]> {
    return prisma.securityEvent.findMany({
      where: severity ? { severity } : undefined,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get security events by type
   */
  static async getEventsByType(
    type: SecurityEventType,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return prisma.securityEvent.findMany({
      where: {
        type,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get security events by user
   */
  static async getEventsByUser(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    return prisma.securityEvent.findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get security events by IP address
   */
  static async getEventsByIP(
    ip: string,
    limit: number = 50
  ): Promise<any[]> {
    return prisma.securityEvent.findMany({
      where: {
        ip,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Check for suspicious patterns (e.g., multiple failed attempts from same IP)
   */
  static async checkSuspiciousPatterns(
    ip: string,
    timeWindowMinutes: number = 60
  ): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const recentEvents = await prisma.securityEvent.count({
      where: {
        ip,
        timestamp: {
          gte: cutoffTime,
        },
        severity: {
          in: [SecurityEventSeverity.HIGH, SecurityEventSeverity.CRITICAL],
        },
      },
    });

    // If more than 5 high/critical events in the time window, flag as suspicious
    return recentEvents > 5;
  }
}
