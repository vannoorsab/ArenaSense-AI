/**
 * stadium-service.ts
 * Centralized service layer for stadium data access.
 * Abstracts gate management and stadium layout data.
 */

import { GateService } from './gate-service';
import { CSK_MATCHES, type CSKMatch } from '../data/csk-matches';
import { IPL_STADIUMS } from '../data/ipl-stadiums';
import { calcDensityLevel, type DensityResult } from '../utils/crowd-math';
import { identifyOptimalEntryGate, type GateOption } from '../utils/route-optimizer';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StadiumSection {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  density: DensityResult;
  position: 'north' | 'south' | 'east' | 'west' | 'pavilion' | 'vip';
}

export interface StadiumStatus {
  matchId: string;
  stadiumId: string;
  stadiumName: string;
  totalCapacity: number;
  totalAttendees: number;
  overallDensity: DensityResult;
  sections: StadiumSection[];
  gateStatuses: GateData[];
  recommendedGate: string | null;
  timestamp: number;
}

// ─── Stadium sections per stadium ID ─────────────────────────────────────────

const STADIUM_SECTIONS: Record<string, Omit<StadiumSection, 'currentCount' | 'density'>[]> = {
  chepauk: [
    { id: 'anna-pavilion', name: 'Anna Pavilion', capacity: 8000, position: 'west' },
    { id: 'i-stand', name: 'I Stand', capacity: 12000, position: 'north' },
    { id: 'j-stand', name: 'J Stand', capacity: 12000, position: 'south' },
    { id: 'oh-stand', name: 'O/H Stand', capacity: 10000, position: 'east' },
    { id: 'vip-box', name: 'VIP Box', capacity: 800, position: 'vip' },
    { id: 'media-box', name: 'Media Box', capacity: 200, position: 'pavilion' },
  ],
  chinnaswamy: [
    { id: 'ksca-pavilion', name: 'KSCA Pavilion', capacity: 6000, position: 'west' },
    { id: 'p-stand', name: 'P Stand', capacity: 10000, position: 'north' },
    { id: 'q-stand', name: 'Q Stand', capacity: 10000, position: 'south' },
    { id: 'rs-stand', name: 'R/S Stand', capacity: 8000, position: 'east' },
    { id: 'vip-box', name: 'VIP Suite', capacity: 600, position: 'vip' },
  ],
  'rajiv-gandhi': [
    { id: 'east-pavilion', name: 'East Pavilion', capacity: 15000, position: 'east' },
    { id: 'west-pavilion', name: 'West Pavilion', capacity: 15000, position: 'west' },
    { id: 'north-stand', name: 'North Stand', capacity: 12000, position: 'north' },
    { id: 'south-stand', name: 'South Stand', capacity: 8000, position: 'south' },
    { id: 'vip-enclosure', name: 'VIP Enclosure', capacity: 1000, position: 'vip' },
  ],
};

// Default fallback sections
const DEFAULT_SECTIONS: Omit<StadiumSection, 'currentCount' | 'density'>[] = [
  { id: 'north', name: 'North Stand', capacity: 10000, position: 'north' },
  { id: 'south', name: 'South Stand', capacity: 10000, position: 'south' },
  { id: 'east', name: 'East Stand', capacity: 8000, position: 'east' },
  { id: 'west', name: 'West Stand', capacity: 8000, position: 'west' },
  { id: 'vip', name: 'VIP Box', capacity: 500, position: 'vip' },
];

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Get the CSK match object by ID.
 */
export function getMatchById(matchId: string): CSKMatch | null {
  return CSK_MATCHES.find(m => m.id === matchId) ?? null;
}

/**
 * Get stadium config from ipl-stadiums data.
 */
export function getStadiumConfig(stadiumId: string) {
  return IPL_STADIUMS.find(s => s.id === stadiumId) ?? null;
}

/**
 * Get complete stadium status for a given match, including AI-simulated crowd data.
 */
export function getMatchStadiumStatus(matchId: string, scenario = 'normal'): StadiumStatus | null {
  const match = getMatchById(matchId);
  if (!match) return null;

  const { stadiumId, capacity, registeredCount } = match;
  const sectionDefs = STADIUM_SECTIONS[stadiumId] ?? DEFAULT_SECTIONS;

  // Simulate crowd distribution with some randomness per section
  const seed = Date.now() % 10000;
  const sections: StadiumSection[] = sectionDefs.map((def, i) => {
    const baseRatio = (registeredCount / capacity);
    const variance = ((seed * (i + 1)) % 20 - 10) / 100; // ±10% variance per section
    const sectionRatio = Math.min(0.99, Math.max(0.05, baseRatio + variance));
    const currentCount = Math.round(def.capacity * sectionRatio);
    return {
      ...def,
      currentCount,
      density: calcDensityLevel(currentCount, def.capacity),
    };
  });

  const totalAttendees = sections.reduce((sum, s) => sum + s.currentCount, 0);
  const overallDensity = calcDensityLevel(totalAttendees, capacity);

  // Get gate statuses from gate service
  const gateStatuses = GateService.getUpdatedGates(null, scenario);

  // Find best gate using route optimizer
  const gateOptions: GateOption[] = gateStatuses.map(g => ({
    id: g.id,
    name: g.name,
    currentQueue: Math.round(g.density * 500),
    capacity: g.type === 'entry' ? 100 : 80,
    widthMeters: 4,
    distanceMeters: 0,
    isEntryGate: g.type === 'entry',
    isExitGate: g.type === 'exit',
    isOpen: g.status !== 'closed',
  }));

  const bestGate = identifyOptimalEntryGate(gateOptions.filter(g => g.isEntryGate));

  return {
    matchId,
    stadiumId,
    stadiumName: match.venue,
    totalCapacity: capacity,
    totalAttendees,
    overallDensity,
    sections,
    gateStatuses,
    recommendedGate: bestGate?.name ?? null,
    timestamp: Date.now(),
  };
}

/**
 * Get section densities only (lightweight for heatmap rendering).
 */
export function getSectionDensities(matchId: string): StadiumSection[] {
  const status = getMatchStadiumStatus(matchId);
  return status?.sections ?? [];
}
