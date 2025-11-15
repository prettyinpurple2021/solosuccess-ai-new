'use client';

import { useState, useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

interface UseOfflineDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  fallback?: T;
  cacheTime?: number; // in milliseconds
}

interface UseOfflineDataResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isStale: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for offline-aware data fetching with caching
 */
export function useOfflineData<T>({
  key,
  fetcher,
  fallback,
  cacheTime = 5 * 60 * 1000, // 5 minutes default
}: UseOfflineDataOptions<T>): UseOfflineDataResult<T> {
  const isOnline = useOnlineStatus();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const cacheKey = `offline-data-${key}`;
  const timestampKey = `offline-data-timestamp-${key}`;

  // Load from cache
  const loadFromCache = (): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(timestampKey);

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        const cachedData = JSON.parse(cached);

        // Check if cache is stale
        if (age > cacheTime) {
          setIsStale(true);
        }

        return cachedData;
      }
    } catch (error) {
      console.error('[useOfflineData] Failed to load from cache:', error);
    }

    return null;
  };

  // Save to cache
  const saveToCache = (value: T): void => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(value));
      localStorage.setItem(timestampKey, Date.now().toString());
      setIsStale(false);
    } catch (error) {
      console.error('[useOfflineData] Failed to save to cache:', error);
    }
  };

  // Fetch data
  const fetchData = async (): Promise<void> => {
    if (!isOnline) {
      // Load from cache when offline
      const cached = loadFromCache();
      if (cached) {
        setData(cached);
        setError(null);
      } else if (fallback) {
        setData(fallback);
        setError(null);
      } else {
        setError(new Error('No cached data available offline'));
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetcher();
      setData(result);
      saveToCache(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);

      // Try to load from cache on error
      const cached = loadFromCache();
      if (cached) {
        setData(cached);
        setIsStale(true);
      } else if (fallback) {
        setData(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    // Load from cache immediately
    const cached = loadFromCache();
    if (cached) {
      setData(cached);
      setIsLoading(false);
    }

    // Fetch fresh data
    fetchData();
  }, [key]);

  // Refetch when coming back online
  useEffect(() => {
    if (isOnline && isStale) {
      fetchData();
    }
  }, [isOnline]);

  return {
    data,
    error,
    isLoading,
    isStale,
    refetch: fetchData,
  };
}
