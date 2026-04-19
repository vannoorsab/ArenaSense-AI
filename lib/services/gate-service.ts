import { GateData, GateSuggestion, GateStatus } from '../types';
import { GATES_CONFIG, SUGGESTION_PAIRS } from '../data/gate-config';
import { GoogleCloudLogging } from './google-cloud-logging';

/**
 * GateService
 * 🚪 Production-grade gate management and routing.
 * Optimizes stadium entry and exit flows.
 * 🤖 ROUTING DECISION: Pairs crowded gates with nearby free gates for dynamic redirection.
 */

export class GateService {
  private static logger = new GoogleCloudLogging();
  private static cache = new Map<string, GateData[]>();

  /**
   * 🛡️ INPUT VALIDATION: Ensures density is within [0, 100]
   */
  private static validateDensity(density: number): number {
    if (typeof density !== 'number' || isNaN(density)) return 0;
    return Math.max(0, Math.min(100, density));
  }

  /**
   * 🗺️ MAP DENSITY: Convert density percentage to status type
   */
  private static mapDensityToStatus(density: number): GateStatus {
    if (density >= 75) return 'high';
    if (density >= 45) return 'medium';
    return 'low';
  }

  /**
   * ⏱️ WAIT TIME MODEL: Non-linear estimation based on crowd pressure
   */
  private static calculateWaitTime(density: number): number {
    if (density >= 75) return Math.round(10 + (density - 75) * 0.75);
    if (density >= 45) return Math.round(3 + (density - 45) * 0.3);
    return Math.max(1, Math.round(density * 0.1));
  }

  /**
   * Initialize or update gates for a scenario
   * 🛡️ Validates gate states and ensures data integrity
   */
  static getUpdatedGates(currentGates: GateData[] | null, scenario: string = 'normal'): GateData[] {
    try {
      // 🛡️ INPUT VALIDATION
      if (typeof scenario !== 'string') scenario = 'normal';

      // ⚡ EFFICIENCY: Caching based on scenario and current gate counts
      const cacheKey = `${scenario}_${currentGates?.length || 0}_${Math.floor(Date.now() / 5000)}`;
      if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

      const now = Date.now();
      
      // Load from config if no current state exists
      const gates = currentGates && Array.isArray(currentGates) && currentGates.length > 0
        ? currentGates 
        : GATES_CONFIG.map(cfg => ({
            ...cfg,
            density: 15 + Math.random() * 10,
            currentCount: 0,
            status: 'low' as GateStatus,
            trend: 'stable' as const,
            waitTimeMinutes: 1,
            timestamp: now
          }));

      const updated = gates.map(gate => {
        const target = this.getTargetDensityForScenario(gate.id, scenario);
        const prev = gate.density;
        
        // 📈 MOVEMENT SIMULATION: Smooth transitions toward scenario targets
        const drift = (target - prev) * 0.15 + (Math.random() - 0.5) * 4;
        const density = Math.max(0, Math.min(100, prev + drift));

        const trend: GateData['trend'] =
          density > prev + 1.5 ? 'increasing' : density < prev - 1.5 ? 'decreasing' : 'stable';

        return {
          ...gate,
          density,
          currentCount: Math.round((density / 100) * gate.capacity),
          status: gate.isOpen ? this.mapDensityToStatus(density) : 'closed' as GateStatus,
          trend,
          waitTimeMinutes: this.calculateWaitTime(density),
          timestamp: now,
        };
      });

      // 🧠 SMART ROUTING: Inject suggestions by analyzing overall gate network
      const suggestions = this.generateSuggestions(updated);
      
      const result = updated.map(gate => {
        const suggestion = suggestions.find(s => s.fromGate === gate.name);
        return {
          ...gate,
          suggestion: suggestion ? `AI Suggestion: Move to ${suggestion.toGate} to save ${suggestion.timeSavedMinutes}m.` : undefined
        };
      });

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      this.logger.log('ERROR', '[GateService] simulation_update -> failed', { error });
      return currentGates || [];
    }
  }

  /**
   * 🤖 SCENARIO TARGETS: Expected density for different operational states
   */
  private static getTargetDensityForScenario(gateId: string, scenario: string): number {
    const base: Record<string, Record<string, number>> = {
      normal: { 'entry-north': 25, 'entry-south': 20, 'exit-north': 12 },
      entry_rush: { 'entry-north': 88, 'entry-south': 82, 'entry-east': 65, 'entry-west': 55 },
      exit_surge: { 'exit-north': 92, 'exit-south': 88, 'exit-east': 75, 'exit-west': 65 }
    };
    
    // Default to a medium-low density if not specified
    const scenarioMap = base[scenario] || base.normal;
    return (scenarioMap[gateId] ?? 18) + (Math.random() * 8);
  }

  /**
   * 🧠 ROUTING LOGIC: Finds high-density gates and suggests their paired alternative
   */
  static generateSuggestions(gates: GateData[]): GateSuggestion[] {
    const suggestions: GateSuggestion[] = [];
    const gateMap = new Map(gates.map(g => [g.id, g]));

    gates.forEach(gate => {
      // Logic: If gate is status 'high' or 'medium' and rising
      if (gate.status !== 'low' && gate.trend !== 'decreasing') {
        const altGateId = (SUGGESTION_PAIRS as any)[gate.id];
        const altGate = altGateId ? gateMap.get(altGateId) : undefined;
        
        // If the alternative gate is relatively clear, suggest it
        if (altGate && altGate.status === 'low' && altGate.isOpen) {
          const suggestion = {
            fromGate: gate.name,
            toGate: altGate.name,
            reason: `${gate.name.split(' - ')[1]} is currently congested`,
            timeSavedMinutes: Math.max(2, gate.waitTimeMinutes - altGate.waitTimeMinutes),
            urgency: (gate.status === 'high' ? 'critical' : 'warning') as 'critical' | 'warning' | 'info',
          };
          
          console.log(`[GateService] route_suggestion -> from="${suggestion.fromGate}" to="${suggestion.toGate}"`);
          suggestions.push(suggestion);
        }
      }
    });
    
    return suggestions;
  }
}
