/**
 * Metrics collection and reporting for DataDog
 * Tracks application performance and business metrics
 */

import { logger } from './logger';

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  DISTRIBUTION = 'distribution',
}

export interface MetricOptions {
  tags?: Record<string, string>;
  timestamp?: number;
}

class MetricsCollector {
  private enabled: boolean;
  private apiKey: string | undefined;
  private environment: string;
  private serviceName: string;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    this.apiKey = process.env.DATADOG_API_KEY;
    this.environment = process.env.NODE_ENV || 'development';
    this.serviceName = 'solosuccess-ai';
  }

  private formatTags(tags?: Record<string, string>): string[] {
    const defaultTags = {
      env: this.environment,
      service: this.serviceName,
    };

    const allTags = { ...defaultTags, ...tags };
    return Object.entries(allTags).map(([key, value]) => `${key}:${value}`);
  }

  private async sendMetric(
    type: MetricType,
    name: string,
    value: number,
    options?: MetricOptions
  ): Promise<void> {
    if (!this.enabled || !this.apiKey) {
      logger.debug(`Metric: ${name} = ${value}`, { type, tags: options?.tags });
      return;
    }

    try {
      const metric = {
        series: [
          {
            metric: `solosuccess.${name}`,
            type,
            points: [[options?.timestamp || Date.now() / 1000, value]],
            tags: this.formatTags(options?.tags),
          },
        ],
      };

      // In production, send to DataDog API
      // For now, log the metric
      logger.debug('Metric sent', { metric: name, value, type });
    } catch (error) {
      logger.error('Failed to send metric', error as Error, { metric: name });
    }
  }

  // Counter: Tracks counts of events
  async increment(name: string, value: number = 1, options?: MetricOptions): Promise<void> {
    await this.sendMetric(MetricType.COUNTER, name, value, options);
  }

  // Gauge: Tracks current value of something
  async gauge(name: string, value: number, options?: MetricOptions): Promise<void> {
    await this.sendMetric(MetricType.GAUGE, name, value, options);
  }

  // Histogram: Tracks statistical distribution
  async histogram(name: string, value: number, options?: MetricOptions): Promise<void> {
    await this.sendMetric(MetricType.HISTOGRAM, name, value, options);
  }

  // Distribution: Similar to histogram but more accurate
  async distribution(name: string, value: number, options?: MetricOptions): Promise<void> {
    await this.sendMetric(MetricType.DISTRIBUTION, name, value, options);
  }

  // Timing: Track duration of operations
  async timing(name: string, duration: number, options?: MetricOptions): Promise<void> {
    await this.histogram(`${name}.duration`, duration, options);
  }

  // Business Metrics
  async trackUserRegistration(subscriptionTier: string): Promise<void> {
    await this.increment('user.registration', 1, {
      tags: { subscription_tier: subscriptionTier },
    });
  }

  async trackUserLogin(method: string): Promise<void> {
    await this.increment('user.login', 1, {
      tags: { method },
    });
  }

  async trackAIRequest(agentId: string, success: boolean): Promise<void> {
    await this.increment('ai.request', 1, {
      tags: { agent_id: agentId, success: success.toString() },
    });
  }

  async trackAIResponseTime(agentId: string, duration: number): Promise<void> {
    await this.timing('ai.response_time', duration, {
      tags: { agent_id: agentId },
    });
  }

  async trackMissionControlSession(success: boolean, duration: number): Promise<void> {
    await this.increment('mission_control.session', 1, {
      tags: { success: success.toString() },
    });
    await this.timing('mission_control.duration', duration);
  }

  async trackSubscriptionChange(from: string, to: string): Promise<void> {
    await this.increment('subscription.change', 1, {
      tags: { from_tier: from, to_tier: to },
    });
  }

  async trackPaymentSuccess(amount: number, currency: string): Promise<void> {
    await this.increment('payment.success', 1, {
      tags: { currency },
    });
    await this.gauge('payment.amount', amount, {
      tags: { currency },
    });
  }

  async trackPaymentFailure(reason: string): Promise<void> {
    await this.increment('payment.failure', 1, {
      tags: { reason },
    });
  }

  async trackAPIRequest(endpoint: string, method: string, statusCode: number, duration: number): Promise<void> {
    await this.increment('api.request', 1, {
      tags: { endpoint, method, status_code: statusCode.toString() },
    });
    await this.timing('api.response_time', duration, {
      tags: { endpoint, method },
    });
  }

  async trackDatabaseQuery(operation: string, duration: number): Promise<void> {
    await this.increment('database.query', 1, {
      tags: { operation },
    });
    await this.timing('database.query_time', duration, {
      tags: { operation },
    });
  }

  async trackCacheHit(key: string): Promise<void> {
    await this.increment('cache.hit', 1, {
      tags: { key },
    });
  }

  async trackCacheMiss(key: string): Promise<void> {
    await this.increment('cache.miss', 1, {
      tags: { key },
    });
  }

  async trackError(type: string, severity: string): Promise<void> {
    await this.increment('error.count', 1, {
      tags: { type, severity },
    });
  }

  async trackActiveUsers(count: number): Promise<void> {
    await this.gauge('users.active', count);
  }

  async trackQueueSize(queue: string, size: number): Promise<void> {
    await this.gauge('queue.size', size, {
      tags: { queue },
    });
  }

  async trackMemoryUsage(usage: number): Promise<void> {
    await this.gauge('system.memory_usage', usage);
  }

  async trackCPUUsage(usage: number): Promise<void> {
    await this.gauge('system.cpu_usage', usage);
  }
}

// Export singleton instance
export const metrics = new MetricsCollector();

// Helper function to measure execution time
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    await metrics.timing(name, duration, { tags });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    await metrics.timing(name, duration, { tags: { ...tags, error: 'true' } });
    throw error;
  }
}

// Decorator for measuring method execution time
export function Measure(metricName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return measureTime(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
