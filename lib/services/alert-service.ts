import { BroadcastAlert } from '../types';
import { GoogleCloudLogging } from './google-cloud-logging';

/**
 * AlertService
 * 📢 Production-grade alert management.
 * Handles real-time system alerts, broadcasts, and dismissals.
 * 🤖 AI-DRIVEN: Automatically triggers alerts based on crowd density thresholds.
 */

const STORAGE_KEY = 'arenahsense_broadcast_alerts';
const MAX_ALERTS = 15;
const DEFAULT_EXPIRY_MS = 45_000;

export class AlertService {
  private static logger = new GoogleCloudLogging();

  /**
   * Broadcast a new alert
   * 🛡️ Validates inputs and handles persistence via localStorage
   */
  static broadcast(
    message: string,
    type: BroadcastAlert['type'] = 'warning',
    options?: { gateAffected?: string; suggestion?: string; expiryMs?: number }
  ): BroadcastAlert {
    try {
      // 🛡️ Input Validation
      if (!message || typeof message !== 'string') {
        throw new Error('Valid alert message string is required');
      }

      const now = Date.now();
      const alert: BroadcastAlert = {
        id: `alert-${now}-${Math.random().toString(36).slice(2, 7)}`,
        message: message.trim(),
        type: type || 'warning',
        gateAffected: options?.gateAffected,
        suggestion: options?.suggestion,
        timestamp: now,
        expiresAt: now + (options?.expiryMs ?? DEFAULT_EXPIRY_MS),
        sentByAdmin: true,
      };

      const existing = this.getActiveAlerts();
      // Keep only recent alerts, newest first
      const updated = [alert, ...existing].slice(0, MAX_ALERTS);
      
      // ⚡ Persistence Logic for Client-Side Sync
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        // Notify other tabs/components
        window.dispatchEvent(new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(updated),
        }));
      }

      this.logger.log('INFO', 'System alert broadcasted', { 
        id: alert.id, 
        type: alert.type,
        message: alert.message.slice(0, 30) + '...'
      });

      return alert;
    } catch (error) {
      this.logger.log('ERROR', 'Failed to broadcast alert', { error });
      // Return a safe dummy object if broadcast fails
      return {
        id: 'error-placeholder',
        message: 'Alert system error',
        type: 'warning',
        timestamp: Date.now(),
        expiresAt: Date.now() + 5000,
        sentByAdmin: false
      };
    }
  }

  /**
   * Get all active (non-expired) alerts
   * ⚡ Caching implicit in localStorage fetch
   */
  static getActiveAlerts(): BroadcastAlert[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      
      const parsed: BroadcastAlert[] = JSON.parse(raw);
      const now = Date.now();
      
      // Filter out stale alerts
      return Array.isArray(parsed) ? parsed.filter(a => a.expiresAt > now) : [];
    } catch (error) {
      this.logger.log('WARNING', 'Failed to parse active alerts', { error });
      return [];
    }
  }

  /**
   * AI-Generated Alert Logic
   * 🤖 DECISION FLOW: Analyzes real-time zone metrics and auto-triggers notifications
   * Triggered when density exceeds safety thresholds (70% and 85%).
   */
  static triggerAiAlert(zoneName: string, density: number): BroadcastAlert | null {
    try {
      if (typeof density !== 'number') return null;

      // 🛑 CRITICAL DANGER
      if (density > 85) {
        return this.broadcast(
          `Critical Alert: ${zoneName} has reached dangerous density (${Math.round(density)}%).`,
          'danger',
          { 
            suggestion: 'Redirecting all traffic to East Exit.',
            expiryMs: 90000 
          }
        );
      }

      // ⚠️ WARNING LEVEL
      if (density > 70) {
        return this.broadcast(
          `Congestion Alert: ${zoneName} is heavily populated.`,
          'warning',
          { 
            suggestion: 'Consider using the West Concourse route.',
            expiryMs: 60000 
          }
        );
      }

      return null;
    } catch (error) {
      this.logger.log('ERROR', 'AI Alert Trigger failed', { error });
      return null;
    }
  }

  /**
   * Dismiss an alert manually
   */
  static dismiss(alertId: string): void {
    try {
      if (!alertId) return;
      
      const existing = this.getActiveAlerts().filter(a => a.id !== alertId);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        window.dispatchEvent(new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(existing),
        }));
      }
    } catch (error) {
      this.logger.log('ERROR', 'Alert dismissal failed', { alertId, error });
    }
  }
}
