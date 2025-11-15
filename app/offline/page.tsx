'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <GlassmorphicPanel blur="strong" className="text-center">
          {/* Offline Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
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
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            You're Offline
          </h1>

          {/* Description */}
          <p className="text-white/70 mb-6">
            It looks like you've lost your internet connection. Some features may not be available until you're back online.
          </p>

          {/* Cached Content Info */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              What you can still do:
            </h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>• View previously loaded pages</li>
              <li>• Access cached content</li>
              <li>• Draft messages (will sync when online)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleRetry}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>

          {/* Connection Status */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/50 text-sm">
              Waiting for connection...
            </p>
            <div className="mt-2 flex justify-center gap-1">
              <motion.div
                className="w-2 h-2 bg-white/30 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-white/30 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-white/30 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </GlassmorphicPanel>
      </motion.div>
    </div>
  );
}
