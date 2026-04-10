import { CrowdData, Queue, PredictionData } from './types';
import { DEFAULT_VENUE } from './venue-schema';

/**
 * Crowd Simulation Engine
 * Simulates realistic crowd behavior and predicts future densities
 */

export interface SimulationState {
  crowdData: Map<string, CrowdData>;
  queues: Queue[];
  predictions: PredictionData[];
  timestamp: number;
  scenarioType?: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge' | 'emergency';
}

export class CrowdSimulator {
  private static baseDistribution: Record<string, number> = {
    'entrance-main': 0.15,
    'concourse-north': 0.12,
    'concourse-east': 0.1,
    'concourse-south': 0.12,
    'concourse-west': 0.1,
    'seating-lower-north': 0.08,
    'seating-lower-east': 0.06,
    'seating-lower-south': 0.08,
    'seating-lower-west': 0.06,
    'seating-upper-north': 0.05,
    'seating-upper-east': 0.04,
    'seating-upper-south': 0.05,
    'seating-upper-west': 0.04,
    'seating-vip': 0.001,
    'facility-medical': 0.001,
  };

  static initializeSimulation(totalAttendees: number = 45000): SimulationState {
    const crowdData = new Map<string, CrowdData>();
    const now = Date.now();

    // Initialize crowd distribution based on base distribution
    for (const zone of DEFAULT_VENUE.zones) {
      const ratio = this.baseDistribution[zone.id] || 0.01;
      const count = Math.floor(totalAttendees * ratio);

      crowdData.set(zone.id, {
        zone: zone.id,
        density: (count / zone.capacity) * 100,
        capacity: zone.capacity,
        currentCount: count,
        trend: 'stable',
        timestamp: now,
      });
    }

    return {
      crowdData,
      queues: this.initializeQueues(),
      predictions: [],
      timestamp: now,
      scenarioType: 'normal',
    };
  }

  private static initializeQueues(): Queue[] {
    return [
      {
        id: 'queue-food-north',
        zone: 'concourse-north',
        facilityName: 'Food Court North',
        estimatedWaitTime: 15,
        people: 250,
        capacity: 400,
        trend: 'stable',
      },
      {
        id: 'queue-food-south',
        zone: 'concourse-south',
        facilityName: 'Food Court South',
        estimatedWaitTime: 18,
        people: 280,
        capacity: 400,
        trend: 'growing',
      },
      {
        id: 'queue-merch-east',
        zone: 'concourse-east',
        facilityName: 'Merchandise East',
        estimatedWaitTime: 12,
        people: 150,
        capacity: 300,
        trend: 'stable',
      },
      {
        id: 'queue-restroom-west',
        zone: 'concourse-west',
        facilityName: 'Restrooms West',
        estimatedWaitTime: 5,
        people: 45,
        capacity: 150,
        trend: 'shrinking',
      },
    ];
  }

  /**
   * Simulate one time step (10 seconds = 1 step)
   */
  static step(state: SimulationState, scenario?: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge' | 'emergency'): SimulationState {
    const newCrowdData = new Map(state.crowdData);
    const now = Date.now();

    // Apply scenario-specific dynamics
    const dynamics = this.getScenarioDynamics(scenario || state.scenarioType || 'normal');

    newCrowdData.forEach((crowd, zoneId) => {
      const dynamic = dynamics[zoneId] || { direction: 0, magnitude: 0 };
      const baselineTrend = dynamic.direction; // -1 to 1
      const changeRate = dynamic.magnitude || 0.02; // percentage change per step

      // Calculate new density with trend
      let newDensity = crowd.density;
      if (baselineTrend > 0) {
        newDensity += crowd.density * changeRate * baselineTrend;
      } else if (baselineTrend < 0) {
        newDensity += crowd.density * changeRate * baselineTrend;
      } else {
        // Tend toward equilibrium
        newDensity *= 0.98;
      }

      // Clamp between 0 and 100
      newDensity = Math.max(0, Math.min(100, newDensity));

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (newDensity > crowd.density + 2) trend = 'increasing';
      else if (newDensity < crowd.density - 2) trend = 'decreasing';

      // Add some random variance
      const variance = (Math.random() - 0.5) * 2;
      newDensity += variance;
      newDensity = Math.max(0, Math.min(100, newDensity));

      const newCount = Math.floor((newDensity / 100) * crowd.capacity);

      newCrowdData.set(zoneId, {
        zone: zoneId,
        density: newDensity,
        capacity: crowd.capacity,
        currentCount: newCount,
        trend,
        timestamp: now,
      });
    });

    // Update queues
    const newQueues = this.updateQueues(state.queues, newCrowdData);

    // Generate predictions
    const predictions = this.generatePredictions(newCrowdData, scenario || 'normal');

    return {
      crowdData: newCrowdData,
      queues: newQueues,
      predictions,
      timestamp: now,
      scenarioType: scenario || state.scenarioType,
    };
  }

  /**
   * Get scenario-specific crowd dynamics
   */
  private static getScenarioDynamics(scenario: string): Record<string, { direction: number; magnitude: number }> {
    const baseNormal: Record<string, { direction: number; magnitude: number }> = {
      'entrance-main': { direction: 0, magnitude: 0.01 },
      'concourse-north': { direction: 0, magnitude: 0.01 },
      'concourse-east': { direction: 0, magnitude: 0.01 },
      'concourse-south': { direction: 0, magnitude: 0.01 },
      'concourse-west': { direction: 0, magnitude: 0.01 },
      'seating-lower-north': { direction: 0, magnitude: 0 },
      'seating-lower-east': { direction: 0, magnitude: 0 },
      'seating-lower-south': { direction: 0, magnitude: 0 },
      'seating-lower-west': { direction: 0, magnitude: 0 },
      'seating-upper-north': { direction: 0, magnitude: 0 },
      'seating-upper-east': { direction: 0, magnitude: 0 },
      'seating-upper-south': { direction: 0, magnitude: 0 },
      'seating-upper-west': { direction: 0, magnitude: 0 },
    };

    switch (scenario) {
      case 'entry_rush':
        return {
          ...baseNormal,
          'entrance-main': { direction: 1, magnitude: 0.15 },
          'concourse-north': { direction: 1, magnitude: 0.08 },
          'concourse-east': { direction: 1, magnitude: 0.06 },
          'concourse-south': { direction: 1, magnitude: 0.08 },
          'concourse-west': { direction: 1, magnitude: 0.06 },
        };

      case 'halftime':
        return {
          ...baseNormal,
          'seating-lower-north': { direction: -1, magnitude: 0.1 },
          'seating-lower-south': { direction: -1, magnitude: 0.1 },
          'seating-lower-east': { direction: -1, magnitude: 0.08 },
          'seating-lower-west': { direction: -1, magnitude: 0.08 },
          'concourse-north': { direction: 1, magnitude: 0.12 },
          'concourse-south': { direction: 1, magnitude: 0.12 },
        };

      case 'exit_surge':
        return {
          ...baseNormal,
          'exit-north': { direction: 1, magnitude: 0.2 },
          'exit-south': { direction: 1, magnitude: 0.2 },
          'exit-east': { direction: 1, magnitude: 0.15 },
          'exit-west': { direction: 1, magnitude: 0.15 },
          'seating-lower-north': { direction: -1, magnitude: 0.12 },
          'seating-lower-south': { direction: -1, magnitude: 0.12 },
        };

      default:
        return baseNormal;
    }
  }

  private static updateQueues(
    queues: Queue[],
    crowdData: Map<string, CrowdData>
  ): Queue[] {
    return queues.map((queue) => {
      const zoneCrowd = crowdData.get(queue.zone);
      const baseFactor = zoneCrowd ? zoneCrowd.density / 50 : 1; // Higher density = longer queues

      let newWaitTime = queue.estimatedWaitTime * (0.95 + baseFactor * 0.1); // Vary by 5-15%
      newWaitTime = Math.max(5, Math.min(45, newWaitTime)); // Clamp between 5-45 min

      const changeRate = (Math.random() - 0.5) * 0.2;
      let newTrend: 'growing' | 'shrinking' | 'stable' = 'stable';

      if (Math.random() < 0.3) {
        // 30% chance to change trend
        newTrend = Math.random() > 0.5 ? 'growing' : 'shrinking';
      } else {
        newTrend = queue.trend;
      }

      return {
        ...queue,
        estimatedWaitTime: Math.round(newWaitTime),
        people: Math.round(queue.people * (1 + changeRate)),
        trend: newTrend,
      };
    });
  }

  /**
   * Generate 30+ minute predictions
   */
  static generatePredictions(
    currentCrowdData: Map<string, CrowdData>,
    scenario: string = 'normal'
  ): PredictionData[] {
    const predictions: PredictionData[] = [];
    const now = Date.now();

    currentCrowdData.forEach((crowd, zoneId) => {
      // Simulate 30 minutes ahead (simplified: just extrapolate trend)
      const dynamics = this.getScenarioDynamics(scenario);
      const dynamic = dynamics[zoneId] || { direction: 0, magnitude: 0 };

      let predictedDensity = crowd.density;
      const steps = 30; // 30 minutes

      for (let i = 0; i < steps; i++) {
        const changeRate = dynamic.magnitude || 0.02;
        if (dynamic.direction > 0) {
          predictedDensity += predictedDensity * changeRate;
        } else if (dynamic.direction < 0) {
          predictedDensity += predictedDensity * changeRate * dynamic.direction;
        }
      }

      predictedDensity = Math.max(0, Math.min(100, predictedDensity));

      // Detect when buildup will occur
      const willBecomeOvercrowded = crowd.density < 70 && predictedDensity > 70;

      if (willBecomeOvercrowded || predictedDensity > crowd.density + 10) {
        predictions.push({
          zone: zoneId,
          timeToImpact: Math.round((predictedDensity - crowd.density) / Math.max(1, dynamic.magnitude || 1)),
          predictedDensity,
          confidence: 75 + Math.random() * 20,
          trend: dynamic.direction > 0 ? 'increasing' : dynamic.direction < 0 ? 'decreasing' : 'stable',
          timestamp: now,
        });
      }
    });

    return predictions;
  }

  /**
   * Get multiple steps ahead efficiently
   */
  static simulateAhead(state: SimulationState, steps: number, scenario?: string): SimulationState {
    let current = state;
    for (let i = 0; i < steps; i++) {
      current = this.step(current, scenario as any);
    }
    return current;
  }
}
