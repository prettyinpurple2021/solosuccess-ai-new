import { prisma } from '@/lib/prisma';
import { DataProcessingService } from './data-processing-service';

export interface InsightNudge {
  id: string;
  title: string;
  description: string;
  insightType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metrics?: any;
  recommendations?: string[];
  actionTaken: boolean;
  createdAt: Date;
}

export class InsightGenerationService {
  static async generateDailyInsights(userId: string): Promise<InsightNudge[]> {
    const insights: InsightNudge[] = [];

    // Get data for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const trends = await DataProcessingService.detectTrends(
      userId,
      startDate,
      endDate
    );

    const metrics = await DataProcessingService.calculateMetrics(
      userId,
      startDate,
      endDate
    );

    // Generate insights based on trends
    for (const trend of trends) {
      if (trend.significance === 'high') {
        const insight = await this.createInsightFromTrend(userId, trend, metrics);
        if (insight) {
          insights.push(insight);
        }
      }
    }

    // Generate insights based on metrics
    const metricInsights = await this.generateMetricInsights(userId, metrics);
    insights.push(...metricInsights);

    // Prioritize insights
    const prioritized = this.prioritizeInsights(insights);

    // Save top insights to database
    await this.saveInsights(userId, prioritized.slice(0, 5));

    return prioritized;
  }

  private static async createInsightFromTrend(
    userId: string,
    trend: any,
    metrics: any
  ): Promise<InsightNudge | null> {
    let title = '';
    let description = '';
    let recommendations: string[] = [];
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    if (trend.metric === 'revenue') {
      if (trend.direction === 'up') {
        title = '📈 Revenue Growth Detected';
        description = `Your revenue has increased by ${Math.abs(trend.changePercent).toFixed(1)}% compared to the previous period. Great work!`;
        recommendations = [
          'Analyze what drove this growth and double down on those strategies',
          'Consider scaling your successful campaigns',
          'Document your winning tactics for future reference',
        ];
        priority = 'high';
      } else if (trend.direction === 'down') {
        title = '⚠️ Revenue Decline Alert';
        description = `Your revenue has decreased by ${Math.abs(trend.changePercent).toFixed(1)}% compared to the previous period.`;
        recommendations = [
          'Review recent changes to pricing or product offerings',
          'Analyze customer feedback for potential issues',
          'Consider running a promotional campaign to boost sales',
          'Check if there are seasonal factors affecting sales',
        ];
        priority = 'critical';
      }
    } else if (trend.metric === 'users') {
      if (trend.direction === 'up') {
        title = '👥 User Growth Surge';
        description = `You gained ${Math.abs(trend.changePercent).toFixed(1)}% more users compared to the previous period.`;
        recommendations = [
          'Ensure your onboarding process can handle the increased volume',
          'Prepare customer support for more inquiries',
          'Consider upselling opportunities to new users',
        ];
        priority = 'high';
      } else if (trend.direction === 'down') {
        title = '📉 User Acquisition Slowdown';
        description = `User growth has slowed by ${Math.abs(trend.changePercent).toFixed(1)}% compared to the previous period.`;
        recommendations = [
          'Review and optimize your marketing channels',
          'Test new acquisition strategies',
          'Analyze competitor activities',
          'Consider running targeted campaigns',
        ];
        priority = 'high';
      }
    } else if (trend.metric === 'sessions') {
      if (trend.direction === 'down' && trend.changePercent < -15) {
        title = '🔍 Engagement Drop Detected';
        description = `User sessions have decreased by ${Math.abs(trend.changePercent).toFixed(1)}%.`;
        recommendations = [
          'Check for technical issues affecting user experience',
          'Review recent product changes',
          'Send re-engagement campaigns to inactive users',
          'Analyze user feedback for pain points',
        ];
        priority = 'high';
      }
    }

    if (!title) return null;

    return {
      id: '',
      title,
      description,
      insightType: `${trend.metric}_${trend.direction}`,
      priority,
      metrics: { trend, currentMetrics: metrics },
      recommendations,
      actionTaken: false,
      createdAt: new Date(),
    };
  }

  private static async generateMetricInsights(
    userId: string,
    metrics: any
  ): Promise<InsightNudge[]> {
    const insights: InsightNudge[] = [];

    // Low session duration insight
    if (metrics.avgSessionDuration < 30) {
      insights.push({
        id: '',
        title: '⏱️ Low Session Duration',
        description: `Average session duration is ${Math.round(metrics.avgSessionDuration)}s, which is below optimal.`,
        insightType: 'session_duration_low',
        priority: 'medium',
        recommendations: [
          'Improve page load times',
          'Make content more engaging',
          'Simplify navigation',
          'Add interactive elements',
        ],
        actionTaken: false,
        createdAt: new Date(),
      });
    }

    // High growth rate insight
    if (metrics.growthRate > 50) {
      insights.push({
        id: '',
        title: '🚀 Exceptional Growth',
        description: `You're experiencing ${metrics.growthRate.toFixed(1)}% growth! This is exceptional.`,
        insightType: 'exceptional_growth',
        priority: 'high',
        recommendations: [
          'Document what's working',
          'Scale successful strategies',
          'Prepare infrastructure for continued growth',
          'Consider hiring to support growth',
        ],
        actionTaken: false,
        createdAt: new Date(),
      });
    }

    return insights;
  }

  private static prioritizeInsights(insights: InsightNudge[]): InsightNudge[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return insights.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static async saveInsights(
    userId: string,
    insights: InsightNudge[]
  ) {
    const operations = insights.map((insight) =>
      prisma.insightNudge.create({
        data: {
          userId,
          title: insight.title,
          description: insight.description,
          insightType: insight.insightType,
          priority: insight.priority,
          metrics: insight.metrics,
          recommendations: insight.recommendations,
        },
      })
    );

    await prisma.$transaction(operations);
  }

  static async getActiveInsights(userId: string, limit: number = 10) {
    return prisma.insightNudge.findMany({
      where: {
        userId,
        actionTaken: false,
        dismissedAt: null,
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  static async markInsightAsActioned(insightId: string) {
    return prisma.insightNudge.update({
      where: { id: insightId },
      data: {
        actionTaken: true,
        actionTakenAt: new Date(),
      },
    });
  }

  static async dismissInsight(insightId: string) {
    return prisma.insightNudge.update({
      where: { id: insightId },
      data: {
        dismissedAt: new Date(),
      },
    });
  }

  static async trackInsightAction(insightId: string, action: string) {
    await this.markInsightAsActioned(insightId);
    
    // Could log the action for analytics
    console.log(`User took action "${action}" on insight ${insightId}`);
  }
}
