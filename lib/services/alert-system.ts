import { prisma } from '@/lib/prisma';
import { emailService } from './email';

export interface AlertPreferences {
  enabled: boolean;
  emailAlerts: boolean;
  pushAlerts: boolean;
  importanceLevels: ('low' | 'medium' | 'high' | 'critical')[];
  activityTypes: string[];
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
}

export interface Alert {
  id: string;
  userId: string;
  competitorId: string;
  activityId: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  read: boolean;
  sentEmail: boolean;
  sentPush: boolean;
  createdAt: Date;
}

class AlertSystemService {
  /**
   * Get default alert preferences
   */
  getDefaultPreferences(): AlertPreferences {
    return {
      enabled: true,
      emailAlerts: true,
      pushAlerts: false,
      importanceLevels: ['high', 'critical'],
      activityTypes: [],
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };
  }

  /**
   * Get user's alert preferences
   */
  async getUserPreferences(userId: string): Promise<AlertPreferences> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const preferences = (profile?.preferences as any) || {};
    const alertPrefs = preferences.alerts || this.getDefaultPreferences();

    return alertPrefs;
  }

  /**
   * Update user's alert preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<AlertPreferences>
  ): Promise<AlertPreferences> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const currentPrefs = (profile?.preferences as any) || {};
    const currentAlertPrefs = currentPrefs.alerts || this.getDefaultPreferences();

    const updatedAlertPrefs = {
      ...currentAlertPrefs,
      ...preferences,
    };

    await prisma.userProfile.update({
      where: { userId },
      data: {
        preferences: {
          ...currentPrefs,
          alerts: updatedAlertPrefs,
        },
      },
    });

    return updatedAlertPrefs;
  }

  /**
   * Check if we're in quiet hours
   */
  private isQuietHours(quietHours?: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = quietHours.start;
    const end = quietHours.end;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    return currentTime >= start && currentTime <= end;
  }

  /**
   * Process a new competitor activity and create alerts if needed
   */
  async processActivity(activityId: string): Promise<void> {
    try {
      // Get the activity with competitor and user info
      const activity = await prisma.competitorActivity.findUnique({
        where: { id: activityId },
        include: {
          competitor: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      preferences: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!activity) return;

      const user = activity.competitor.user;
      const preferences = await this.getUserPreferences(user.id);

      // Check if alerts are enabled
      if (!preferences.enabled) return;

      // Check if this importance level should trigger an alert
      const importance = activity.importance as 'low' | 'medium' | 'high' | 'critical';
      if (!preferences.importanceLevels.includes(importance)) return;

      // Check if this activity type should trigger an alert (if specific types are configured)
      if (
        preferences.activityTypes.length > 0 &&
        !preferences.activityTypes.includes(activity.activityType)
      ) {
        return;
      }

      // Check quiet hours for email alerts
      const inQuietHours = this.isQuietHours(preferences.quietHours);

      // Send email alert if enabled and not in quiet hours
      if (preferences.emailAlerts && !inQuietHours) {
        await this.sendEmailAlert(user.email, activity);
      }

      // Send push notification if enabled (would require push notification service)
      if (preferences.pushAlerts && !inQuietHours) {
        // TODO: Implement push notification
        console.log('Push notification would be sent for activity:', activityId);
      }

      // Store alert in database for in-app notifications
      await this.createInAppAlert(user.id, activity);
    } catch (error) {
      console.error('Error processing activity alert:', error);
    }
  }

  /**
   * Send email alert for an activity
   */
  private async sendEmailAlert(
    userEmail: string,
    activity: any
  ): Promise<void> {
    try {
      await emailService.sendCompetitorAlert(
        userEmail,
        activity.competitor.name,
        activity.title,
        activity.description || 'No additional details available',
        activity.sourceUrl || undefined
      );
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  /**
   * Create an in-app alert notification
   */
  private async createInAppAlert(userId: string, activity: any): Promise<void> {
    // Store alert in user profile metadata for now
    // In a production app, you'd want a dedicated alerts table
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const preferences = (profile?.preferences as any) || {};
    const alerts = preferences.inAppAlerts || [];

    // Add new alert
    alerts.unshift({
      id: `alert_${Date.now()}`,
      competitorId: activity.competitorId,
      competitorName: activity.competitor.name,
      activityId: activity.id,
      importance: activity.importance,
      title: activity.title,
      message: activity.description || '',
      sourceUrl: activity.sourceUrl,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Keep only last 50 alerts
    const trimmedAlerts = alerts.slice(0, 50);

    await prisma.userProfile.update({
      where: { userId },
      data: {
        preferences: {
          ...preferences,
          inAppAlerts: trimmedAlerts,
        },
      },
    });
  }

  /**
   * Get user's in-app alerts
   */
  async getUserAlerts(userId: string, unreadOnly: boolean = false): Promise<any[]> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const preferences = (profile?.preferences as any) || {};
    const alerts = preferences.inAppAlerts || [];

    if (unreadOnly) {
      return alerts.filter((alert: any) => !alert.read);
    }

    return alerts;
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(userId: string, alertId: string): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const preferences = (profile?.preferences as any) || {};
    const alerts = preferences.inAppAlerts || [];

    const updatedAlerts = alerts.map((alert: any) =>
      alert.id === alertId ? { ...alert, read: true } : alert
    );

    await prisma.userProfile.update({
      where: { userId },
      data: {
        preferences: {
          ...preferences,
          inAppAlerts: updatedAlerts,
        },
      },
    });
  }

  /**
   * Mark all alerts as read
   */
  async markAllAlertsAsRead(userId: string): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const preferences = (profile?.preferences as any) || {};
    const alerts = preferences.inAppAlerts || [];

    const updatedAlerts = alerts.map((alert: any) => ({ ...alert, read: true }));

    await prisma.userProfile.update({
      where: { userId },
      data: {
        preferences: {
          ...preferences,
          inAppAlerts: updatedAlerts,
        },
      },
    });
  }

  /**
   * Delete an alert
   */
  async deleteAlert(userId: string, alertId: string): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const preferences = (profile?.preferences as any) || {};
    const alerts = preferences.inAppAlerts || [];

    const updatedAlerts = alerts.filter((alert: any) => alert.id !== alertId);

    await prisma.userProfile.update({
      where: { userId },
      data: {
        preferences: {
          ...preferences,
          inAppAlerts: updatedAlerts,
        },
      },
    });
  }
}

// Export singleton instance
export const alertSystemService = new AlertSystemService();
