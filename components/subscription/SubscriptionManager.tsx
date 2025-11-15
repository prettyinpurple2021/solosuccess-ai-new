'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

interface SubscriptionManagerProps {
  currentTier: 'free' | 'accelerator' | 'premium';
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: Date;
  onUpgrade: (tier: 'accelerator' | 'premium') => Promise<void>;
  onCancel: (reason?: string) => Promise<void>;
  onReactivate: () => Promise<void>;
}

export function SubscriptionManager({
  currentTier,
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  onUpgrade,
  onCancel,
  onReactivate,
}: SubscriptionManagerProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'accelerator' | 'premium'>(
    'accelerator'
  );
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade(selectedTier);
      setShowUpgradeDialog(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel(cancelReason);
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      await onReactivate();
    } catch (error) {
      console.error('Reactivation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <GlassmorphicCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white capitalize">
              {currentTier} Plan
            </h3>
            <p className="text-gray-400">
              Status:{' '}
              <span
                className={`font-semibold ${
                  status === 'active' ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                {status}
              </span>
            </p>
          </div>
          {currentTier !== 'free' && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Next billing date</p>
              <p className="text-white font-semibold">
                {currentPeriodEnd
                  ? new Date(currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          )}
        </div>

        {cancelAtPeriodEnd && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-semibold">
                  Subscription Ending
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Your subscription will end on{' '}
                  {currentPeriodEnd
                    ? new Date(currentPeriodEnd).toLocaleDateString()
                    : 'N/A'}
                  . You'll be moved to the Free plan.
                </p>
                <Button
                  onClick={handleReactivate}
                  disabled={isLoading}
                  className="mt-3 bg-green-500 hover:bg-green-600"
                >
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {currentTier === 'free' && (
            <Button
              onClick={() => setShowUpgradeDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Upgrade Plan
            </Button>
          )}
          {currentTier === 'accelerator' && (
            <>
              <Button
                onClick={() => {
                  setSelectedTier('premium');
                  setShowUpgradeDialog(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Upgrade to Premium
              </Button>
              {!cancelAtPeriodEnd && (
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  Cancel Subscription
                </Button>
              )}
            </>
          )}
          {currentTier === 'premium' && !cancelAtPeriodEnd && (
            <Button
              onClick={() => setShowCancelDialog(true)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </GlassmorphicCard>

      {/* Upgrade Dialog */}
      <AnimatePresence>
        {showUpgradeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassmorphicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    Upgrade Your Plan
                  </h3>
                  <button
                    onClick={() => setShowUpgradeDialog(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-300 mb-6">
                  Choose the plan that best fits your needs. You'll be charged
                  immediately and your new features will be available right
                  away.
                </p>

                <div className="space-y-3 mb-6">
                  {currentTier === 'free' && (
                    <>
                      <button
                        onClick={() => setSelectedTier('accelerator')}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          selectedTier === 'accelerator'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-white font-semibold">
                              Accelerator
                            </p>
                            <p className="text-gray-400 text-sm">
                              $49/month - All features
                            </p>
                          </div>
                          {selectedTier === 'accelerator' && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedTier('premium')}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          selectedTier === 'premium'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-white font-semibold">Premium</p>
                            <p className="text-gray-400 text-sm">
                              $99/month - Maximum power
                            </p>
                          </div>
                          {selectedTier === 'premium' && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                    </>
                  )}
                  {currentTier === 'accelerator' && (
                    <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-500/10">
                      <div className="text-left">
                        <p className="text-white font-semibold">Premium</p>
                        <p className="text-gray-400 text-sm">
                          $99/month - Maximum power
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowUpgradeDialog(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isLoading ? 'Processing...' : 'Confirm Upgrade'}
                  </Button>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassmorphicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    Cancel Subscription
                  </h3>
                  <button
                    onClick={() => setShowCancelDialog(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-semibold">
                        Are you sure?
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        You'll lose access to premium features at the end of
                        your billing period on{' '}
                        {currentPeriodEnd
                          ? new Date(currentPeriodEnd).toLocaleDateString()
                          : 'N/A'}
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-gray-300 mb-2">
                    Help us improve (optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Why are you canceling?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCancelDialog(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20"
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    {isLoading ? 'Processing...' : 'Confirm Cancellation'}
                  </Button>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
