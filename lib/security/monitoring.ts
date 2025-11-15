/**
 * Security monitoring and logging utilities
 * Tracks security events and suspicious activities
 */

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_VERIFICATION_FAILURE = 'mfa_verification_failure',

  // Authorization events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_DENIED = 'permission_denied',
  SUBSCRIPTION_REQUIRED = 'subscription_required',

  // Rate limiting events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY_DETECTED = 'suspicious_activity_detected',
  IP_BLOCKED = 'ip_blocked',

  // Data access events
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  DATA_DELETION = 'data_deletion',

  // Security violations
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  CSRF_VIOLATION = 'csrf_violation',
  INVALID_TOKEN = 'invalid_token',

  // System events
  ENCRYPTION_ERROR = 'encryption_error',
  DECRYPTION_ERROR = 'decryption_error',
  SECURITY_CONFIGURATION_CHANGE = 'security_configuration_change',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: Date;
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

// In-memory store for security events (use database in production)
const securityEventStore: SecurityEvent[] = [];
const MAX_EVENTS = 10000;

/**
 * Log security event
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };

  // Add to store
  securityEventStore.push(fullEvent);

  // Trim if exceeds max
  if (securityEventStore.length > MAX_EVENTS) {
    securityEventStore.shift();
  }

  // Log to console (in production, send to logging service)
  const logLevel = getLogLevel(event.severity);
  console[logLevel]('Security Event:', {
    type: event.type,
    severity: event.severity,
    userId: event.userId,
    ip: event.ip,
    resource: event.resource,
    details: event.details,
  });

  // Send alerts for critical events
  if (event.severity === SecurityEventSeverity.CRITICAL) {
    sendSecurityAlert(fullEvent);
  }

  // Track suspicious patterns
  if (shouldTrackPattern(event.type)) {
    trackSuspiciousPattern(fullEvent);
  }
}

/**
 * Get log level based on severity
 */
function getLogLevel(severity: SecurityEventSeverity): 'log' | 'warn' | 'error' {
  switch (severity) {
    case SecurityEventSeverity.CRITICAL:
    case SecurityEventSeverity.HIGH:
      return 'error';
    case SecurityEventSeverity.MEDIUM:
      return 'warn';
    default:
      return 'log';
  }
}

/**
 * Check if event type should be tracked for patterns
 */
function shouldTrackPattern(type: SecurityEventType): boolean {
  const trackableTypes = [
    SecurityEventType.LOGIN_FAILURE,
    SecurityEventType.UNAUTHORIZED_ACCESS,
    SecurityEventType.RATE_LIMIT_EXCEEDED,
    SecurityEventType.XSS_ATTEMPT,
    SecurityEventType.SQL_INJECTION_ATTEMPT,
  ];
  return trackableTypes.includes(type);
}

/**
 * Track suspicious patterns
 */
const suspiciousPatternStore = new Map<
  string,
  { count: number; firstSeen: Date; lastSeen: Date }
>();

function trackSuspiciousPattern(event: SecurityEvent): void {
  const key = `${event.type}:${event.userId || event.ip}`;
  const existing = suspiciousPatternStore.get(key);

  if (existing) {
    existing.count++;
    existing.lastSeen = event.timestamp;

    // Alert if pattern exceeds threshold
    if (existing.count >= 5) {
      logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY_DETECTED,
        severity: SecurityEventSeverity.HIGH,
        userId: event.userId,
        ip: event.ip,
        details: {
          pattern: event.type,
          occurrences: existing.count,
          timespan: event.timestamp.getTime() - existing.firstSeen.getTime(),
        },
      });
    }
  } else {
    suspiciousPatternStore.set(key, {
      count: 1,
      firstSeen: event.timestamp,
      lastSeen: event.timestamp,
    });
  }
}

/**
 * Send security alert
 */
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  // In production, send to alerting service (PagerDuty, Slack, etc.)
  console.error('🚨 CRITICAL SECURITY ALERT:', {
    type: event.type,
    userId: event.userId,
    ip: event.ip,
    timestamp: event.timestamp,
    details: event.details,
  });

  // TODO: Integrate with alerting service
  // await sendSlackAlert(event);
  // await sendPagerDutyAlert(event);
}

/**
 * Get security events
 */
export function getSecurityEvents(filters?: {
  type?: SecurityEventType;
  severity?: SecurityEventSeverity;
  userId?: string;
  ip?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): SecurityEvent[] {
  let events = [...securityEventStore];

  if (filters) {
    if (filters.type) {
      events = events.filter((e) => e.type === filters.type);
    }
    if (filters.severity) {
      events = events.filter((e) => e.severity === filters.severity);
    }
    if (filters.userId) {
      events = events.filter((e) => e.userId === filters.userId);
    }
    if (filters.ip) {
      events = events.filter((e) => e.ip === filters.ip);
    }
    if (filters.startDate) {
      events = events.filter((e) => e.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      events = events.filter((e) => e.timestamp <= filters.endDate!);
    }
  }

  // Sort by timestamp descending
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  if (filters?.limit) {
    events = events.slice(0, filters.limit);
  }

  return events;
}

/**
 * Get security statistics
 */
export function getSecurityStats(): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  suspiciousPatterns: number;
  recentCriticalEvents: number;
} {
  const stats = {
    totalEvents: securityEventStore.length,
    eventsByType: {} as Record<string, number>,
    eventsBySeverity: {} as Record<string, number>,
    suspiciousPatterns: suspiciousPatternStore.size,
    recentCriticalEvents: 0,
  };

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const event of securityEventStore) {
    // Count by type
    stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;

    // Count by severity
    stats.eventsBySeverity[event.severity] =
      (stats.eventsBySeverity[event.severity] || 0) + 1;

    // Count recent critical events
    if (
      event.severity === SecurityEventSeverity.CRITICAL &&
      event.timestamp >= oneHourAgo
    ) {
      stats.recentCriticalEvents++;
    }
  }

  return stats;
}

/**
 * Clear old security events
 */
export function clearOldSecurityEvents(olderThan: Date): number {
  const initialLength = securityEventStore.length;
  const filtered = securityEventStore.filter((e) => e.timestamp >= olderThan);
  securityEventStore.length = 0;
  securityEventStore.push(...filtered);
  return initialLength - securityEventStore.length;
}

/**
 * Detect anomalies in security events
 */
export function detectAnomalies(): {
  anomalies: Array<{
    type: string;
    description: string;
    severity: SecurityEventSeverity;
    details: any;
  }>;
} {
  const anomalies: Array<{
    type: string;
    description: string;
    severity: SecurityEventSeverity;
    details: any;
  }> = [];

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentEvents = securityEventStore.filter((e) => e.timestamp >= oneHourAgo);

  // Check for excessive login failures
  const loginFailures = recentEvents.filter(
    (e) => e.type === SecurityEventType.LOGIN_FAILURE
  );
  if (loginFailures.length > 10) {
    anomalies.push({
      type: 'excessive_login_failures',
      description: `${loginFailures.length} login failures in the last hour`,
      severity: SecurityEventSeverity.HIGH,
      details: { count: loginFailures.length },
    });
  }

  // Check for multiple IPs for same user
  const userIpMap = new Map<string, Set<string>>();
  for (const event of recentEvents) {
    if (event.userId && event.ip) {
      if (!userIpMap.has(event.userId)) {
        userIpMap.set(event.userId, new Set());
      }
      userIpMap.get(event.userId)!.add(event.ip);
    }
  }

  for (const [userId, ips] of userIpMap.entries()) {
    if (ips.size > 3) {
      anomalies.push({
        type: 'multiple_ips_per_user',
        description: `User ${userId} accessed from ${ips.size} different IPs`,
        severity: SecurityEventSeverity.MEDIUM,
        details: { userId, ipCount: ips.size },
      });
    }
  }

  // Check for rate limit violations
  const rateLimitViolations = recentEvents.filter(
    (e) => e.type === SecurityEventType.RATE_LIMIT_EXCEEDED
  );
  if (rateLimitViolations.length > 20) {
    anomalies.push({
      type: 'excessive_rate_limit_violations',
      description: `${rateLimitViolations.length} rate limit violations in the last hour`,
      severity: SecurityEventSeverity.HIGH,
      details: { count: rateLimitViolations.length },
    });
  }

  return { anomalies };
}

/**
 * Export security events for analysis
 */
export function exportSecurityEvents(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(securityEventStore, null, 2);
  }

  // CSV format
  const headers = [
    'timestamp',
    'type',
    'severity',
    'userId',
    'ip',
    'resource',
    'details',
  ];
  const rows = securityEventStore.map((e) => [
    e.timestamp.toISOString(),
    e.type,
    e.severity,
    e.userId || '',
    e.ip || '',
    e.resource || '',
    JSON.stringify(e.details || {}),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Cleanup old patterns
 */
export function cleanupSuspiciousPatterns(): void {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const [key, pattern] of suspiciousPatternStore.entries()) {
    if (pattern.lastSeen < oneHourAgo) {
      suspiciousPatternStore.delete(key);
    }
  }
}

// Cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupSuspiciousPatterns, 10 * 60 * 1000);
}
