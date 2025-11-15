import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Notification Settings
        </h1>
        <p className="mt-2 text-gray-400">
          Manage how and when you receive notifications
        </p>
      </div>

      <NotificationPreferences />
    </div>
  );
}
