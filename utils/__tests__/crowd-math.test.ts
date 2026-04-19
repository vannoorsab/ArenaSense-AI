/**
 * crowd-math.test.ts
 * Jest test suite for crowd density math utilities.
 * Run with: npm test
 */

import { runCrowdMathTests, calcDensityLevel, predictCrowdIn, calcOptimalFlow, estimateWaitMinutes } from '../crowd-math';

describe('calcDensityLevel', () => {
  test('low density at 4% capacity', () => {
    const result = calcDensityLevel(2000, 50000);
    expect(result.level).toBe('low');
    expect(result.percentage).toBe(4);
  });

  test('medium density at 70% capacity', () => {
    const result = calcDensityLevel(35000, 50000);
    expect(result.level).toBe('medium');
  });

  test('high density at 88% capacity', () => {
    const result = calcDensityLevel(44000, 50000);
    expect(result.level).toBe('high');
  });

  test('critical at 98% capacity', () => {
    const result = calcDensityLevel(49000, 50000);
    expect(result.level).toBe('critical');
  });

  test('risk score increases non-linearly', () => {
    const low = calcDensityLevel(1000, 50000);
    const high = calcDensityLevel(45000, 50000);
    expect(high.riskScore).toBeGreaterThan(low.riskScore);
  });

  test('throws on zero capacity', () => {
    expect(() => calcDensityLevel(100, 0)).toThrow();
  });

  test('clamps crowd count to capacity', () => {
    const result = calcDensityLevel(60000, 50000);
    expect(result.crowdCount).toBe(50000);
    expect(result.percentage).toBe(100);
  });
});

describe('predictCrowdIn', () => {
  test('crowd grows with net positive flow', () => {
    const result = predictCrowdIn(1000, 100, 50, 10);
    expect(result).toBeGreaterThan(1000);
  });

  test('crowd shrinks with net negative flow', () => {
    const result = predictCrowdIn(5000, 20, 200, 15);
    expect(result).toBeLessThan(5000);
  });

  test('never returns negative crowd', () => {
    const result = predictCrowdIn(10, 0, 500, 60);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe('calcOptimalFlow', () => {
  test('returns positive flow for normal conditions', () => {
    expect(calcOptimalFlow(3, 0.5)).toBeGreaterThan(0);
  });

  test('higher density reduces flow', () => {
    const normalFlow = calcOptimalFlow(3, 0.5);
    const crowdedFlow = calcOptimalFlow(3, 3.5);
    expect(crowdedFlow).toBeLessThan(normalFlow);
  });
});

describe('estimateWaitMinutes', () => {
  test('600 queue / 100 per min = 6 mins', () => {
    expect(estimateWaitMinutes(600, 100)).toBe(6);
  });

  test('empty queue = 0 mins', () => {
    expect(estimateWaitMinutes(0, 100)).toBe(0);
  });

  test('zero flow rate = 999 mins', () => {
    expect(estimateWaitMinutes(600, 0)).toBe(999);
  });
});

describe('runCrowdMathTests', () => {
  test('all inline tests pass', () => {
    const { failed } = runCrowdMathTests();
    expect(failed).toBe(0);
  });
});
