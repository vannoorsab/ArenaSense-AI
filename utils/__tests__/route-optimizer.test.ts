/**
 * route-optimizer.test.ts
 * Jest tests for gate routing algorithm.
 */

import {
  identifyOptimalEntryGate,
  calculateEstimatedWaitTime,
  generateRouteRecommendation,
  optimizeAllGateRouting,
  type GateOption,
} from '../route-optimizer';

const mockGates: GateOption[] = [
  { id: 'g1', name: 'Gate A', currentQueue: 800, capacity: 100, widthMeters: 4, distanceMeters: 0, isEntryGate: true, isExitGate: false, isOpen: true },
  { id: 'g2', name: 'Gate B', currentQueue: 200, capacity: 100, widthMeters: 4, distanceMeters: 150, isEntryGate: true, isExitGate: false, isOpen: true },
  { id: 'g3', name: 'Gate C', currentQueue: 50, capacity: 80, widthMeters: 3, distanceMeters: 300, isEntryGate: true, isExitGate: false, isOpen: true },
  { id: 'g4', name: 'Gate D (Closed)', currentQueue: 0, capacity: 80, widthMeters: 3, distanceMeters: 400, isEntryGate: true, isExitGate: false, isOpen: false },
];

describe('identifyOptimalEntryGate', () => {
  test('returns open gate with shortest wait', () => {
    const best = identifyOptimalEntryGate(mockGates);
    expect(best?.id).not.toBe('g1'); // g1 has highest queue
    expect(best?.id).not.toBe('g4'); // g4 is closed
  });

  test('ignores closed gates', () => {
    const best = identifyOptimalEntryGate(mockGates);
    expect(best?.isOpen).toBe(true);
  });

  test('returns null when all gates closed', () => {
    const closed = mockGates.map(g => ({ ...g, isOpen: false }));
    expect(identifyOptimalEntryGate(closed)).toBeNull();
  });
});

describe('calculateEstimatedWaitTime', () => {
  test('calculates wait time correctly', () => {
    // 800 queue / 100 capacity = 8 minutes
    expect(calculateEstimatedWaitTime(mockGates[0])).toBe(8);
  });

  test('zero queue = zero wait', () => {
    const empty = { ...mockGates[0], currentQueue: 0 };
    expect(calculateEstimatedWaitTime(empty)).toBe(0);
  });
});

describe('generateRouteRecommendation', () => {
  test('primary gate is the input gate', () => {
    const rec = generateRouteRecommendation(mockGates[0], mockGates);
    expect(rec.primaryGate.id).toBe('g1');
  });

  test('suggests an alternate when available', () => {
    const rec = generateRouteRecommendation(mockGates[0], mockGates);
    expect(rec.alternateGate).toBeDefined();
    expect(rec.alternateGate?.id).not.toBe('g1');
  });

  test('generates a suggestion string', () => {
    const rec = generateRouteRecommendation(mockGates[0], mockGates);
    expect(rec.suggestion.length).toBeGreaterThan(0);
  });

  test('sets urgency for high queue gate', () => {
    const rec = generateRouteRecommendation(mockGates[0], mockGates);
    expect(['urgent', 'suggested', 'normal']).toContain(rec.urgency);
  });
});

describe('optimizeAllGateRouting', () => {
  test('only includes open gates', () => {
    const recs = optimizeAllGateRouting(mockGates);
    expect(recs).toHaveLength(3); // 3 open gates
  });

  test('sorted by ascending wait time', () => {
    const recs = optimizeAllGateRouting(mockGates);
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].waitMinutes).toBeLessThanOrEqual(recs[i + 1].waitMinutes);
    }
  });
});


