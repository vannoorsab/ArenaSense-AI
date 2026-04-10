import { BroadcastAlert } from './types';

/**
 * Real-Time Alert Synchronization (Admin → Users)
 * Uses localStorage + storage events for cross-tab pub/sub
 * Simulates Google Cloud Pub/Sub / Firebase Realtime DB behavior
 */

const STORAGE_KEY = 'arenahsense_broadcast_alerts';
const MAX_ALERTS = 10;
const DEFAULT_EXPIRY_MS = 30_000; // 30 seconds

export type AlertType = BroadcastAlert['type'];

export class AlertSync {
  /**
   * Broadcasts a new system alert to all active sessions.
   * (Simulated broadcast via localStorage synchronization)
   */
  static broadcastSystemAlert(
    message: string,
    type: AlertType = 'warning',
    options?: { gateAffected?: string; suggestion?: string; expiryMs?: number }
  ): BroadcastAlert {
    const now = Date.now();
    const alert: BroadcastAlert = {
      id: `alert-${now}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      type,
      gateAffected: options?.gateAffected,
      suggestion: options?.suggestion,
      timestamp: now,
      expiresAt: now + (options?.expiryMs ?? DEFAULT_EXPIRY_MS),
      sentByAdmin: true,
    };

    const existing = this.retrieveActiveAlerts();
    const updated = [alert, ...existing].slice(0, MAX_ALERTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch storage event manually for same-tab subscribers
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(updated),
    }));

    return alert;
  }

  /**
   * Retrieves all non-expired system alerts.
   */
  static retrieveActiveAlerts(): BroadcastAlert[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: BroadcastAlert[] = JSON.parse(raw);
      const now = Date.now();
      return parsed.filter(a => a.expiresAt > now);
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to new alerts (returns unsubscribe fn)
   */
  static subscribe(callback: (alerts: BroadcastAlert[]) => void): () => void {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        callback(this.retrieveActiveAlerts());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  /**
   * Dismiss a specific alert
   */
  static dismissAlert(alertId: string): void {
    const existing = this.retrieveActiveAlerts().filter(a => a.id !== alertId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(existing),
    }));
  }

  /**
   * Clear all alerts (admin action)
   */
  static clearAll(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify([]),
    }));
  }

  /**
   * Quick preset alerts for common scenarios
   */
  static presets = {
    gate2Overcrowded: () => AlertSync.broadcastSystemAlert(
      'Gate B (South Entry) is overcrowded. Please use Gate D (West Entry) for faster access.',
      'danger',
      { gateAffected: 'Gate B - South Entry', suggestion: 'Use Gate D - West Entry' }
    ),
    useAlternateExit: () => AlertSync.broadcastSystemAlert(
      'Exit via Gate H (West Exit) for faster movement. Gate E & F are congested.',
      'warning',
      { gateAffected: 'Gate E & F', suggestion: 'Use Gate H - West Exit' }
    ),
    emergency: () => AlertSync.broadcastSystemAlert(
      '🚨 EMERGENCY: Please follow staff instructions and proceed to the nearest safe exit immediately.',
      'emergency',
      { expiryMs: 120_000 }
    ),
    gateBlockage: () => AlertSync.broadcastSystemAlert(
      'Gate C (East Entry) is temporarily blocked. Please use Gate A (North Entry) or Gate B (South Entry).',
      'warning',
      { gateAffected: 'Gate C - East Entry', suggestion: 'Use Gate A or Gate B' }
    ),
  };
}
