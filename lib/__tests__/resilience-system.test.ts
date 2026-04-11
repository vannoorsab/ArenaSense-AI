/**
 * resilience-system.test.ts
 * Jest tests for offline caching and network monitoring.
 */

import { ResilienceSystem } from '../resilience-system';

describe('ResilienceSystem', () => {
  // Mock localStorage
  const localStorageMock = (function() {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();

  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
    localStorage.clear();
  });

  test('initializeCache stores data in localStorage', () => {
    const mockData = { venue: { id: 'stadium-1', name: 'Arena' } };
    ResilienceSystem.initializeCache(mockData);
    
    const cache = ResilienceSystem.getCache();
    expect(cache).toBeDefined();
    expect(cache?.zoneLayout.id).toBe('stadium-1');
  });

  test('updateDensityCache updates density values', () => {
    const mockData = { venue: { id: 'stadium-1' } };
    ResilienceSystem.initializeCache(mockData);
    
    const densityMap = new Map([['zone-1', 75], ['zone-2', 30]]);
    ResilienceSystem.updateDensityCache(densityMap);
    
    const cache = ResilienceSystem.getCache();
    expect(cache?.lastKnownDensity.get('zone-1')).toBe(75);
    expect(cache?.lastKnownDensity.get('zone-2')).toBe(30);
  });

  test('getOfflineRecommendation provides safe fallback', () => {
    const rec = ResilienceSystem.getOfflineRecommendation('zone-a', 'zone-b');
    expect(rec.context.offline).toBe(true);
    expect(rec.urgency).toBe('medium');
  });

  test('sync queue manages actions correctly', () => {
    const action = { type: 'report_issue', data: 'broken seat' };
    ResilienceSystem.addToSyncQueue(action);
    
    const queue = ResilienceSystem.getSyncQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].type).toBe('report_issue');
    
    ResilienceSystem.clearSyncQueue();
    expect(ResilienceSystem.getSyncQueue().length).toBe(0);
  });
});
