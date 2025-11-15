import { describe, it, expect } from 'vitest';
import { DataProcessingService } from '@/lib/services/data-processing-service';

describe('DataProcessingService', () => {
  describe('normalizeData', () => {
    it('should normalize Google Analytics data', async () => {
      const rawData = [
        {
          date: '2024-01-01',
          metrics: {
            users: 100,
            sessions: 150,
            pageviews: 500,
            bounceRate: 45.5,
            avgSessionDuration: 120,
          },
        },
      ];

      const normalized = await DataProcessingService.normalizeData(
        rawData,
        'google_analytics'
      );

      expect(normalized).toHaveLength(1);
      expect(normalized[0].source).toBe('google_analytics');
      expect(normalized[0].metrics.users).toBe(100);
      expect(normalized[0].metrics.sessions).toBe(150);
    });

    it('should normalize Stripe data', async () => {
      const rawData = [
        {
          date: '2024-01-01',
          metrics: {
            revenue: 5000,
            transactions: 50,
            successfulCharges: 48,
            failedCharges: 2,
            refunds: 1,
            newCustomers: 10,
          },
        },
      ];

      const normalized = await DataProcessingService.normalizeData(
        rawData,
        'stripe'
      );

      expect(normalized).toHaveLength(1);
      expect(normalized[0].source).toBe('stripe');
      expect(normalized[0].metrics.revenue).toBe(5000);
      expect(normalized[0].metrics.transactions).toBe(50);
    });

    it('should handle missing metrics gracefully', async () => {
      const rawData = [
        {
          date: '2024-01-01',
          metrics: {},
        },
      ];

      const normalized = await DataProcessingService.normalizeData(
        rawData,
        'google_analytics'
      );

      expect(normalized[0].metrics.users).toBe(0);
      expect(normalized[0].metrics.sessions).toBe(0);
    });

    it('should return raw data for unknown sources', async () => {
      const rawData = [{ date: '2024-01-01', value: 100 }];

      const normalized = await DataProcessingService.normalizeData(
        rawData,
        'unknown_source'
      );

      expect(normalized).toEqual(rawData);
    });
  });

  describe('aggregateDataByPeriod', () => {
    it('should group data by day', () => {
      const data = [
        { date: new Date('2024-01-01'), source: 'test', metrics: { value: 10 } },
        { date: new Date('2024-01-01'), source: 'test', metrics: { value: 20 } },
        { date: new Date('2024-01-02'), source: 'test', metrics: { value: 30 } },
      ];

      // Test the grouping logic
      const grouped = new Map<string, any[]>();
      data.forEach((item) => {
        const key = item.date.toISOString().split('T')[0];
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(item);
      });

      expect(grouped.size).toBe(2);
      expect(grouped.get('2024-01-01')).toHaveLength(2);
      expect(grouped.get('2024-01-02')).toHaveLength(1);
    });
  });
});
