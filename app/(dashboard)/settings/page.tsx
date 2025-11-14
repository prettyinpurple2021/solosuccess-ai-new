'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedGradientBackground } from '@/components/ui/AnimatedGradientBackground';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { DataPrivacy } from '@/components/settings/DataPrivacy';
import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { userApi, UserPreferences } from '@/lib/api/user';

export default function SettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await userApi.getPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async (notifications: UserPreferences['notifications']) => {
    try {
      const updated = await userApi.updatePreferences({ notifications });
      setPreferences(updated);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateDataPrivacy = async (dataPrivacy: UserPreferences['dataPrivacy']) => {
    try {
      const updated = await userApi.updatePreferences({ dataPrivacy });
      setPreferences(updated);
    } catch (err) {
      throw err;
    }
  };

  const handleExportData = async () => {
    try {
      // Trigger download
      window.open('/api/user/export', '_blank');
    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      await userApi.deleteAccount(password);
      // Redirect to home page after deletion
      router.push('/');
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedGradientBackground />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedGradientBackground />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Settings</h2>
          <p className="text-gray-400">{error || 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <AnimatedGradientBackground />
      <div className="relative z-10 space-y-8 p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Settings & Preferences
          </h1>
          <p className="text-gray-400">
            Customize your experience and manage your account
          </p>
        </div>

        <div className="space-y-8">
          {/* Theme Settings */}
          <ThemeSettings />

          {/* Notification Preferences */}
          <NotificationPreferences
            preferences={preferences.notifications}
            onSave={handleSaveNotifications}
          />

          {/* Data Privacy */}
          <DataPrivacy
            dataPrivacy={preferences.dataPrivacy}
            onUpdate={handleUpdateDataPrivacy}
            onExportData={handleExportData}
            onDeleteAccount={() => setShowDeleteModal(true)}
          />
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </DashboardLayout>
  );
}
