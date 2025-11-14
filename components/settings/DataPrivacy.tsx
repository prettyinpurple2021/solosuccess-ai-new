'use client';

import { useState } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { Shield, Download, Trash2, AlertTriangle } from 'lucide-react';

interface DataPrivacyProps {
  dataPrivacy: {
    shareAnalytics: boolean;
    shareUsageData: boolean;
  };
  onUpdate: (settings: { shareAnalytics: boolean; shareUsageData: boolean }) => Promise<void>;
  onExportData: () => Promise<void>;
  onDeleteAccount: () => void;
}

export function DataPrivacy({ dataPrivacy: initial, onUpdate, onExportData, onDeleteAccount }: DataPrivacyProps) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleToggle = (key: 'shareAnalytics' | 'shareUsageData') => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    handleSave(newSettings);
  };

  const handleSave = async (newSettings: typeof settings) => {
    setSaving(true);
    try {
      await onUpdate(newSettings);
    } catch (err) {
      console.error('Error saving privacy settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExportData();
    } catch (err) {
      console.error('Error exporting data:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <GlassmorphicCard className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Data & Privacy</h2>
      </div>

      <div className="space-y-6">
        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
              <div>
                <p className="text-white font-medium">Share Analytics Data</p>
                <p className="text-sm text-gray-400 mt-1">
                  Help us improve by sharing anonymous usage analytics
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.shareAnalytics}
                onChange={() => handleToggle('shareAnalytics')}
                disabled={saving}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
              <div>
                <p className="text-white font-medium">Share Usage Data</p>
                <p className="text-sm text-gray-400 mt-1">
                  Allow us to analyze feature usage to enhance your experience
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.shareUsageData}
                onChange={() => handleToggle('shareUsageData')}
                disabled={saving}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Data Export */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Your Data</h3>
          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">Export Your Data</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Download a copy of all your data in JSON format
                  </p>
                </div>
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  variant="secondary"
                  className="ml-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Danger Zone
          </h3>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white font-medium">Delete Account</p>
                <p className="text-sm text-gray-400 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={onDeleteAccount}
                variant="secondary"
                className="ml-4 bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
