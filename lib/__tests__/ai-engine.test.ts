/**
 * ai-engine.test.ts
 * Jest tests for AIDecisionEngine recommendation and anomaly logic.
 */

import { AIDecisionEngine } from '../ai-engine';
import { User, CrowdData, AnomalyAlert } from '../types';

describe('AIDecisionEngine', () => {
  const mockUser: User = {
    id: 'u1',
    name: 'Test Visitor',
    currentZone: 'zone-a',
    preferences: {
      avoidCrowds: true,
      preferQuickestRoute: true,
      accessibility: false,
    },
    tickets: [],
  };

  const mockCrowdData = new Map<string, CrowdData>([
    ['zone-a', { zone: 'zone-a', currentCount: 500, capacity: 1000, density: 50, trend: 'stable', lastUpdate: Date.now() }],
    ['zone-b', { zone: 'zone-b', currentCount: 960, capacity: 1000, density: 96, trend: 'increasing', lastUpdate: Date.now() }],
  ]);

  test('detects overcrowding anomalies', () => {
    const alerts = AIDecisionEngine.detectAnomalies(mockCrowdData, []);
    const overcrowding = alerts.find(a => a.type === 'overcrowding');
    
    expect(overcrowding).toBeDefined();
    expect(overcrowding?.zone).toBe('zone-b');
    expect(overcrowding?.severity).toBe('critical');
  });

  test('generates emergency recommendation for critical alerts', () => {
    const alerts: AnomalyAlert[] = [
      {
        id: 'a1',
        type: 'overcrowding',
        severity: 'critical',
        zone: 'zone-a',
        message: 'Danger!',
        timestamp: Date.now(),
        affectedPeople: 1000,
        recommendedAction: 'Evacuate',
        escalated: true,
      }
    ];

    const rec = AIDecisionEngine.generateRecommendation(mockUser, mockCrowdData, [], [], alerts);
    expect(rec.type).toBe('safety');
    expect(rec.urgency).toBe('critical');
    expect(rec.action).toBe('move_to_emergency_zone');
  });

  test('generates navigation recommendation', () => {
    const rec = AIDecisionEngine.generateRecommendation(mockUser, mockCrowdData, [], [], [], 'zone-c');
    expect(rec.type).toBe('navigation');
    expect(rec.context.path).toBeDefined();
  });
});
