import { GateData, GateSuggestion, GateStatus } from './types';
export type { GateData, GateSuggestion, GateStatus };

/**
 * Gate Crowd Management System
 * Tracks 8 gates (4 entry + 4 exit) and generates smart suggestions
 */

export const GATES_CONFIG: Omit<GateData, 'currentCount' | 'density' | 'status' | 'trend' | 'waitTimeMinutes' | 'timestamp'>[] = [
  // Entry Gates
  { id: 'entry-north', name: 'Gate A - North Entry', type: 'entry', sector: 'north', capacity: 5000, isOpen: true },
  { id: 'entry-south', name: 'Gate B - South Entry', type: 'entry', sector: 'south', capacity: 5000, isOpen: true },
  { id: 'entry-east',  name: 'Gate C - East Entry',  type: 'entry', sector: 'east',  capacity: 4000, isOpen: true },
  { id: 'entry-west',  name: 'Gate D - West Entry',  type: 'entry', sector: 'west',  capacity: 4000, isOpen: true },
  // Exit Gates
  { id: 'exit-north',  name: 'Gate E - North Exit',  type: 'exit',  sector: 'north', capacity: 6000, isOpen: true },
  { id: 'exit-south',  name: 'Gate F - South Exit',  type: 'exit',  sector: 'south', capacity: 6000, isOpen: true },
  { id: 'exit-east',   name: 'Gate G - East Exit',   type: 'exit',  sector: 'east',  capacity: 5000, isOpen: true },
  { id: 'exit-west',   name: 'Gate H - West Exit',   type: 'exit',  sector: 'west',  capacity: 5000, isOpen: true },
];

const SUGGESTION_PAIRS: Record<string, string> = {
  'entry-north': 'entry-east',
  'entry-south': 'entry-west',
  'entry-east':  'entry-north',
  'entry-west':  'entry-south',
  'exit-north':  'exit-east',
  'exit-south':  'exit-west',
  'exit-east':   'exit-north',
  'exit-west':   'exit-south',
};

function mapDensityToLevelOfService(density: number): GateStatus {
  if (density >= 75) return 'high';
  if (density >= 45) return 'medium';
  return 'low';
}

function calculateEstimatedWaitTime(density: number): number {
  if (density >= 75) return Math.round(10 + (density - 75) * 0.6);
  if (density >= 45) return Math.round(3 + (density - 45) * 0.23);
  return Math.max(1, Math.round(density * 0.07));
}

export class GateManager {
  private static lastDensities: Record<string, number> = {};

  static getGates(scenario: string = 'normal'): GateData[] {
    const gates = this.initializeGates(scenario as any);
    const suggestions = this.generateSuggestions(gates);
    return gates.map(gate => {
      const suggestion = suggestions.find(s => s.fromGate === gate.name);
      return {
        ...gate,
        suggestion: suggestion ? `Use ${suggestion.toGate} for faster movement.` : undefined
      };
    });
  }

  static initializeGates(scenario: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge' | 'high' | 'peak' | 'emergency' = 'normal'): GateData[] {
    const now = Date.now();
    return GATES_CONFIG.map(cfg => {
      const density = this.getIdealScenarioDensity(cfg.id, scenario);
      this.lastDensities[cfg.id] = density;
      return {
        ...cfg,
        density,
        currentCount: Math.round((density / 100) * cfg.capacity),
        status: cfg.isOpen ? mapDensityToLevelOfService(density) : 'closed',
        trend: 'stable',
        waitTimeMinutes: calculateEstimatedWaitTime(density),
        timestamp: now,
      };
    });
  }

  /**
   * Performs a transition step for gate density, simulating realistic crowd flow.
   */
  static updateGateStateTransitions(
    gates: GateData[],
    scenario: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge' = 'normal'
  ): GateData[] {
    const now = Date.now();
    return gates.map(gate => {
      const target = this.getIdealScenarioDensity(gate.id, scenario);
      const prev = gate.density;
      // Gradual drift toward target with small random variance
      const drift = (target - prev) * 0.08 + (Math.random() - 0.5) * 4;
      let density = Math.max(0, Math.min(100, prev + drift));

      const trend: GateData['trend'] =
        density > prev + 1.5 ? 'increasing' : density < prev - 1.5 ? 'decreasing' : 'stable';

      return {
        ...gate,
        density,
        currentCount: Math.round((density / 100) * gate.capacity),
        status: gate.isOpen ? mapDensityToLevelOfService(density) : 'closed',
        trend,
        waitTimeMinutes: calculateEstimatedWaitTime(density),
        timestamp: now,
      };
    });
  }

  private static getIdealScenarioDensity(gateId: string, scenario: string): number {
    const rand = () => Math.random() * 12 - 6;
    const base: Record<string, Record<string, number>> = {
      normal: {
        'entry-north': 30, 'entry-south': 25, 'entry-east': 20, 'entry-west': 18,
        'exit-north':   8,  'exit-south':  6,  'exit-east':  5,  'exit-west':  5,
      },
      entry_rush: {
        'entry-north': 82, 'entry-south': 78, 'entry-east': 65, 'entry-west': 59,
        'exit-north':   5,  'exit-south':  4,  'exit-east':  4,  'exit-west':  4,
      },
      halftime: {
        'entry-north': 40, 'entry-south': 38, 'entry-east': 35, 'entry-west': 30,
        'exit-north':  20,  'exit-south': 18,  'exit-east': 15,  'exit-west': 14,
      },
      exit_surge: {
        'entry-north':  5, 'entry-south':  4, 'entry-east':  4, 'entry-west':  3,
        'exit-north':  88, 'exit-south':  85, 'exit-east':  72, 'exit-west':  68,
      },
    };
    const scenarioBase = base[scenario] || base.normal;
    return Math.max(0, Math.min(100, (scenarioBase[gateId] ?? 20) + rand()));
  }

  static generateSuggestions(gates: GateData[]): GateSuggestion[] {
    const suggestions: GateSuggestion[] = [];
    const gateMap = new Map(gates.map(g => [g.id, g]));

    gates.forEach(gate => {
      if (gate.status === 'high' || gate.status === 'medium') {
        const altGateId = SUGGESTION_PAIRS[gate.id];
        const altGate = altGateId ? gateMap.get(altGateId) : undefined;
        if (altGate && altGate.status === 'low') {
          suggestions.push({
            fromGate: gate.name,
            toGate: altGate.name,
            reason: gate.status === 'high'
              ? `${gate.name.split(' - ')[1]} is severely crowded`
              : `${gate.name.split(' - ')[1]} is getting busy`,
            timeSavedMinutes: gate.waitTimeMinutes - altGate.waitTimeMinutes,
            urgency: gate.status === 'high' ? 'critical' : 'warning',
          });
        }
      }
    });
    return suggestions;
  }
}
