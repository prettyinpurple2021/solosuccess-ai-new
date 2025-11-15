import { IntegrationService } from './integration-service';
import { prisma } from '@/lib/prisma';

export interface StripeMetrics {
  revenue: number;
  transactions: number;
  successfulCharges: number;
  failedCharges: number;
  refunds: number;
  newCustomers: number;
  mrr?: number;
  churnRate?: number;
}

export interface StripeData {
  date: string;
  metrics: StripeMetrics;
  rawData?: any;
}

export class StripeSyncService {
  private static readonly API_BASE_URL = 'https://api.stripe.com/v1';

  static async fetchStripeData(
    userId: string,
    startDate: number,
    endDate: number
  ): Promise<StripeData[]> {
    const accessToken = await IntegrationService.getValidAccessToken(
      userId,
      'stripe'
    );

    // Fetch charges
    const charges = await this.fetchCharges(accessToken, startDate, endDate);
    
    // Fetch customers
    const customers = await this.fetchCustomers(accessToken, startDate, endDate);
    
    // Fetch refunds
    const refunds = await this.fetchRefunds(accessToken, startDate, endDate);

    return this.aggregateDataByDate(charges, customers, refunds);
  }

  private static async fetchCharges(
    accessToken: string,
    startDate: number,
    endDate: number
  ) {
    const response = await fetch(
      `${this.API_BASE_URL}/charges?created[gte]=${startDate}&created[lte]=${endDate}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Stripe charges: ${error}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  private static async fetchCustomers(
    accessToken: string,
    startDate: number,
    endDate: number
  ) {
    const response = await fetch(
      `${this.API_BASE_URL}/customers?created[gte]=${startDate}&created[lte]=${endDate}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Stripe customers: ${error}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  private static async fetchRefunds(
    accessToken: string,
    startDate: number,
    endDate: number
  ) {
    const response = await fetch(
      `${this.API_BASE_URL}/refunds?created[gte]=${startDate}&created[lte]=${endDate}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Stripe refunds: ${error}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  private static aggregateDataByDate(
    charges: any[],
    customers: any[],
    refunds: any[]
  ): StripeData[] {
    const dataByDate = new Map<string, StripeMetrics>();

    // Process charges
    charges.forEach((charge) => {
      const date = new Date(charge.created * 1000).toISOString().split('T')[0];
      const existing = dataByDate.get(date) || {
        revenue: 0,
        transactions: 0,
        successfulCharges: 0,
        failedCharges: 0,
        refunds: 0,
        newCustomers: 0,
      };

      existing.transactions += 1;
      if (charge.status === 'succeeded') {
        existing.successfulCharges += 1;
        existing.revenue += charge.amount / 100; // Convert from cents
      } else {
        existing.failedCharges += 1;
      }

      dataByDate.set(date, existing);
    });

    // Process customers
    customers.forEach((customer) => {
      const date = new Date(customer.created * 1000).toISOString().split('T')[0];
      const existing = dataByDate.get(date) || {
        revenue: 0,
        transactions: 0,
        successfulCharges: 0,
        failedCharges: 0,
        refunds: 0,
        newCustomers: 0,
      };

      existing.newCustomers += 1;
      dataByDate.set(date, existing);
    });

    // Process refunds
    refunds.forEach((refund) => {
      const date = new Date(refund.created * 1000).toISOString().split('T')[0];
      const existing = dataByDate.get(date);
      if (existing) {
        existing.refunds += 1;
        existing.revenue -= refund.amount / 100; // Subtract refund amount
      }
    });

    return Array.from(dataByDate.entries()).map(([date, metrics]) => ({
      date,
      metrics,
    }));
  }

  static async syncStripeData(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const data = await this.fetchStripeData(
      userId,
      startTimestamp,
      endTimestamp
    );

    const operations = data.map((item) =>
      prisma.analyticsData.upsert({
        where: {
          userId_source_dataType_date: {
            userId,
            source: 'stripe',
            dataType: 'daily_metrics',
            date: new Date(item.date),
          },
        },
        create: {
          userId,
          source: 'stripe',
          dataType: 'daily_metrics',
          date: new Date(item.date),
          metrics: item.metrics,
          rawData: item.rawData,
        },
        update: {
          metrics: item.metrics,
          rawData: item.rawData,
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
          provider: 'stripe',
        },
      },
      data: {
        lastSyncAt: new Date(),
      },
    });

    return data.length;
  }

  static async getStoredStripeData(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.analyticsData.findMany({
      where: {
        userId,
        source: 'stripe',
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
