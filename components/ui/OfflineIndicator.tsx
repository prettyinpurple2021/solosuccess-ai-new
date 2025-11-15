'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { getQueueSize, processQueue } from '@/lib/utils/offlineQueue';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Update queue size
    const updateQueueSize = () => {
      setQueueSize(getQueueSize());
    };

    updateQueueSize();
    const interval = setInterval(updateQueueSize, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show indicator when offline or when there are queued items
    setShowIndicator(!isOnline || queueSize > 0);

    // Process queue when coming back online
    if (isOnline && queueSize > 0 && !syncing) {
      setSyncing(true);
      
      processQueue(async (action) => {
        // This would be replaced with actual API calls
        console.log('[OfflineIndicator] Processing action:', action);
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return true;
        } catch (error) {
          console.error('[OfflineIndicator] Failed to process action:', error);
          return false;
        }
      }).then(({ processed, failed }) => {
        console.log(`[OfflineIndicator] Synced ${processed} actions, ${failed} failed`);
        setSyncing(false);
        setQueueSize(getQueueSize());
      });
    }
  }, [isOnline, queueSize, syncing]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              {/* Status Icon */}
              {isOnline ? (
                syncing ? (
                  <motion.svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )
              ) : (
                <svg
                  className="w-4 h-4 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                  />
                </svg>
              )}

              {/* Status Text */}
              <span className="text-white text-sm font-medium">
                {isOnline ? (
                  syncing ? (
                    `Syncing ${queueSize} ${queueSize === 1 ? 'item' : 'items'}...`
                  ) : queueSize > 0 ? (
                    `${queueSize} ${queueSize === 1 ? 'item' : 'items'} queued`
                  ) : (
                    'Online'
                  )
                ) : (
                  'Offline'
                )}
              </span>

              {/* Pulse indicator for offline */}
              {!isOnline && (
                <motion.div
                  className="w-2 h-2 bg-orange-400 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
