import { prisma } from '@/lib/prisma';

export interface ProcessedMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  conversionRate: number;
  growthRate: number;
  churnRate?: number;
  mrr?: number;
}

export interface TrendData {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  significance: 'high' | 'medium' | 'low';
}

export class DataProcessingService {
  static async ingestData(
    userId: string,
    source: string,
    dataType: string,
    data: any[]
  ) {
    const operations = data.map((item) =>
      prisma.analyticsData.upsert({
        where: {
          userId_source_dataType_date: {
            userId,
            source,
            dataType,
            date: new Date(item.date),
          },
        },
        create: {
          userId,
          source,
          dataType,
          date: new Date(item.date),
          metrics: item.metrics,
          dimensions: item.dimensions,
          rawData: item,
        },
        update: {
          metrics: item.metrics,
          dimensions: item.dimensions,
          rawData: item,
          processedAt: new Date(),
        },
      })
    );

    await prisma.$transaction(operations);
    return data.length;
  }

  static async normalizeData(rawData: any[], source: string): Promise<any[]> {
    // Normalize data structure based on source
    switch (source) {
      case 'google_analytics':
        return this.normalizeGoogleAnalytics(rawData);
      case 'stripe':
        return this.normalizeStripe(rawData);
      default:
        return rawData;
    }
  }

  private static normalizeGoogleAnalytics(data: any[]): any[] {
    return data.map((item) => ({
      date: item.date,
      metrics: {
        users: item.metrics.users || 0,
        sessions: item.metrics.sessions || 0,
        pageviews: item.metrics.pageviews || 0,
        bounceRate: item.metrics.bounceRate || 0,
        avgSessionDuration: item.metrics.avgSessionDuration || 0,
      },
      source: 'google_analytics',
    }));
  }

  private static normalizeStripe(data: any[]): any[] {
    return data.map((item) => ({
      date: item.date,
      metrics: {
        revenue: item.metrics.revenue || 0,
        transactions: item.metrics.transactions || 0,
        successfulCharges: item.metrics.successfulCharges || 0,
        failedCharges: item.metrics.failedCharges || 0,
        refunds: item.metrics.refunds || 0,
        newCustomers: item.metrics.newCustomers || 0,
      },
      source: 'stripe',
    }));
  }

  static async calculateMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProcessedMetrics> {
    const analyticsData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Aggregate metrics from different sources
    let totalRevenue = 0;
    let totalUsers = 0;
    let totalSessions = 0;
    let totalSessionDuration = 0;
    let sessionCount = 0;

    analyticsData.forEach((data) => {
      const metrics = data.metrics as any;

      if (data.source === 'stripe') {
        totalRevenue += metrics.revenue || 0;
      }

      if (data.source === 'google_analytics') {
        totalUsers += metrics.users || 0;
        totalSessions += metrics.sessions || 0;
        if (metrics.avgSessionDuration) {
          totalSessionDuration += metrics.avgSessionDuration * metrics.sessions;
          sessionCount += metrics.sessions;
        }
      }
    });

    const avgSessionDuration =
      sessionCount > 0 ? totalSessionDuration / sessionCount : 0;

    // Calculate growth rate (compare to previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = startDate;

    const previousData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: {
          gte: previousStartDate,
          lt: previousEndDate,
        },
      },
    });

    let previousRevenue = 0;
    previousData.forEach((data) => {
      const metrics = data.metrics as any;
      if (data.source === 'stripe') {
        previousRevenue += metrics.revenue || 0;
      }
    });

    const growthRate =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      totalRevenue,
      totalUsers,
      totalSessions,
      avgSessionDuration,
      conversionRate: 0, // Would need conversion tracking data
      growthRate,
    };
  }

  static async detectTrends(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrendData[]> {
    const currentMetrics = await this.calculateMetrics(
      userId,
      startDate,
      endDate
    );

    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = startDate;

    const previousMetrics = await this.calculateMetrics(
      userId,
      previousStartDate,
      previousEndDate
    );

    const trends: TrendData[] = [];

    // Revenue trend
    const revenueChange = currentMetrics.totalRevenue - previousMetrics.totalRevenue;
    const revenueChangePercent =
      previousMetrics.totalRevenue > 0
        ? (revenueChange / previousMetrics.totalRevenue) * 100
        : 0;

    trends.push({
      metric: 'revenue',
      direction:
        revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
      change: revenueChange,
      changePercent: revenueChangePercent,
      significance:
        Math.abs(revenueChangePercent) > 20
          ? 'high'
          : Math.abs(revenueChangePercent) > 10
            ? 'medium'
            : 'low',
    });

    // Users trend
    const usersChange = currentMetrics.totalUsers - previousMetrics.totalUsers;
    const usersChangePercent =
      previousMetrics.totalUsers > 0
        ? (usersChange / previousMetrics.totalUsers) * 100
        : 0;

    trends.push({
      metric: 'users',
      direction: usersChange > 0 ? 'up' : usersChange < 0 ? 'down' : 'stable',
      change: usersChange,
      changePercent: usersChangePercent,
      significance:
        Math.abs(usersChangePercent) > 20
          ? 'high'
          : Math.abs(usersChangePercent) > 10
            ? 'medium'
            : 'low',
    });

    // Sessions trend
    const sessionsChange =
      currentMetrics.totalSessions - previousMetrics.totalSessions;
    const sessionsChangePercent =
      previousMetrics.totalSessions > 0
        ? (sessionsChange / previousMetrics.totalSessions) * 100
        : 0;

    trends.push({
      metric: 'sessions',
      direction:
        sessionsChange > 0 ? 'up' : sessionsChange < 0 ? 'down' : 'stable',
      change: sessionsChange,
      changePercent: sessionsChangePercent,
      significance:
        Math.abs(sessionsChangePercent) > 20
          ? 'high'
          : Math.abs(sessionsChangePercent) > 10
            ? 'medium'
            : 'low',
    });

    return trends;
  }

  static async cleanData(userId: string, olderThan: Date) {
    // Remove old analytics data to save space
    const deleted = await prisma.analyticsData.deleteMany({
      where: {
        userId,
        date: {
          lt: olderThan,
        },
      },
    });

    return deleted.count;
  }

  static async aggregateDataByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month'
  ) {
    const data = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group data by period
    const grouped = new Map<string, any[]>();

    data.forEach((item) => {
      let key: string;
      const date = new Date(item.date);

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    // Aggregate metrics for each period
    return Array.from(grouped.entries()).map(([period, items]) => {
      const aggregated: any = {
        period,
        sources: {},
      };

      items.forEach((item) => {
        if (!aggregated.sources[item.source]) {
          aggregated.sources[item.source] = {};
        }

        const metrics = item.metrics as any;
        Object.keys(metrics).forEach((key) => {
          if (!aggregated.sources[item.source][key]) {
            aggregated.sources[item.source][key] = 0;
          }
          aggregated.sources[item.source][key] += metrics[key];
        });
      });

      return aggregated;
    });
  }
}
