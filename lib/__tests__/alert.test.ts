import { AlertService } from '../services/alert-service';

// Mock environment for JSDOM-like behavior in Node
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'window', { value: { dispatchEvent: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() } });

describe('AlertService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('✅ broadcast(): stores and serializes alert correctly', () => {
    const msg = 'GATE B CONGESTED';
    const alert = AlertService.broadcast(msg, 'warning', { expiryMs: 10000 });
    
    expect(alert.message).toBe(msg);
    expect(alert.type).toBe('warning');
    expect(alert.expiresAt).toBeGreaterThan(Date.now());
    
    const active = AlertService.getActiveAlerts();
    expect(active.length).toBe(1);
    expect(active[0].id).toBe(alert.id);
  });

  test('✅ AI logic: triggerAiAlert() creates appropriate severity levels', () => {
    // Stage 1: Critical
    const critical = AlertService.triggerAiAlert('Main Entrance', 95);
    expect(critical?.type).toBe('danger');
    expect(critical?.message).toContain('Dangerous');

    // Stage 2: Warning
    const warning = AlertService.triggerAiAlert('Concourse', 75);
    expect(warning?.type).toBe('warning');
    expect(warning?.message).toContain('Congestion');

    // Stage 3: Clear
    const none = AlertService.triggerAiAlert('Seating', 20);
    expect(none).toBeNull();
  });

  test('✅ dismissal: removes alert from active list', () => {
    const a1 = AlertService.broadcast('Alert 1');
    const a2 = AlertService.broadcast('Alert 2');
    
    expect(AlertService.getActiveAlerts().length).toBe(2);
    AlertService.dismiss(a1.id);
    expect(AlertService.getActiveAlerts().length).toBe(1);
    expect(AlertService.getActiveAlerts()[0].id).toBe(a2.id);
  });

  test('🛡️ security: handles invalid message types gracefully', () => {
    // The service now has a try/catch and returns a placeholder or throws
    const result = AlertService.broadcast(null as any);
    expect(result.message).toContain('Alert system error');
  });

  test('⚡ performance: limits alert count to prevent memory bloat', () => {
    for (let i = 0; i < 20; i++) {
      AlertService.broadcast(`Alert ${i}`);
    }
    const active = AlertService.getActiveAlerts();
    expect(active.length).toBeLessThanOrEqual(15); // Handled by MAX_ALERTS
  });
});
