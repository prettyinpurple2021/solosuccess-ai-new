import { IntegrationService } from './integration-service';
import { prisma } from '@/lib/prisma';

export interface GoogleAnalyticsMetrics {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions?: number;
  revenue?: number;
}

export interface GoogleAnalyticsData {
  date: string;
  metrics: GoogleAnalyticsMetrics;
  dimensions?: Record<string, any>;
}

export class GoogleAnalyticsService {
  private static readonly API_BASE_URL = 'https://analyticsdata.googleapis.com/v1beta';

  static async fetchAnalyticsData(
    userId: string,
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<GoogleAnalyticsData[]> {
    const accessToken = await IntegrationService.getValidAccessToken(
      userId,
      'google_analytics'
    );

    const response = await fetch(
      `${this.API_BASE_URL}/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Google Analytics data: ${error}`);
    }

    const data = await response.json();
    return this.parseAnalyticsResponse(data);
  }

  private static parseAnalyticsResponse(response: any): GoogleAnalyticsData[] {
    if (!response.rows) {
      return [];
    }

    return response.rows.map((row: any) => ({
      date: row.dimensionValues[0].value,
      metrics: {
        sessions: parseInt(row.metricValues[0].value),
        users: parseInt(row.metricValues[1].value),
        pageviews: parseInt(row.metricValues[2].value),
        bounceRate: parseFloat(row.metricValues[3].value),
        avgSessionDuration: parseFloat(row.metricValues[4].value),
      },
    }));
  }

  static async syncAnalyticsData(
    userId: string,
    propertyId: string,
    startDate: string,
    endDate: string
  ) {
    const data = await this.fetchAnalyticsData(
      userId,
      propertyId,
      startDate,
      endDate
    );

    const operations = data.map((item) =>
      prisma.analyticsData.upsert({
        where: {
          userId_source_dataType_date: {
            userId,
            source: 'google_analytics',
            dataType: 'daily_metrics',
            date: new Date(item.date),
          },
        },
        create: {
          userId,
          source: 'google_analytics',
          dataType: 'daily_metrics',
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

    // Update last sync time
    await prisma.integration.update({
      where: {
        userId_provider: {
          userId,
          provider: 'google_analytics',
        },
      },
      data: {
        lastSyncAt: new Date(),
      },
    });

    return data.length;
  }

  static async getStoredAnalyticsData(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.analyticsData.findMany({
      where: {
        userId,
        source: 'google_analytics',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
