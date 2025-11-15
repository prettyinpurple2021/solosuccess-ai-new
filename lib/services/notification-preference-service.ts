import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  categories: {
    ai_agents?: boolean;
    mission_control?: boolean;
    competitor_intelligence?: boolean;
    insights?: boolean;
    billing?: boolean;
    security?: boolean;
    documents?: boolean;
    content?: boolean;
    system?: boolean;
  };
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly';
  digestTime: string;
}

class NotificationPreferenceService {
  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await prisma.notificationPreference.create({
          data: {
            userId,
            emailEnabled: true,
            pushEnabled: false,
            inAppEnabled: true,
            categories: {},
            digestEnabled: false,
            digestFrequency: 'daily',
            digestTime: '09:00',
          },
        });
      }

      return {
        emailEnabled: preferences.emailEnabled,
        pushEnabled: preferences.pushEnabled,
        inAppEnabled: preferences.inAppEnabled,
        categories: (preferences.categories as any) || {},
        digestEnabled: preferences.digestEnabled,
        digestFrequency: preferences.digestFrequency as 'daily' | 'weekly',
        digestTime: preferences.digestTime,
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await prisma.notificationPreference.upsert({
        where: { userId },
        update: updates,
        create: {
          userId,
          emailEnabled: updates.emailEnabled ?? true,
          pushEnabled: updates.pushEnabled ?? false,
          inAppEnabled: updates.inAppEnabled ?? true,
          categories: updates.categories || {},
          digestEnabled: updates.digestEnabled ?? false,
          digestFrequency: updates.digestFrequency || 'daily',
          digestTime: updates.digestTime || '09:00',
        },
      });

      return {
        emailEnabled: preferences.emailEnabled,
        pushEnabled: preferences.pushEnabled,
        inAppEnabled: preferences.inAppEnabled,
        categories: (preferences.categories as any) || {},
        digestEnabled: preferences.digestEnabled,
        digestFrequency: preferences.digestFrequency as 'daily' | 'weekly',
        digestTime: preferences.digestTime,
      };
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Check if a specific notification type is enabled
   */
  async isEnabled(
    userId: string,
    deliveryMethod: 'email' | 'push' | 'inApp',
    category?: string
  ): Promise<boolean> {
    try {
      const preferences = await this.getPreferences(userId);

      // Check delivery method
      if (deliveryMethod === 'email' && !preferences.emailEnabled) return false;
      if (deliveryMethod === 'push' && !preferences.pushEnabled) return false;
      if (deliveryMethod === 'inApp' && !preferences.inAppEnabled) return false;

      // Check category if specified
      if (category && preferences.categories[category as keyof typeof preferences.categories] === false) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking if enabled:', error);
      return true; // Default to enabled on error
    }
  }
}

export const notificationPreferenceService = new NotificationPreferenceService();
