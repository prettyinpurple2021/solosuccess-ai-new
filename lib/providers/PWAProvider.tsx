'use client';

import React, { useEffect } from 'react';
import { registerServiceWorker, requestPersistentStorage } from '@/lib/utils/pwa';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Register service worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('[PWA] Service worker registered successfully');
        
        // Request persistent storage
        requestPersistentStorage().then((granted) => {
          if (granted) {
            console.log('[PWA] Persistent storage granted');
          }
        });
      }
    });

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[PWA] App is online');
      // You could show a toast notification here
    };

    const handleOffline = () => {
      console.log('[PWA] App is offline');
      // You could show a toast notification here
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
};
