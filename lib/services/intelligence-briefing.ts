import { prisma } from '@/lib/prisma';
import { format, subDays } from 'date-fns';

export interface BriefingSection {
  title: string;
  content: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  activities: Array<{
    id: string;
    competitorName: string;
    title: string;
    description?: string;
    sourceUrl?: string;
    detectedAt: string;
  }>;
}

export interface IntelligenceBriefing {
  userId: string;
  period: string;
  generatedAt: string;
  summary: string;
  sections: BriefingSection[];
  totalActivities: number;
  criticalAlerts: number;
}

class IntelligenceBriefingService {
  /**
   * Generate a daily intelligence briefing for a user
   */
  async generateDailyBriefing(userId: string): Promise<IntelligenceBriefing> {
    const yesterday = subDays(new Date(), 1);
    const today = new Date();

    // Get user's competitors
    const competitors = await prisma.competitorProfile.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, industry: true },
    });

    if (competitors.length === 0) {
      return this.createEmptyBriefing(userId, yesterday, today);
    }

    const competitorIds = competitors.map(c => c.id);

    // Get activities from the last 24 hours
    const activities = await prisma.competitorActivity.findMany({
      where: {
        competitorId: { in: competitorIds },
        detectedAt: {
          gte: yesterday,
          lte: today,
        },
      },
      include: {
        competitor: {
          select: {
            name: true,
            industry: true,
          },
        },
      },
      orderBy: { detectedAt: 'desc' },
    });

    // Group activities by importance
    const criticalActivities = activities.filter(a => a.importance === 'critical');
    const highActivities = activities.filter(a => a.importance === 'high');
    const mediumActivities = activities.filter(a => a.importance === 'medium');
    const lowActivities = activities.filter(a => a.importance === 'low');

    // Create briefing sections
    const sections: BriefingSection[] = [];

    if (criticalActivities.length > 0) {
      sections.push({
        title: '🚨 Critical Alerts',
        content: `${criticalActivities.length} critical ${criticalActivities.length === 1 ? 'activity' : 'activities'} requiring immediate attention.`,
        importance: 'critical',
        activities: criticalActivities.map(a => ({
          id: a.id,
          competitorName: a.competitor.name,
          title: a.title,
          description: a.description || undefined,
          sourceUrl: a.sourceUrl || undefined,
          detectedAt: a.detectedAt.toISOString(),
        })),
      });
    }

    if (highActivities.length > 0) {
      sections.push({
        title: '⚠️ High Priority Updates',
        content: `${highActivities.length} significant ${highActivities.length === 1 ? 'update' : 'updates'} from your competitors.`,
        importance: 'high',
        activities: highActivities.map(a => ({
          id: a.id,
          competitorName: a.competitor.name,
          title: a.title,
          description: a.description || undefined,
          sourceUrl: a.sourceUrl || undefined,
          detectedAt: a.detectedAt.toISOString(),
        })),
      });
    }

    if (mediumActivities.length > 0) {
      sections.push({
        title: '📊 Notable Changes',
        content: `${mediumActivities.length} moderate ${mediumActivities.length === 1 ? 'change' : 'changes'} detected.`,
        importance: 'medium',
        activities: mediumActivities.map(a => ({
          id: a.id,
          competitorName: a.competitor.name,
          title: a.title,
          description: a.description || undefined,
          sourceUrl: a.sourceUrl || undefined,
          detectedAt: a.detectedAt.toISOString(),
        })),
      });
    }

    if (lowActivities.length > 0) {
      sections.push({
        title: '📝 Minor Updates',
        content: `${lowActivities.length} minor ${lowActivities.length === 1 ? 'update' : 'updates'} for your awareness.`,
        importance: 'low',
        activities: lowActivities.map(a => ({
          id: a.id,
          competitorName: a.competitor.name,
          title: a.title,
          description: a.description || undefined,
          sourceUrl: a.sourceUrl || undefined,
          detectedAt: a.detectedAt.toISOString(),
        })),
      });
    }

    // Generate summary
    const summary = this.generateSummary(activities.length, criticalActivities.length, competitors.length);

    return {
      userId,
      period: `${format(yesterday, 'MMM d, yyyy')} - ${format(today, 'MMM d, yyyy')}`,
      generatedAt: new Date().toISOString(),
      summary,
      sections,
      totalActivities: activities.length,
      criticalAlerts: criticalActivities.length,
    };
  }

  /**
   * Generate a weekly intelligence briefing
   */
  async generateWeeklyBriefing(userId: string): Promise<IntelligenceBriefing> {
    const weekAgo = subDays(new Date(), 7);
    const today = new Date();

    const competitors = await prisma.competitorProfile.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true },
    });

    if (competitors.length === 0) {
      return this.createEmptyBriefing(userId, weekAgo, today);
    }

    const competitorIds = competitors.map(c => c.id);

    const activities = await prisma.competitorActivity.findMany({
      where: {
        competitorId: { in: competitorIds },
        detectedAt: {
          gte: weekAgo,
          lte: today,
        },
      },
      include: {
        competitor: {
          select: { name: true },
        },
      },
      orderBy: { detectedAt: 'desc' },
    });

    // Group by competitor for weekly view
    const competitorGroups = new Map<string, typeof activities>();
    activities.forEach(activity => {
      const name = activity.competitor.name;
      if (!competitorGroups.has(name)) {
        competitorGroups.set(name, []);
      }
      competitorGroups.get(name)!.push(activity);
    });

    const sections: BriefingSection[] = [];

    competitorGroups.forEach((acts, competitorName) => {
      const criticalCount = acts.filter(a => a.importance === 'critical').length;
      const highCount = acts.filter(a => a.importance === 'high').length;
      
      let importance: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (criticalCount > 0) importance = 'critical';
      else if (highCount > 0) importance = 'high';
      else if (acts.length > 5) importance = 'medium';

      sections.push({
        title: `${competitorName}`,
        content: `${acts.length} ${acts.length === 1 ? 'activity' : 'activities'} this week`,
        importance,
        activities: acts.slice(0, 10).map(a => ({
          id: a.id,
          competitorName: a.competitor.name,
          title: a.title,
          description: a.description || undefined,
          sourceUrl: a.sourceUrl || undefined,
          detectedAt: a.detectedAt.toISOString(),
        })),
      });
    });

    const criticalCount = activities.filter(a => a.importance === 'critical').length;
    const summary = `Weekly intelligence report covering ${competitors.length} competitors with ${activities.length} total activities detected.`;

    return {
      userId,
      period: `${format(weekAgo, 'MMM d, yyyy')} - ${format(today, 'MMM d, yyyy')}`,
      generatedAt: new Date().toISOString(),
      summary,
      sections,
      totalActivities: activities.length,
      criticalAlerts: criticalCount,
    };
  }

  /**
   * Generate summary text
   */
  private generateSummary(totalActivities: number, criticalCount: number, competitorCount: number): string {
    if (totalActivities === 0) {
      return `No new activities detected from your ${competitorCount} tracked ${competitorCount === 1 ? 'competitor' : 'competitors'} in the last 24 hours.`;
    }

    let summary = `Detected ${totalActivities} ${totalActivities === 1 ? 'activity' : 'activities'} from your tracked competitors in the last 24 hours.`;

    if (criticalCount > 0) {
      summary += ` ${criticalCount} ${criticalCount === 1 ? 'requires' : 'require'} immediate attention.`;
    }

    return summary;
  }

  /**
   * Create an empty briefing when no competitors are tracked
   */
  private createEmptyBriefing(userId: string, startDate: Date, endDate: Date): IntelligenceBriefing {
    return {
      userId,
      period: `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`,
      generatedAt: new Date().toISOString(),
      summary: 'No competitors are currently being tracked. Add competitors to start receiving intelligence briefings.',
      sections: [],
      totalActivities: 0,
      criticalAlerts: 0,
    };
  }

  /**
   * Format briefing as HTML email
   */
  formatAsHtmlEmail(briefing: IntelligenceBriefing): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .summary { background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea; }
    .section { margin-bottom: 30px; }
    .section-header { display: flex; align-items: center; margin-bottom: 15px; }
    .section-title { font-size: 18px; font-weight: 600; margin: 0; }
    .activity { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
    .activity-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
    .activity-title { font-weight: 600; color: #2d3748; margin: 0; }
    .competitor-name { color: #667eea; font-size: 14px; }
    .activity-description { color: #4a5568; font-size: 14px; margin: 8px 0; }
    .activity-link { color: #667eea; text-decoration: none; font-size: 14px; }
    .activity-time { color: #a0aec0; font-size: 12px; }
    .badge-critical { background: #fc8181; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-high { background: #f6ad55; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-medium { background: #68d391; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-low { background: #90cdf4; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .footer { text-align: center; color: #a0aec0; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🕵️ Intelligence Briefing</h1>
    <p>${briefing.period}</p>
  </div>

  <div class="summary">
    <p><strong>Summary:</strong> ${briefing.summary}</p>
    <p><strong>Total Activities:</strong> ${briefing.totalActivities} | <strong>Critical Alerts:</strong> ${briefing.criticalAlerts}</p>
  </div>
`;

    briefing.sections.forEach(section => {
      html += `
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">${section.title}</h2>
    </div>
    <p>${section.content}</p>
`;

      section.activities.forEach(activity => {
        html += `
    <div class="activity">
      <div class="activity-header">
        <div>
          <h3 class="activity-title">${activity.title}</h3>
          <p class="competitor-name">${activity.competitorName}</p>
        </div>
        <span class="badge-${section.importance}">${section.importance.toUpperCase()}</span>
      </div>
      ${activity.description ? `<p class="activity-description">${activity.description}</p>` : ''}
      ${activity.sourceUrl ? `<a href="${activity.sourceUrl}" class="activity-link">View Source →</a>` : ''}
      <p class="activity-time">${format(new Date(activity.detectedAt), 'MMM d, yyyy h:mm a')}</p>
    </div>
`;
      });

      html += `
  </div>
`;
    });

    html += `
  <div class="footer">
    <p>This briefing was automatically generated by SoloSuccess AI</p>
    <p>To manage your competitor tracking settings, visit your dashboard</p>
  </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Format briefing as plain text
   */
  formatAsPlainText(briefing: IntelligenceBriefing): string {
    let text = `
INTELLIGENCE BRIEFING
${briefing.period}
Generated: ${format(new Date(briefing.generatedAt), 'MMM d, yyyy h:mm a')}

SUMMARY
${briefing.summary}
Total Activities: ${briefing.totalActivities} | Critical Alerts: ${briefing.criticalAlerts}

`;

    briefing.sections.forEach(section => {
      text += `\n${section.title}\n`;
      text += `${'='.repeat(section.title.length)}\n`;
      text += `${section.content}\n\n`;

      section.activities.forEach(activity => {
        text += `  • ${activity.title}\n`;
        text += `    Competitor: ${activity.competitorName}\n`;
        if (activity.description) {
          text += `    ${activity.description}\n`;
        }
        if (activity.sourceUrl) {
          text += `    Source: ${activity.sourceUrl}\n`;
        }
        text += `    Detected: ${format(new Date(activity.detectedAt), 'MMM d, yyyy h:mm a')}\n\n`;
      });
    });

    text += `\n---\nThis briefing was automatically generated by SoloSuccess AI\n`;

    return text;
  }
}

// Export singleton instance
export const intelligenceBriefingService = new IntelligenceBriefingService();
