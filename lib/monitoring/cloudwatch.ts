/**
 * AWS CloudWatch integration for logs and metrics
 * Provides structured logging to CloudWatch Logs and custom metrics
 */

import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';
import { CloudWatchClient, PutMetricDataCommand, MetricDatum } from '@aws-sdk/client-cloudwatch';
import { logger } from './logger';

interface CloudWatchConfig {
  region: string;
  logGroupName: string;
  logStreamName: string;
  namespace: string;
}

class CloudWatchMonitoring {
  private logsClient: CloudWatchLogsClient;
  private metricsClient: CloudWatchClient;
  private config: CloudWatchConfig;
  private enabled: boolean;
  private logBuffer: any[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production' && !!process.env.AWS_REGION;
    
    this.config = {
      region: process.env.AWS_REGION || 'us-east-1',
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP || '/solosuccess-ai/production',
      logStreamName: `${process.env.HOSTNAME || 'instance'}-${Date.now()}`,
      namespace: 'SoloSuccess-AI',
    };

    if (this.enabled) {
      this.logsClient = new CloudWatchLogsClient({ region: this.config.region });
      this.metricsClient = new CloudWatchClient({ region: this.config.region });
      this.initializeLogStream();
      this.startFlushInterval();
    }
  }

  private async initializeLogStream(): Promise<void> {
    try {
      await this.logsClient.send(
        new CreateLogStreamCommand({
          logGroupName: this.config.logGroupName,
          logStreamName: this.config.logStreamName,
        })
      );
      logger.info('CloudWatch log stream initialized', {
        logGroup: this.config.logGroupName,
        logStream: this.config.logStreamName,
      });
    } catch (error: any) {
      if (error.name !== 'ResourceAlreadyExistsException') {
        logger.error('Failed to initialize CloudWatch log stream', error);
      }
    }
  }

  private startFlushInterval(): void {
    // Flush logs every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000);
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const events = this.logBuffer.splice(0, 100); // CloudWatch limit is 10,000 events per batch

    try {
      await this.logsClient.send(
        new PutLogEventsCommand({
          logGroupName: this.config.logGroupName,
          logStreamName: this.config.logStreamName,
          logEvents: events.map((event) => ({
            timestamp: event.timestamp,
            message: JSON.stringify(event.message),
          })),
        })
      );
    } catch (error) {
      logger.error('Failed to flush logs to CloudWatch', error as Error);
      // Put events back in buffer
      this.logBuffer.unshift(...events);
    }
  }

  async log(level: string, message: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    this.logBuffer.push({
      timestamp: Date.now(),
      message: {
        level,
        message,
        metadata,
        service: 'solosuccess-ai',
        environment: process.env.NODE_ENV,
      },
    });

    // Flush immediately if buffer is getting large
    if (this.logBuffer.length >= 50) {
      await this.flushLogs();
    }
  }

  async putMetric(
    metricName: string,
    value: number,
    unit: string = 'None',
    dimensions?: Record<string, string>
  ): Promise<void> {
    if (!this.enabled) return;

    const metricData: MetricDatum = {
      MetricName: metricName,
      Value: value,
      Unit: unit as any,
      Timestamp: new Date(),
      Dimensions: dimensions
        ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value }))
        : undefined,
    };

    try {
      await this.metricsClient.send(
        new PutMetricDataCommand({
          Namespace: this.config.namespace,
          MetricData: [metricData],
        })
      );
    } catch (error) {
      logger.error('Failed to put metric to CloudWatch', error as Error, {
        metric: metricName,
      });
    }
  }

  // Application-specific metrics
  async trackAPILatency(endpoint: string, duration: number): Promise<void> {
    await this.putMetric('APILatency', duration, 'Milliseconds', {
      Endpoint: endpoint,
    });
  }

  async trackDatabaseLatency(operation: string, duration: number): Promise<void> {
    await this.putMetric('DatabaseLatency', duration, 'Milliseconds', {
      Operation: operation,
    });
  }

  async trackAIServiceLatency(agent: string, duration: number): Promise<void> {
    await this.putMetric('AIServiceLatency', duration, 'Milliseconds', {
      Agent: agent,
    });
  }

  async trackErrorRate(errorType: string, count: number = 1): Promise<void> {
    await this.putMetric('ErrorRate', count, 'Count', {
      ErrorType: errorType,
    });
  }

  async trackActiveConnections(count: number): Promise<void> {
    await this.putMetric('ActiveConnections', count, 'Count');
  }

  async trackMemoryUsage(bytes: number): Promise<void> {
    await this.putMetric('MemoryUsage', bytes / 1024 / 1024, 'Megabytes');
  }

  async trackCPUUsage(percentage: number): Promise<void> {
    await this.putMetric('CPUUsage', percentage, 'Percent');
  }

  async trackCacheHitRate(rate: number): Promise<void> {
    await this.putMetric('CacheHitRate', rate, 'Percent');
  }

  async trackQueueDepth(queueName: string, depth: number): Promise<void> {
    await this.putMetric('QueueDepth', depth, 'Count', {
      Queue: queueName,
    });
  }

  async trackUserActivity(activityType: string, count: number = 1): Promise<void> {
    await this.putMetric('UserActivity', count, 'Count', {
      ActivityType: activityType,
    });
  }

  // Cleanup
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushLogs();
  }
}

// Export singleton instance
export const cloudwatch = new CloudWatchMonitoring();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await cloudwatch.shutdown();
});

process.on('SIGINT', async () => {
  await cloudwatch.shutdown();
});
