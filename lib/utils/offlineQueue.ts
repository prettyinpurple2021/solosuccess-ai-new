'use client';

/**
 * Offline queue for storing actions to be synced when online
 */

export interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = 'offline-action-queue';
const MAX_RETRIES = 3;

/**
 * Get all queued actions
 */
export function getQueuedActions(): QueuedAction[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('[OfflineQueue] Failed to get queued actions:', error);
    return [];
  }
}

/**
 * Add action to queue
 */
export function queueAction(type: string, data: any): string {
  const action: QueuedAction = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  const queue = getQueuedActions();
  queue.push(action);
  
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[OfflineQueue] Action queued:', action.id);
    return action.id;
  } catch (error) {
    console.error('[OfflineQueue] Failed to queue action:', error);
    throw error;
  }
}

/**
 * Remove action from queue
 */
export function removeQueuedAction(id: string): void {
  const queue = getQueuedActions();
  const filtered = queue.filter((action) => action.id !== id);
  
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    console.log('[OfflineQueue] Action removed:', id);
  } catch (error) {
    console.error('[OfflineQueue] Failed to remove action:', error);
  }
}

/**
 * Update action retry count
 */
export function incrementRetries(id: string): void {
  const queue = getQueuedActions();
  const action = queue.find((a) => a.id === id);
  
  if (action) {
    action.retries += 1;
    
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to update retries:', error);
    }
  }
}

/**
 * Process queued actions
 */
export async function processQueue(
  handler: (action: QueuedAction) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const queue = getQueuedActions();
  let processed = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      const success = await handler(action);
      
      if (success) {
        removeQueuedAction(action.id);
        processed++;
      } else {
        incrementRetries(action.id);
        
        // Remove if max retries reached
        if (action.retries >= MAX_RETRIES) {
          console.warn('[OfflineQueue] Max retries reached for action:', action.id);
          removeQueuedAction(action.id);
          failed++;
        }
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to process action:', action.id, error);
      incrementRetries(action.id);
      
      if (action.retries >= MAX_RETRIES) {
        removeQueuedAction(action.id);
        failed++;
      }
    }
  }

  return { processed, failed };
}

/**
 * Clear all queued actions
 */
export function clearQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
    console.log('[OfflineQueue] Queue cleared');
  } catch (error) {
    console.error('[OfflineQueue] Failed to clear queue:', error);
  }
}

/**
 * Get queue size
 */
export function getQueueSize(): number {
  return getQueuedActions().length;
}
