import { SecurityEvent, SecurityEventSeverity } from './monitoring';

/**
 * Security alert system
 * Sends notifications for critical security events
 */

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  eventTypes: string[];
  minSeverity: SecurityEventSeverity;
  threshold?: number;
  timeWindow?: number; // in milliseconds
  channels: AlertChannel[];
  enabled: boolean;
}

// Default alert rules
const defaultAlertRules: AlertRule[] = [
  {
    id: 'critical-events',
    name: 'Critical Security Events',
    description: 'Alert on all critical security events',
    eventTypes: ['*'],
    minSeverity: SecurityEventSeverity.CRITICAL,
    channels: [
      {
        type: 'email',
        enabled: true,
        config: { recipients: ['security@solosuccess.ai'] },
      },
    ],
    enabled: true,
  },
  {
    id: 'multiple-login-failures',
    name: 'Multiple Login Failures',
    description: 'Alert when user has multiple failed login attempts',
    eventTypes: ['login_failure'],
    minSeverity: SecurityEventSeverity.MEDIUM,
    threshold: 5,
    timeWindow: 15 * 60 * 1000, // 15 minutes
    channels: [
      {
        type: 'email',
        enabled: true,
        config: { recipients: ['security@solosuccess.ai'] },
      },
    ],
    enabled: true,
  },
  {
    id: 'suspicious-activity',
    name: 'Suspicious Activity Detected',
    description: 'Alert on detected suspicious patterns',
    eventTypes: ['suspicious_activity_detected'],
    minSeverity: SecurityEventSeverity.HIGH,
    channels: [
      {
        type: 'email',
        enabled: true,
        config: { recipients: ['security@solosuccess.ai'] },
      },
    ],
    enabled: true,
  },
  {
    id: 'data-breach-attempt',
    name: 'Potential Data Breach',
    description: 'Alert on potential data breach attempts',
    eventTypes: ['unauthorized_access', 'sensitive_data_access'],
    minSeverity: SecurityEventSeverity.HIGH,
    threshold: 3,
    timeWindow: 5 * 60 * 1000, // 5 minutes
    channels: [
      {
        type: 'email',
        enabled: true,
        config: { recipients: ['security@solosuccess.ai'] },
      },
    ],
    enabled: true,
  },
];

// Store for alert rules
let alertRules: AlertRule[] = [...defaultAlertRules];

// Store for recent alerts to prevent spam
const recentAlerts = new Map<string, number>();

/**
 * Process security event and send alerts if needed
 */
export async function processSecurityAlert(event: SecurityEvent): Promise<void> {
  for (const rule of alertRules) {
    if (!rule.enabled) continue;

    // Check if event matches rule
    if (!matchesRule(event, rule)) continue;

    // Check if alert should be sent
    if (shouldSendAlert(rule, event)) {
      await sendAlert(rule, event);
    }
  }
}

/**
 * Check if event matches alert rule
 */
function matchesRule(event: SecurityEvent, rule: AlertRule): boolean {
  // Check event type
  if (!rule.eventTypes.includes('*') && !rule.eventTypes.includes(event.type)) {
    return false;
  }

  // Check severity
  const severityLevels = {
    [SecurityEventSeverity.LOW]: 0,
    [SecurityEventSeverity.MEDIUM]: 1,
    [SecurityEventSeverity.HIGH]: 2,
    [SecurityEventSeverity.CRITICAL]: 3,
  };

  if (severityLevels[event.severity] < severityLevels[rule.minSeverity]) {
    return false;
  }

  return true;
}

/**
 * Check if alert should be sent based on threshold and time window
 */
function shouldSendAlert(rule: AlertRule, event: SecurityEvent): boolean {
  // If no threshold, always send
  if (!rule.threshold) return true;

  const key = `${rule.id}:${event.userId || event.ip}`;
  const now = Date.now();

  // Check recent alerts
  const lastAlert = recentAlerts.get(key);
  if (lastAlert && rule.timeWindow) {
    if (now - lastAlert < rule.timeWindow) {
      return false; // Don't spam alerts
    }
  }

  // TODO: Implement threshold checking with event counting
  // For now, just send the alert
  recentAlerts.set(key, now);
  return true;
}

/**
 * Send alert through configured channels
 */
async function sendAlert(rule: AlertRule, event: SecurityEvent): Promise<void> {
  console.log(`🚨 Security Alert: ${rule.name}`, {
    event: event.type,
    severity: event.severity,
    userId: event.userId,
    ip: event.ip,
  });

  for (const channel of rule.channels) {
    if (!channel.enabled) continue;

    try {
      switch (channel.type) {
        case 'email':
          await sendEmailAlert(rule, event, channel.config);
          break;
        case 'slack':
          await sendSlackAlert(rule, event, channel.config);
          break;
        case 'webhook':
          await sendWebhookAlert(rule, event, channel.config);
          break;
      }
    } catch (error) {
      console.error(`Failed to send alert via ${channel.type}:`, error);
    }
  }
}

/**
 * Send email alert
 */
async function sendEmailAlert(
  rule: AlertRule,
  event: SecurityEvent,
  config: Record<string, any>
): Promise<void> {
  // TODO: Implement email sending
  console.log('Email alert:', {
    to: config.recipients,
    subject: `Security Alert: ${rule.name}`,
    body: formatAlertMessage(rule, event),
  });

  // Example implementation:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    // Configure email transport
  });
  
  await transporter.sendMail({
    from: 'security@solosuccess.ai',
    to: config.recipients.join(','),
    subject: `Security Alert: ${rule.name}`,
    html: formatAlertEmailHtml(rule, event),
  });
  */
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(
  rule: AlertRule,
  event: SecurityEvent,
  config: Record<string, any>
): Promise<void> {
  // TODO: Implement Slack webhook
  console.log('Slack alert:', {
    webhook: config.webhookUrl,
    message: formatAlertMessage(rule, event),
  });

  // Example implementation:
  /*
  await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Security Alert: ${rule.name}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: formatAlertMessage(rule, event),
          },
        },
      ],
    }),
  });
  */
}

/**
 * Send webhook alert
 */
async function sendWebhookAlert(
  rule: AlertRule,
  event: SecurityEvent,
  config: Record<string, any>
): Promise<void> {
  // TODO: Implement webhook
  console.log('Webhook alert:', {
    url: config.url,
    payload: { rule, event },
  });

  // Example implementation:
  /*
  await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': generateSignature(event, config.secret),
    },
    body: JSON.stringify({ rule, event }),
  });
  */
}

/**
 * Format alert message
 */
function formatAlertMessage(rule: AlertRule, event: SecurityEvent): string {
  return `
Security Alert: ${rule.name}

Event Type: ${event.type}
Severity: ${event.severity}
Timestamp: ${event.timestamp.toISOString()}
${event.userId ? `User ID: ${event.userId}` : ''}
${event.ip ? `IP Address: ${event.ip}` : ''}
${event.resource ? `Resource: ${event.resource}` : ''}

Details:
${JSON.stringify(event.details, null, 2)}

Description: ${rule.description}
  `.trim();
}

/**
 * Get alert rules
 */
export function getAlertRules(): AlertRule[] {
  return [...alertRules];
}

/**
 * Add alert rule
 */
export function addAlertRule(rule: AlertRule): void {
  alertRules.push(rule);
}

/**
 * Update alert rule
 */
export function updateAlertRule(id: string, updates: Partial<AlertRule>): boolean {
  const index = alertRules.findIndex((r) => r.id === id);
  if (index === -1) return false;

  alertRules[index] = { ...alertRules[index], ...updates };
  return true;
}

/**
 * Delete alert rule
 */
export function deleteAlertRule(id: string): boolean {
  const index = alertRules.findIndex((r) => r.id === id);
  if (index === -1) return false;

  alertRules.splice(index, 1);
  return true;
}

/**
 * Clear recent alerts cache
 */
export function clearRecentAlerts(): void {
  recentAlerts.clear();
}
