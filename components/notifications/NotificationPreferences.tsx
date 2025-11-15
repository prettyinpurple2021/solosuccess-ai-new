'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PushNotificationToggle } from './PushNotificationToggle';

interface NotificationPreferences {
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

const categoryLabels: Record<string, { label: string; description: string; icon: string }> = {
  ai_agents: {
    label: 'AI Agents',
    description: 'Responses from your AI team members',
    icon: '🤖',
  },
  mission_control: {
    label: 'Mission Control',
    description: 'Updates on collaborative AI sessions',
    icon: '🎯',
  },
  competitor_intelligence: {
    label: 'Competitor Intelligence',
    description: 'Alerts about competitor activities',
    icon: '🕵️',
  },
  insights: {
    label: 'Insights',
    description: 'Data-driven insights and recommendations',
    icon: '💡',
  },
  billing: {
    label: 'Billing',
    description: 'Subscription and payment updates',
    icon: '💳',
  },
  security: {
    label: 'Security',
    description: 'Security alerts and account activity',
    icon: '🔒',
  },
  documents: {
    label: 'Documents',
    description: 'Document generation and updates',
    icon: '📄',
  },
  content: {
    label: 'Content',
    description: 'Content generation completions',
    icon: '✨',
  },
  system: {
    label: 'System',
    description: 'Platform updates and announcements',
    icon: '⚙️',
  },
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (updates: Partial<NotificationPreferences>) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
        setSaveMessage('Preferences saved successfully');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveMessage('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDeliveryMethod = (method: 'emailEnabled' | 'inAppEnabled') => {
    if (!preferences) return;

    const updates = {
      ...preferences,
      [method]: !preferences[method],
    };

    setPreferences(updates);
    savePreferences({ [method]: updates[method] });
  };

  const toggleCategory = (category: string) => {
    if (!preferences) return;

    const updates = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category as keyof typeof preferences.categories],
      },
    };

    setPreferences(updates);
    savePreferences({ categories: updates.categories });
  };

  const updateDigestSettings = (field: string, value: any) => {
    if (!preferences) return;

    const updates = {
      ...preferences,
      [field]: value,
    };

    setPreferences(updates);
    savePreferences({ [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300">Failed to load notification preferences</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Save message */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`rounded-lg border p-4 ${
            saveMessage.includes('success')
              ? 'border-green-500/20 bg-green-500/10 text-green-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      {/* Delivery Methods */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 text-xl font-semibold text-white">Delivery Methods</h2>

        <div className="space-y-6">
          {/* In-App Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">In-App Notifications</h3>
              <p className="text-sm text-gray-400">Show notifications in the app</p>
            </div>
            <button
              onClick={() => toggleDeliveryMethod('inAppEnabled')}
              disabled={isSaving}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                preferences.inAppEnabled
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gray-600'
              }`}
            >
              <motion.div
                className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg"
                animate={{
                  left: preferences.inAppEnabled ? '28px' : '4px',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Email Notifications</h3>
              <p className="text-sm text-gray-400">Receive notifications via email</p>
            </div>
            <button
              onClick={() => toggleDeliveryMethod('emailEnabled')}
              disabled={isSaving}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                preferences.emailEnabled
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gray-600'
              }`}
            >
              <motion.div
                className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg"
                animate={{
                  left: preferences.emailEnabled ? '28px' : '4px',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Push Notifications */}
          <PushNotificationToggle />
        </div>
      </div>

      {/* Notification Categories */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 text-xl font-semibold text-white">Notification Categories</h2>

        <div className="space-y-4">
          {Object.entries(categoryLabels).map(([key, { label, description, icon }]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="font-medium text-white">{label}</h3>
                  <p className="text-sm text-gray-400">{description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleCategory(key)}
                disabled={isSaving}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  preferences.categories[key as keyof typeof preferences.categories] !== false
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gray-600'
                }`}
              >
                <motion.div
                  className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg"
                  animate={{
                    left:
                      preferences.categories[key as keyof typeof preferences.categories] !== false
                        ? '28px'
                        : '4px',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Digest Settings */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 text-xl font-semibold text-white">Digest Email</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Enable Digest</h3>
              <p className="text-sm text-gray-400">
                Receive a summary of notifications instead of individual emails
              </p>
            </div>
            <button
              onClick={() => updateDigestSettings('digestEnabled', !preferences.digestEnabled)}
              disabled={isSaving}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                preferences.digestEnabled
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gray-600'
              }`}
            >
              <motion.div
                className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg"
                animate={{
                  left: preferences.digestEnabled ? '28px' : '4px',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {preferences.digestEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Frequency</label>
                <select
                  value={preferences.digestFrequency}
                  onChange={(e) => updateDigestSettings('digestFrequency', e.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Delivery Time (24-hour format)
                </label>
                <input
                  type="time"
                  value={preferences.digestTime}
                  onChange={(e) => updateDigestSettings('digestTime', e.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
