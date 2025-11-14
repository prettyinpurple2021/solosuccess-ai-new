'use client';

import { useState } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { NotificationPreferences as NotificationPrefsType } from '@/lib/api/user';
import { Bell, Mail, Smartphone, Monitor, Save } from 'lucide-react';

interface NotificationPreferencesProps {
  preferences: NotificationPrefsType;
  onSave: (preferences: NotificationPrefsType) => Promise<void>;
}

export function NotificationPreferences({ preferences: initialPrefs, onSave }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggle = (category: 'email' | 'push' | 'inApp', type: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type as keyof typeof prev[typeof category]],
      },
    }));
    setSuccess(false);
  };

  const handleDigestChange = (frequency: 'daily' | 'weekly' | 'never') => {
    setPreferences(prev => ({
      ...prev,
      digestFrequency: frequency,
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await onSave(preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: 'insights', label: 'AI Insights & Nudges' },
    { key: 'missions', label: 'Mission Control Updates' },
    { key: 'competitors', label: 'Competitor Alerts' },
  ];

  return (
    <GlassmorphicCard className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
      </div>

      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
          </div>
          <div className="space-y-3 ml-7">
            {notificationTypes.map(type => (
              <label key={type.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <span className="text-gray-300">{type.label}</span>
                <input
                  type="checkbox"
                  checked={preferences.email[type.key as keyof typeof preferences.email]}
                  onChange={() => handleToggle('email', type.key)}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            ))}
            {/* Marketing emails */}
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
              <span className="text-gray-300">Marketing & Updates</span>
              <input
                type="checkbox"
                checked={preferences.email.marketing}
                onChange={() => handleToggle('email', 'marketing')}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
          </div>
          <div className="space-y-3 ml-7">
            {notificationTypes.map(type => (
              <label key={type.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <span className="text-gray-300">{type.label}</span>
                <input
                  type="checkbox"
                  checked={preferences.push[type.key as keyof typeof preferences.push]}
                  onChange={() => handleToggle('push', type.key)}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">In-App Notifications</h3>
          </div>
          <div className="space-y-3 ml-7">
            {notificationTypes.map(type => (
              <label key={type.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <span className="text-gray-300">{type.label}</span>
                <input
                  type="checkbox"
                  checked={preferences.inApp[type.key as keyof typeof preferences.inApp]}
                  onChange={() => handleToggle('inApp', type.key)}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Digest Frequency */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Email Digest Frequency</h3>
          <div className="space-y-2 ml-7">
            {[
              { value: 'daily', label: 'Daily Digest' },
              { value: 'weekly', label: 'Weekly Digest' },
              { value: 'never', label: 'No Digest' },
            ].map(option => (
              <label key={option.value} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="digestFrequency"
                  value={option.value}
                  checked={preferences.digestFrequency === option.value}
                  onChange={() => handleDigestChange(option.value as any)}
                  className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : success ? 'Saved!' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
