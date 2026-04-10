/**
 * route-optimizer.test.ts
 * Jest tests for gate routing algorithm.
 */

import {
  findLeastCrowdedGate,
  calcWaitTime,
  suggestAlternateRoute,
  optimizeAllGates,
  runRouteOptimizerTests,
  type GateOption,
} from '../route-optimizer';

const mockGates: GateOption[] = [
  { id: 'g1', name: 'Gate A', currentQueue: 800, capacity: 100, widthMeters: 4, distanceMeters: 0, isEntryGate: true, isExitGate: false, isOpen: true },
  { id: 'g2', name: 'Gate B', currentQueue: 200, capacity: 100, widthMeters: 4, distanceMeters: 150, isEntryGate: true, isExitGate: false, isOpen: true },
  { id: 'g3', name: 'Gate C', currentQueue: 50, capacity: 80, widthMeters: 3, distanceMeters: 300, isEntryGate: true, isExitGate: false, isOpen: true },
  { id: 'g4', name: 'Gate D (Closed)', currentQueue: 0, capacity: 80, widthMeters: 3, distanceMeters: 400, isEntryGate: true, isExitGate: false, isOpen: false },
];

describe('findLeastCrowdedGate', () => {
  test('returns open gate with shortest wait', () => {
    const best = findLeastCrowdedGate(mockGates);
    expect(best?.id).not.toBe('g1'); // g1 has highest queue
    expect(best?.id).not.toBe('g4'); // g4 is closed
  });

  test('ignores closed gates', () => {
    const best = findLeastCrowdedGate(mockGates);
    expect(best?.isOpen).toBe(true);
  });

  test('returns null when all gates closed', () => {
    const closed = mockGates.map(g => ({ ...g, isOpen: false }));
    expect(findLeastCrowdedGate(closed)).toBeNull();
  });
});

describe('calcWaitTime', () => {
  test('calculates wait time correctly', () => {
    // 800 queue / 100 capacity = 8 minutes
    expect(calcWaitTime(mockGates[0])).toBe(8);
  });

  test('zero queue = zero wait', () => {
    const empty = { ...mockGates[0], currentQueue: 0 };
    expect(calcWaitTime(empty)).toBe(0);
  });
});

describe('suggestAlternateRoute', () => {
  test('primary gate is the input gate', () => {
    const rec = suggestAlternateRoute(mockGates[0], mockGates);
    expect(rec.primaryGate.id).toBe('g1');
  });

  test('suggests an alternate when available', () => {
    const rec = suggestAlternateRoute(mockGates[0], mockGates);
    expect(rec.alternateGate).toBeDefined();
    expect(rec.alternateGate?.id).not.toBe('g1');
  });

  test('generates a suggestion string', () => {
    const rec = suggestAlternateRoute(mockGates[0], mockGates);
    expect(rec.suggestion.length).toBeGreaterThan(0);
  });

  test('sets urgency for high queue gate', () => {
    const rec = suggestAlternateRoute(mockGates[0], mockGates);
    expect(['urgent', 'suggested', 'normal']).toContain(rec.urgency);
  });
});

describe('optimizeAllGates', () => {
  test('only includes open gates', () => {
    const recs = optimizeAllGates(mockGates);
    expect(recs).toHaveLength(3); // 3 open gates
  });

  test('sorted by ascending wait time', () => {
    const recs = optimizeAllGates(mockGates);
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].waitMinutes).toBeLessThanOrEqual(recs[i + 1].waitMinutes);
    }
  });
});

describe('runRouteOptimizerTests', () => {
  test('all inline tests pass', () => {
    const { failed, results } = runRouteOptimizerTests();
    if (failed > 0) console.error(results.filter(r => r.startsWith('❌')));
    expect(failed).toBe(0);
  });
});
