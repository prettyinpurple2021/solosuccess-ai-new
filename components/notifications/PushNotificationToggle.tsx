'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } =
    usePushNotifications();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setError(null);

    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update push notification settings');
    }
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
        <p className="text-sm text-yellow-300">
          Push notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
          <p className="text-sm text-gray-400">
            Receive real-time notifications on this device
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading || permission === 'denied'}
          className={`relative h-8 w-14 rounded-full transition-colors ${
            isSubscribed
              ? 'bg-gradient-to-r from-blue-500 to-purple-500'
              : 'bg-gray-600'
          } ${isLoading || permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <motion.div
            className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg"
            animate={{
              left: isSubscribed ? '28px' : '4px',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {permission === 'denied' && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">
            Push notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {isSubscribed && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm text-green-300">
            ✓ You will receive push notifications on this device
          </p>
        </div>
      )}
    </div>
  );
}
