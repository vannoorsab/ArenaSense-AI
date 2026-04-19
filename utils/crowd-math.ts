/**
 * crowd-math.ts
 * Core mathematical utilities for crowd density analysis.
 * Used by AI engine and gate management system.
 * 
 * All functions are pure and testable (no side effects).
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DensityResult {
  level: DensityLevel;
  percentage: number;       // 0–100
  crowdCount: number;
  capacityUsed: number;     // 0.0–1.0
  riskScore: number;        // 0–10
}

export interface FlowPrediction {
  estimatedInflow: number;  // people/minute
  estimatedOutflow: number;
  netChange: number;
  peakMinutesFromNow: number;
  confidencePercent: number;
}

// ─── Thresholds ─────────────────────────────────────────────────────────────

const DENSITY_THRESHOLDS = {
  medium: 0.5,  // >= 50% capacity = medium
  high: 0.75,   // >= 75% = high
  critical: 0.9 // >= 90% = critical
} as const;

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Calculate the density level for a given crowd count vs capacity.
 */
export function calcDensityLevel(crowdCount: number, capacity: number): DensityResult {
  if (capacity <= 0) throw new Error('Capacity must be > 0');
  const safe = Math.max(0, Math.min(crowdCount, capacity));
  const ratio = safe / capacity;
  const percentage = Math.round(ratio * 100);

  let level: DensityLevel = 'low';
  if (ratio >= DENSITY_THRESHOLDS.critical) level = 'critical';
  else if (ratio >= DENSITY_THRESHOLDS.high) level = 'high';
  else if (ratio >= DENSITY_THRESHOLDS.medium) level = 'medium';

  // Risk score: 0–10 scale, non-linear (exponential near capacity)
  const riskScore = Math.min(10, Math.round(Math.pow(ratio, 1.8) * 10 * 10) / 10);

  return { level, percentage, crowdCount: safe, capacityUsed: ratio, riskScore };
}

/**
 * Predict crowd count N minutes into the future using exponential smoothing.
 * @param currentCount - current crowd
 * @param inflowRate   - people arriving per minute
 * @param outflowRate  - people leaving per minute
 * @param minutesAhead - how far ahead to predict
 */
export function predictCrowdIn(
  currentCount: number,
  inflowRate: number,
  outflowRate: number,
  minutesAhead: number,
): number {
  // Apply decay factor: crowds tend to stabilize
  const netRate = inflowRate - outflowRate;
  const decayFactor = Math.exp(-0.02 * minutesAhead); // smoothing over time
  const projected = currentCount + netRate * minutesAhead * decayFactor;
  return Math.max(0, Math.round(projected));
}

/**
 * Calculate optimal crowd flow rate for a gate given its width and density.
 * Based on Fruin pedestrian level of service model.
 * @param gateWidthMeters - gate width in meters
 * @param density - people per square meter (0.1 = sparse, 4.0 = crush)
 * @returns optimal flow rate in persons per minute
 */
export function calcOptimalFlow(gateWidthMeters: number, density: number): number {
  // Fruin model: flow = width × specific_flow
  // Specific flow reduces quadratically with density
  const baseFlowPerMeter = 40; // persons/min/meter at low density
  const densityPenalty = Math.max(0, 1 - (density / 4) ** 2);
  return Math.round(gateWidthMeters * baseFlowPerMeter * densityPenalty);
}

/**
 * Estimate wait time in minutes for a gate queue.
 */
export function estimateWaitMinutes(queueLength: number, flowRate: number): number {
  if (flowRate <= 0) return 999;
  return Math.ceil(queueLength / flowRate);
}

/**
 * Calculate crowd flow prediction for the next 30 minutes.
 */
export function calcFlowPrediction(
  currentCount: number,
  capacity: number,
  matchPhase: 'pre-match' | 'live' | 'post-match',
): FlowPrediction {
  const phaseRates = {
    'pre-match': { inflow: 450, outflow: 20, peakAt: 20 },
    'live':      { inflow: 80,  outflow: 50,  peakAt: 60 },
    'post-match':{ inflow: 10,  outflow: 600, peakAt: 5  },
  };

  const { inflow, outflow, peakAt } = phaseRates[matchPhase];
  const capacityFactor = 1 - (currentCount / capacity);
  const adjustedInflow = Math.round(inflow * Math.max(0.1, capacityFactor));
  const netChange = adjustedInflow - outflow;

  // Confidence decreases the further we predict
  const confidencePercent = Math.max(40, 95 - peakAt);

  return {
    estimatedInflow: adjustedInflow,
    estimatedOutflow: outflow,
    netChange,
    peakMinutesFromNow: peakAt,
    confidencePercent,
  };
}

// ─── Inline Tests (exported for Jest) ───────────────────────────────────────

/**
 * Run basic sanity tests for crowd math functions.
 * Returns true if all pass.
 */
export function runCrowdMathTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${name}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${name}`);
    }
  }

  // Test calcDensityLevel
  const lowResult = calcDensityLevel(2000, 50000);
  assert(lowResult.level === 'low', 'calcDensityLevel: 4% = low');

  const medResult = calcDensityLevel(35000, 50000);
  assert(medResult.level === 'medium', 'calcDensityLevel: 70% = medium');

  const highResult = calcDensityLevel(44000, 50000);
  assert(highResult.level === 'high', 'calcDensityLevel: 88% = high');

  const critResult = calcDensityLevel(49000, 50000);
  assert(critResult.level === 'critical', 'calcDensityLevel: 98% = critical');

  assert(lowResult.riskScore < highResult.riskScore, 'riskScore: low < high');

  // Test predictCrowdIn
  const pred = predictCrowdIn(1000, 100, 50, 10);
  assert(pred > 1000, 'predictCrowdIn: crowd grows with net positive flow');

  const pred2 = predictCrowdIn(5000, 20, 200, 15);
  assert(pred2 < 5000, 'predictCrowdIn: crowd shrinks with net negative flow');

  // Test calcOptimalFlow
  const flow = calcOptimalFlow(3, 0.5);
  assert(flow > 0, 'calcOptimalFlow: produces positive flow');
  const crowdedFlow = calcOptimalFlow(3, 3.5);
  assert(crowdedFlow < flow, 'calcOptimalFlow: higher density = lower flow');

  // Test estimateWaitMinutes
  assert(estimateWaitMinutes(600, 100) === 6, 'estimateWaitMinutes: 600 queue / 100/min = 6 min');
  assert(estimateWaitMinutes(0, 100) === 0, 'estimateWaitMinutes: empty queue = 0');

  return { passed, failed, results };
}
