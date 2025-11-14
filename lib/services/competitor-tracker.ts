import { prisma } from '@/lib/prisma';
import { webScraperService, ScrapedContent } from './web-scraper';
import { alertSystemService } from './alert-system';

export interface TrackingResult {
  competitorId: string;
  competitorName: string;
  activitiesDetected: number;
  errors: string[];
}

class CompetitorTrackerService {
  /**
   * Track a single competitor and detect activities
   */
  async trackCompetitor(competitorId: string): Promise<TrackingResult> {
    const result: TrackingResult = {
      competitorId,
      competitorName: '',
      activitiesDetected: 0,
      errors: [],
    };

    try {
      // Get competitor details
      const competitor = await prisma.competitorProfile.findUnique({
        where: { id: competitorId },
      });

      if (!competitor || !competitor.isActive) {
        result.errors.push('Competitor not found or inactive');
        return result;
      }

      result.competitorName = competitor.name;

      // Get tracking sources
      const trackingSources = competitor.trackingSources as any;

      // Track website if enabled
      if (trackingSources.website && competitor.website) {
        try {
          await this.trackWebsite(competitor.id, competitor.website);
          result.activitiesDetected++;
        } catch (error) {
          result.errors.push(`Website tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Track blog if provided
      if (trackingSources.blog) {
        try {
          await this.trackWebsite(competitor.id, trackingSources.blog, 'blog');
          result.activitiesDetected++;
        } catch (error) {
          result.errors.push(`Blog tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Note: Social media tracking would require API integrations
      // For now, we'll focus on website scraping

    } catch (error) {
      result.errors.push(`Tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Track a website and detect changes
   */
  private async trackWebsite(
    competitorId: string,
    url: string,
    sourceType: string = 'website'
  ): Promise<void> {
    try {
      // Scrape the website
      const scrapedContent = await webScraperService.scrapeUrl(url);

      // Get previous scrape from metadata
      const competitor = await prisma.competitorProfile.findUnique({
        where: { id: competitorId },
      });

      if (!competitor) return;

      const metadata = (competitor.metadata as any) || {};
      const previousScrapes = metadata.scrapes || {};
      const previousScrape = previousScrapes[sourceType];

      // If we have a previous scrape, detect changes
      if (previousScrape) {
        const changeDetection = webScraperService.detectChanges(
          previousScrape,
          scrapedContent
        );

        if (changeDetection.hasChanges) {
          // Create activity records for detected changes
          const activities = this.generateActivitiesFromChanges(
            competitorId,
            url,
            sourceType,
            changeDetection.changes
          );

          // Save activities and trigger alerts
          for (const activity of activities) {
            const createdActivity = await prisma.competitorActivity.create({
              data: activity,
            });
            
            // Trigger alert processing for high and critical activities
            if (activity.importance === 'high' || activity.importance === 'critical') {
              await alertSystemService.processActivity(createdActivity.id);
            }
          }
        }
      } else {
        // First time tracking - create initial activity
        await prisma.competitorActivity.create({
          data: {
            competitorId,
            activityType: 'tracking_started',
            title: `Started tracking ${sourceType}`,
            description: `Initial scan of ${url}`,
            sourceUrl: url,
            detectedAt: new Date(),
            importance: 'low',
            metadata: {
              sourceType,
            },
          },
        });
      }

      // Update competitor metadata with latest scrape
      await prisma.competitorProfile.update({
        where: { id: competitorId },
        data: {
          metadata: {
            ...metadata,
            scrapes: {
              ...previousScrapes,
              [sourceType]: scrapedContent,
            },
            lastTrackedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error(`Error tracking website ${url}:`, error);
      throw error;
    }
  }

  /**
   * Generate activity records from detected changes
   */
  private generateActivitiesFromChanges(
    competitorId: string,
    url: string,
    sourceType: string,
    changes: any
  ): Array<{
    competitorId: string;
    activityType: string;
    title: string;
    description?: string;
    sourceUrl: string;
    detectedAt: Date;
    importance: 'low' | 'medium' | 'high' | 'critical';
    metadata: any;
  }> {
    const activities: any[] = [];
    const now = new Date();

    if (changes.title) {
      activities.push({
        competitorId,
        activityType: 'website_title_change',
        title: 'Website title changed',
        description: 'The website title has been updated',
        sourceUrl: url,
        detectedAt: now,
        importance: 'low',
        metadata: { sourceType, changeType: 'title' },
      });
    }

    if (changes.description) {
      activities.push({
        competitorId,
        activityType: 'website_description_change',
        title: 'Website description changed',
        description: 'The website meta description has been updated',
        sourceUrl: url,
        detectedAt: now,
        importance: 'low',
        metadata: { sourceType, changeType: 'description' },
      });
    }

    if (changes.content) {
      activities.push({
        competitorId,
        activityType: 'website_content_change',
        title: 'Website content updated',
        description: 'Significant changes detected in website content',
        sourceUrl: url,
        detectedAt: now,
        importance: 'medium',
        metadata: { sourceType, changeType: 'content' },
      });
    }

    if (changes.links?.added?.length > 0) {
      activities.push({
        competitorId,
        activityType: 'new_links_added',
        title: `${changes.links.added.length} new link(s) added`,
        description: `New links detected on the website`,
        sourceUrl: url,
        detectedAt: now,
        importance: 'low',
        metadata: {
          sourceType,
          changeType: 'links',
          addedLinks: changes.links.added.slice(0, 10),
        },
      });
    }

    if (changes.images?.added?.length > 0) {
      activities.push({
        competitorId,
        activityType: 'new_images_added',
        title: `${changes.images.added.length} new image(s) added`,
        description: `New images detected on the website`,
        sourceUrl: url,
        detectedAt: now,
        importance: 'low',
        metadata: {
          sourceType,
          changeType: 'images',
          addedImages: changes.images.added.slice(0, 10),
        },
      });
    }

    return activities;
  }

  /**
   * Track all active competitors for a user
   */
  async trackAllCompetitors(userId: string): Promise<TrackingResult[]> {
    const competitors = await prisma.competitorProfile.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const results: TrackingResult[] = [];

    for (const competitor of competitors) {
      const result = await this.trackCompetitor(competitor.id);
      results.push(result);
    }

    return results;
  }

  /**
   * Track all active competitors across all users (for scheduled jobs)
   */
  async trackAllActiveCompetitors(): Promise<{
    totalTracked: number;
    totalActivities: number;
    errors: number;
  }> {
    const competitors = await prisma.competitorProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            subscriptionTier: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    let totalTracked = 0;
    let totalActivities = 0;
    let errors = 0;

    for (const competitor of competitors) {
      // Only track for users with active subscriptions
      if (competitor.user.subscriptionStatus !== 'active') {
        continue;
      }

      // Only track for Accelerator and Premium users
      if (competitor.user.subscriptionTier === 'free') {
        continue;
      }

      try {
        const result = await this.trackCompetitor(competitor.id);
        totalTracked++;
        totalActivities += result.activitiesDetected;
        errors += result.errors.length;
      } catch (error) {
        console.error(`Error tracking competitor ${competitor.id}:`, error);
        errors++;
      }
    }

    return {
      totalTracked,
      totalActivities,
      errors,
    };
  }
}

// Export singleton instance
export const competitorTrackerService = new CompetitorTrackerService();
