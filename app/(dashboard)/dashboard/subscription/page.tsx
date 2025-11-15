'use client';

import { useState, useEffect } from 'react';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { BillingPortal } from '@/components/subscription/BillingPortal';
import { UsageDisplay } from '@/components/subscription/UsageDisplay';
import { motion } from 'framer-motion';

// This would come from your auth context in a real app
const MOCK_USER_ID = 'user-123';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/subscription?userId=${MOCK_USER_ID}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'accelerator' | 'premium') => {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: MOCK_USER_ID, newTier: tier }),
      });

      if (response.ok) {
        await fetchSubscription();
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      throw error;
    }
  };

  const handleCancel = async (reason?: string) => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: MOCK_USER_ID, reason }),
      });

      if (response.ok) {
        await fetchSubscription();
      }
    } catch (error) {
      console.error('Cancellation failed:', error);
      throw error;
    }
  };

  const handleReactivate = async () => {
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: MOCK_USER_ID }),
      });

      if (response.ok) {
        await fetchSubscription();
      }
    } catch (error) {
      console.error('Reactivation failed:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Subscription & Billing
          </h1>
          <p className="text-gray-300">
            Manage your subscription, billing, and usage
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SubscriptionManager
                currentTier={subscription?.tier || 'free'}
                status={subscription?.status || 'active'}
                cancelAtPeriodEnd={
                  subscription?.subscription?.cancelAtPeriodEnd || false
                }
                currentPeriodEnd={
                  subscription?.subscription?.currentPeriodEnd
                    ? new Date(subscription.subscription.currentPeriodEnd)
                    : undefined
                }
                onUpgrade={handleUpgrade}
                onCancel={handleCancel}
                onReactivate={handleReactivate}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BillingPortal userId={MOCK_USER_ID} />
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <UsageDisplay userId={MOCK_USER_ID} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
