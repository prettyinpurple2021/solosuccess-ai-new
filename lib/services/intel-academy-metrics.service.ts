import { prisma } from '@/lib/prisma';

export interface IntegrationMetrics {
  // Connection Metrics
  activeIntegrations: number;
  newConnectionsToday: number;
  disconnectionsToday: number;
  connectionSuccessRate: number;

  // Sync Metrics
  syncSuccessRate: number;
  averageSyncDuration: number;
  failedSyncsLast24h: number;

  // Webhook Metrics
  webhooksReceivedToday: number;
  webhookProcessingSuccessRate: number;
  averageWebhookProcessingTime: number;
  pendingWebhookCount: number;

  // API Metrics
  apiCallsToday: number;
  apiErrorRate: number;
  averageApiResponseTime: number;
  rateLimitHitsToday: number;

  // User Engagement
  ssoRedirectsToday: number;
  widgetViewsToday: number;
  courseProgressUpdatesToday: number;
  achievementsEarnedToday: number;
}

/**
 * Service for tracking Intel Academy integration metrics
 */
export class IntelAcademyMetricsService {
  /**
   * Get active integration count
   */
  static async getActiveIntegrationCount(): Promise<number> {
    return prisma.intelAcademyIntegration.count({
      where: {
        isActive: true,
      },
    });
  }

  /**
   * Get new connections today
   */
  static async getNewConnectionsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.intelAcademyIntegration.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Get disconnections today
   */
  static async getDisconnectionsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.intelAcademyIntegration.count({
      where: {
        isActive: false,
        updatedAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Calculate connection success rate
   */
  static async getConnectionSuccessRate(): Promise<number> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const totalAttempts = await prisma.intelAcademyIntegration.count({
      where: {
        createdAt: {
          gte: last24Hours,
        },
      },
    });

    const successfulConnections = await prisma.intelAcademyIntegration.count({
      where: {
        createdAt: {
          gte: last24Hours,
        },
        isActive: true,
      },
    });

    if (totalAttempts === 0) return 100;
    return (successfulConnections / totalAttempts) * 100;
  }

  /**
   * Calculate sync success rate
   */
  static async getSyncSuccessRate(): Promise<number> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const totalSyncs = await prisma.intelAcademyIntegration.count({
      where: {
        lastSyncAt: {
          gte: last24Hours,
        },
      },
    });

    const successfulSyncs = await prisma.intelAcademyIntegration.count({
      where: {
        lastSyncAt: {
          gte: last24Hours,
        },
        syncStatus: 'synced',
      },
    });

    if (totalSyncs === 0) return 100;
    return (successfulSyncs / totalSyncs) * 100;
  }

  /**
   * Get failed syncs in last 24 hours
   */
  static async getFailedSyncsLast24h(): Promise<number> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return prisma.intelAcademyIntegration.count({
      where: {
        lastSyncAt: {
          gte: last24Hours,
        },
        syncStatus: 'failed',
      },
    });
  }

  /**
   * Get webhooks received today
   */
  static async getWebhooksReceivedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.webhookEvent.count({
      where: {
        source: 'intel_academy',
        createdAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Calculate webhook processing success rate
   */
  static async getWebhookProcessingSuccessRate(): Promise<number> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const totalWebhooks = await prisma.webhookEvent.count({
      where: {
        source: 'intel_academy',
        createdAt: {
          gte: last24Hours,
        },
      },
    });

    const processedWebhooks = await prisma.webhookEvent.count({
      where: {
        source: 'intel_academy',
        createdAt: {
          gte: last24Hours,
        },
        status: 'processed',
      },
    });

    if (totalWebhooks === 0) return 100;
    return (processedWebhooks / totalWebhooks) * 100;
  }

  /**
   * Get pending webhook count
   */
  static async getPendingWebhookCount(): Promise<number> {
    return prisma.webhookEvent.count({
      where: {
        source: 'intel_academy',
        status: 'pending',
      },
    });
  }

  /**
   * Calculate average webhook processing time
   */
  static async getAverageWebhookProcessingTime(): Promise<number> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const processedWebhooks = await prisma.webhookEvent.findMany({
      where: {
        source: 'intel_academy',
        status: 'processed',
        createdAt: {
          gte: last24Hours,
        },
        processedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        processedAt: true,
      },
    });

    if (processedWebhooks.length === 0) return 0;

    const totalTime = processedWebhooks.reduce((sum, webhook) => {
      if (!webhook.processedAt) return sum;
      return sum + (webhook.processedAt.getTime() - webhook.createdAt.getTime());
    }, 0);

    return totalTime / processedWebhooks.length / 1000; // Convert to seconds
  }

  /**
   * Get course progress updates today
   */
  static async getCourseProgressUpdatesToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.intelAcademyCourse.count({
      where: {
        updatedAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Get achievements earned today
   */
  static async getAchievementsEarnedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.intelAcademyAchievement.count({
      where: {
        earnedAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Get rate limit hits from security events
   */
  static async getRateLimitHitsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.securityEvent.count({
      where: {
        type: 'rate_limit_exceeded',
        timestamp: {
          gte: today,
        },
      },
    });
  }

  /**
   * Calculate API error rate from security events
   */
  static async getApiErrorRate(): Promise<number> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Count total API-related security events
    const totalApiEvents = await prisma.securityEvent.count({
      where: {
        timestamp: {
          gte: last24Hours,
        },
        resource: 'intel_academy_api',
      },
    });

    // Count error events
    const errorEvents = await prisma.securityEvent.count({
      where: {
        timestamp: {
          gte: last24Hours,
        },
        resource: 'intel_academy_api',
        severity: {
          in: ['high', 'critical'],
        },
      },
    });

    if (totalApiEvents === 0) return 0;
    return (errorEvents / totalApiEvents) * 100;
  }

  /**
   * Get comprehensive metrics
   */
  static async getMetrics(): Promise<IntegrationMetrics> {
    const [
      activeIntegrations,
      newConnectionsToday,
      disconnectionsToday,
      connectionSuccessRate,
      syncSuccessRate,
      failedSyncsLast24h,
      webhooksReceivedToday,
      webhookProcessingSuccessRate,
      averageWebhookProcessingTime,
      pendingWebhookCount,
      rateLimitHitsToday,
      apiErrorRate,
      courseProgressUpdatesToday,
      achievementsEarnedToday,
    ] = await Promise.all([
      this.getActiveIntegrationCount(),
      this.getNewConnectionsToday(),
      this.getDisconnectionsToday(),
      this.getConnectionSuccessRate(),
      this.getSyncSuccessRate(),
      this.getFailedSyncsLast24h(),
      this.getWebhooksReceivedToday(),
      this.getWebhookProcessingSuccessRate(),
      this.getAverageWebhookProcessingTime(),
      this.getPendingWebhookCount(),
      this.getRateLimitHitsToday(),
      this.getApiErrorRate(),
      this.getCourseProgressUpdatesToday(),
      this.getAchievementsEarnedToday(),
    ]);

    return {
      activeIntegrations,
      newConnectionsToday,
      disconnectionsToday,
      connectionSuccessRate: Math.round(connectionSuccessRate * 100) / 100,
      syncSuccessRate: Math.round(syncSuccessRate * 100) / 100,
      averageSyncDuration: 0, // TODO: Implement if needed
      failedSyncsLast24h,
      webhooksReceivedToday,
      webhookProcessingSuccessRate: Math.round(webhookProcessingSuccessRate * 100) / 100,
      averageWebhookProcessingTime: Math.round(averageWebhookProcessingTime * 100) / 100,
      pendingWebhookCount,
      apiCallsToday: 0, // TODO: Implement if needed
      apiErrorRate: Math.round(apiErrorRate * 100) / 100,
      averageApiResponseTime: 0, // TODO: Implement if needed
      rateLimitHitsToday,
      ssoRedirectsToday: 0, // TODO: Implement if needed
      widgetViewsToday: 0, // TODO: Implement if needed
      courseProgressUpdatesToday,
      achievementsEarnedToday,
    };
  }

  /**
   * Export metrics for monitoring dashboard
   */
  static async exportMetrics(): Promise<string> {
    const metrics = await this.getMetrics();
    
    // Export in Prometheus format
    const lines: string[] = [];
    
    lines.push('# HELP intel_academy_active_integrations Number of active Intel Academy integrations');
    lines.push('# TYPE intel_academy_active_integrations gauge');
    lines.push(`intel_academy_active_integrations ${metrics.activeIntegrations}`);
    
    lines.push('# HELP intel_academy_new_connections_today Number of new connections today');
    lines.push('# TYPE intel_academy_new_connections_today counter');
    lines.push(`intel_academy_new_connections_today ${metrics.newConnectionsToday}`);
    
    lines.push('# HELP intel_academy_connection_success_rate Connection success rate percentage');
    lines.push('# TYPE intel_academy_connection_success_rate gauge');
    lines.push(`intel_academy_connection_success_rate ${metrics.connectionSuccessRate}`);
    
    lines.push('# HELP intel_academy_sync_success_rate Sync success rate percentage');
    lines.push('# TYPE intel_academy_sync_success_rate gauge');
    lines.push(`intel_academy_sync_success_rate ${metrics.syncSuccessRate}`);
    
    lines.push('# HELP intel_academy_failed_syncs_24h Failed syncs in last 24 hours');
    lines.push('# TYPE intel_academy_failed_syncs_24h counter');
    lines.push(`intel_academy_failed_syncs_24h ${metrics.failedSyncsLast24h}`);
    
    lines.push('# HELP intel_academy_webhooks_received_today Webhooks received today');
    lines.push('# TYPE intel_academy_webhooks_received_today counter');
    lines.push(`intel_academy_webhooks_received_today ${metrics.webhooksReceivedToday}`);
    
    lines.push('# HELP intel_academy_webhook_processing_success_rate Webhook processing success rate percentage');
    lines.push('# TYPE intel_academy_webhook_processing_success_rate gauge');
    lines.push(`intel_academy_webhook_processing_success_rate ${metrics.webhookProcessingSuccessRate}`);
    
    lines.push('# HELP intel_academy_pending_webhooks Number of pending webhooks');
    lines.push('# TYPE intel_academy_pending_webhooks gauge');
    lines.push(`intel_academy_pending_webhooks ${metrics.pendingWebhookCount}`);
    
    lines.push('# HELP intel_academy_rate_limit_hits_today Rate limit hits today');
    lines.push('# TYPE intel_academy_rate_limit_hits_today counter');
    lines.push(`intel_academy_rate_limit_hits_today ${metrics.rateLimitHitsToday}`);
    
    lines.push('# HELP intel_academy_api_error_rate API error rate percentage');
    lines.push('# TYPE intel_academy_api_error_rate gauge');
    lines.push(`intel_academy_api_error_rate ${metrics.apiErrorRate}`);
    
    return lines.join('\n');
  }
}
