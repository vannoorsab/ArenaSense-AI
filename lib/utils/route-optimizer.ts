/**
 * route-optimizer.ts
 * AI-driven gate routing and navigation optimization.
 * Uses weighted scoring to recommend the best gate for each attendee.
 */

import { calcDensityLevel, estimateWaitMinutes } from './crowd-math';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GateOption {
  id: string;
  name: string;
  currentQueue: number;
  capacity: number;       // people this gate can process per minute
  widthMeters: number;
  distanceMeters: number; // distance from main entrance
  isEntryGate: boolean;
  isExitGate: boolean;
  isOpen: boolean;
}

export interface RouteRecommendation {
  primaryGate: GateOption;
  alternateGate?: GateOption;
  waitMinutes: number;
  alternateWaitMinutes?: number;
  suggestion: string;
  urgency: 'normal' | 'suggested' | 'urgent';
  walkingExtraMinutes: number;
}

// ─── Scoring & Logic ─────────────────────────────────────────────────────────

/**
 * Score a gate for routing. Lower score = better.
 * Factors: queue wait, density, distance.
 */
function evaluateGatePriorityScore(gate: GateOption): number {
  if (!gate.isOpen) return Infinity;
  
  const waitScore = estimateWaitMinutes(gate.currentQueue, gate.capacity);
  const { riskScore } = calcDensityLevel(gate.currentQueue, gate.capacity * 10);
  const distanceScore = gate.distanceMeters / 100; // minor factor
  
  // Weighted sum - wait time is most important
  return waitScore * 5 + riskScore * 2 + distanceScore;
}

/**
 * Find the least crowded gate from available options.
 */
export function identifyOptimalEntryGate(gates: GateOption[]): GateOption | null {
  const open = gates.filter(g => g.isOpen);
  if (open.length === 0) return null;

  return open.reduce((best, gate) => 
    evaluateGatePriorityScore(gate) < evaluateGatePriorityScore(best) ? gate : best
  );
}

/**
 * Calculate wait time for a specific gate in minutes.
 */
export function calculateEstimatedWaitTime(gate: GateOption): number {
  return estimateWaitMinutes(gate.currentQueue, gate.capacity);
}

/**
 * Generate a full route recommendation with primary + alternate gate.
 */
export function generateRouteRecommendation(
  currentGate: GateOption,
  allGates: GateOption[],
): RouteRecommendation {
  const alternatives = allGates
    .filter(g => g.isOpen && g.id !== currentGate.id)
    .sort((a, b) => evaluateGatePriorityScore(a) - evaluateGatePriorityScore(b));

  const currentWait = calculateEstimatedWaitTime(currentGate);
  const bestAlternate = alternatives[0] ?? null;
  const alternateWait = bestAlternate ? calculateEstimatedWaitTime(bestAlternate) : null;

  // Determine urgency
  const { level } = calcDensityLevel(currentGate.currentQueue, currentGate.capacity * 10);
  let urgency: RouteRecommendation['urgency'] = 'normal';
  if (level === 'critical') urgency = 'urgent';
  else if (level === 'high') urgency = 'suggested';

  // Build suggestion text
  let suggestion = `${currentGate.name} — estimated wait ${currentWait} min.`;
  if (bestAlternate && alternateWait !== null && alternateWait < currentWait - 2) {
    const saved = currentWait - alternateWait;
    const extraWalk = Math.round((bestAlternate.distanceMeters - currentGate.distanceMeters) / 80);
    suggestion = `${currentGate.name} is ${level}. ` +
      `Try ${bestAlternate.name} — save ${saved} min wait` +
      (extraWalk > 0 ? ` (+${extraWalk} min walk).` : '.');
  }

  return {
    primaryGate: currentGate,
    alternateGate: bestAlternate ?? undefined,
    waitMinutes: currentWait,
    alternateWaitMinutes: alternateWait ?? undefined,
    suggestion,
    urgency,
    walkingExtraMinutes: bestAlternate
      ? Math.max(0, Math.round((bestAlternate.distanceMeters - currentGate.distanceMeters) / 80))
      : 0,
  };
}

/**
 * Batch optimize all gates: returns sorted recommendations for all open gates.
 */
export function optimizeAllGateRouting(gates: GateOption[]): RouteRecommendation[] {
  return gates
    .filter(g => g.isOpen)
    .map(gate => generateRouteRecommendation(gate, gates))
    .sort((a, b) => a.waitMinutes - b.waitMinutes);
}

// ─── End of File ───

