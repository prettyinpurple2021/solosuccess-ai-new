'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicPanel } from './GlassmorphicPanel';
import { Button } from './Button';
import {
  isAppInstalled,
  isInstallPromptAvailable,
  showInstallPrompt,
  setupInstallPrompt,
  isIOS,
} from '@/lib/utils/pwa';

export const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (isAppInstalled()) {
      return;
    }

    // Check if iOS
    setIsIOSDevice(isIOS());

    // Setup install prompt listener
    setupInstallPrompt(() => {
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    });

    // For iOS, show manual instructions after delay
    if (isIOS() && !isAppInstalled()) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOSDevice) {
      // iOS doesn't support programmatic install, just show instructions
      return;
    }

    const outcome = await showInstallPrompt();
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50"
        >
          <GlassmorphicPanel blur="strong" className="relative">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Icon */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-white font-semibold text-lg mb-1">
                  Install SoloSuccess AI
                </h3>
                <p className="text-white/70 text-sm">
                  {isIOSDevice
                    ? 'Add to your home screen for quick access'
                    : 'Install our app for a better experience with offline access'}
                </p>
              </div>
            </div>

            {/* iOS Instructions */}
            {isIOSDevice ? (
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-white/80 text-sm mb-2 font-medium">
                  To install on iOS:
                </p>
                <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
                  <li>Tap the Share button</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>
            ) : (
              /* Android/Desktop Install Button */
              <Button
                variant="gradient"
                size="md"
                className="w-full mb-2"
                onClick={handleInstall}
                disabled={!isInstallPromptAvailable()}
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Install App
              </Button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full text-center text-white/60 text-sm hover:text-white/80 transition-colors"
            >
              Maybe later
            </button>
          </GlassmorphicPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
