/**
 * Resilience & Low-Network Handling Module
 * Supports offline operation with cached data and graceful degradation
 */

export interface CachedData {
  routes: Map<string, string[]>;
  zoneLayout: any;
  lastKnownDensity: Map<string, number>;
  timestamp: number;
}

export class ResilienceSystem {
  private static cacheKey = 'stadium-resilience-cache';
  private static networkStatusKey = 'stadium-network-status';

  /**
   * Initialize offline cache with essential data
   */
  static initializeCache(data: any): void {
    try {
      const cacheData: CachedData = {
        routes: new Map(),
        zoneLayout: data.venue,
        lastKnownDensity: new Map(),
        timestamp: Date.now(),
      };

      localStorage.setItem(this.cacheKey, JSON.stringify({
        ...cacheData,
        lastKnownDensity: Array.from(cacheData.lastKnownDensity.entries()),
        routes: Array.from(cacheData.routes.entries()),
      }));
    } catch (e) {
      console.warn('Failed to initialize cache:', e);
    }
  }

  /**
   * Save crowd density snapshot for offline use
   */
  static updateDensityCache(crowdData: Map<string, number>): void {
    try {
      const cached = this.getCache();
      if (cached) {
        cached.lastKnownDensity = crowdData;
        cached.timestamp = Date.now();

        localStorage.setItem(this.cacheKey, JSON.stringify({
          ...cached,
          lastKnownDensity: Array.from(crowdData.entries()),
          routes: Array.from(cached.routes.entries()),
        }));
      }
    } catch (e) {
      console.warn('Failed to update density cache:', e);
    }
  }

  /**
   * Retrieve cached data
   */
  static getCache(): CachedData | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        routes: new Map(parsed.routes || []),
        lastKnownDensity: new Map(parsed.lastKnownDensity || []),
      };
    } catch (e) {
      console.warn('Failed to retrieve cache:', e);
      return null;
    }
  }

  /**
   * Check network status
   */
  static getNetworkStatus(): 'online' | 'offline' | 'low-bandwidth' {
    if (typeof navigator === 'undefined') return 'offline';

    if (!navigator.onLine) return 'offline';

    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType) {
      if (connection.effectiveType === '4g') return 'online';
      if (connection.effectiveType === '3g' || connection.saveData) return 'low-bandwidth';
    }

    return 'online';
  }

  /**
   * Get recommended UI mode based on network
   */
  static getUIMode(): 'full' | 'lite' | 'offline' {
    const status = this.getNetworkStatus();

    if (status === 'offline') return 'offline';
    if (status === 'low-bandwidth') return 'lite';
    return 'full';
  }

  /**
   * Fallback route using cached data
   */
  static getCachedRoute(start: string, end: string): string[] {
    const cache = this.getCache();
    if (!cache) return [start];

    // Simple fallback: return known path or direct
    const cacheKey = `${start}-${end}`;
    const cached = cache.routes.get(cacheKey);
    if (cached) return cached;

    // Return direct fallback
    return [start, end];
  }

  /**
   * Get fallback crowd density from cache
   */
  static getCachedDensity(zone: string): number {
    const cache = this.getCache();
    if (!cache) return 50; // Safe middle estimate

    const density = cache.lastKnownDensity.get(zone);
    return density || 50;
  }

  /**
   * Generate offline-friendly recommendation
   */
  static getOfflineRecommendation(currentZone: string, targetZone: string) {
    const cachedDensity = this.getCachedDensity(currentZone);
    const targetDensity = this.getCachedDensity(targetZone);

    return {
      type: 'navigation',
      title: 'Cached Recommendation',
      description:
        targetDensity < cachedDensity
          ? `Based on last known data, ${targetZone} is less crowded. Moving there is recommended.`
          : `No real-time data available. Navigate to your destination: ${targetZone}.`,
      action: `navigate_to:${targetZone}`,
      urgency: 'medium' as const,
      confidence: 60,
      context: {
        offline: true,
        cachedData: true,
        lastUpdate: this.getCache()?.timestamp,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Handle network changes gracefully
   */
  static setupNetworkListener(onStatusChange: (status: 'online' | 'offline') => void): () => void {
    const handleOnline = () => onStatusChange('online');
    const handleOffline = () => onStatusChange('offline');

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {};
  }

  /**
   * Compress data for low-bandwidth scenarios
   */
  static compressData(data: any): string {
    // Simple compression: remove unnecessary whitespace and nested objects
    return JSON.stringify(data).replace(/\s+/g, '');
  }

  /**
   * Request data with timeout for low-bandwidth
   */
  static async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 5000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Sync queued actions when network is restored
   */
  static getSyncQueue(): any[] {
    try {
      const queue = localStorage.getItem('stadium-sync-queue');
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }

  static addToSyncQueue(action: any): void {
    try {
      const queue = this.getSyncQueue();
      queue.push({
        ...action,
        queuedAt: Date.now(),
      });
      localStorage.setItem('stadium-sync-queue', JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to queue action:', e);
    }
  }

  static clearSyncQueue(): void {
    try {
      localStorage.removeItem('stadium-sync-queue');
    } catch (e) {
      console.warn('Failed to clear sync queue:', e);
    }
  }
}
