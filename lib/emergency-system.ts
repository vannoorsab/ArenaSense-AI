import {
  AnomalyAlert,
  EvacuationRoute,
  Location,
  User,
  CrowdData,
  AdminAlert,
} from './types';
import { AIDecisionEngine } from './ai-engine';
import { DEFAULT_VENUE } from './venue-schema';

/**
 * Emergency Intelligence System
 * Detects abnormal crowd behavior and manages emergency response
 */

export class EmergencySystem {
  /**
   * Detect panic-like movements and abnormal behavior
   */
  static detectPanicMovement(
    alerts: AnomalyAlert[],
    crowdData: Map<string, CrowdData>
  ): boolean {
    const crowdingAlerts = alerts.filter(
      (a) => a.type === 'overcrowding' && a.severity === 'critical'
    );

    const botteneckAlerts = alerts.filter(
      (a) => a.type === 'bottleneck' && a.severity === 'medium'
    );

    const rapidIncreases = Array.from(crowdData.values()).filter(
      (c) => c.trend === 'increasing' && c.density > 75
    );

    // Detect panic if multiple critical conditions present
    return (
      (crowdingAlerts.length >= 2 && botteneckAlerts.length >= 1) ||
      rapidIncreases.length >= 4 ||
      crowdingAlerts.some((a) => a.zone === botteneckAlerts[0]?.zone)
    );
  }

  /**
   * Generate optimized evacuation routes prioritizing safety over speed
   */
  static generateEvacuationRoutes(
    userLocation: string,
    crowdData: Map<string, CrowdData>,
    safetyMode: 'balanced' | 'safety_first' | 'speed' = 'safety_first'
  ): EvacuationRoute[] {
    const venues = DEFAULT_VENUE;
    const exits = venues.zones.filter((z) => z.type === 'exit');
    const routes: EvacuationRoute[] = [];

    for (const exit of exits) {
      // Calculate safest path by BFS with crowd density weighting
      const path = this.findSafestPath(userLocation, exit.id, crowdData, safetyMode);
      let safetyScore = 100;
      let maxCrowding = 0;

      for (const zoneId of path) {
        const crowd = crowdData.get(zoneId);
        if (crowd) {
          maxCrowding = Math.max(maxCrowding, crowd.density);
          // In safety_first mode, heavily penalize crowded zones
          const penalty = safetyMode === 'safety_first' ? crowd.density * 0.8 : crowd.density * 0.3;
          safetyScore -= penalty;
        }
      }

      safetyScore = Math.max(0, Math.min(100, safetyScore));

      routes.push({
        id: `evacuation-${exit.id}`,
        name: exit.name,
        zones: path,
        safetyScore,
        estimatedTime: path.length * 0.5,
        capacity: exit.capacity,
        currentCrowding: crowdData.get(exit.id)?.currentCount || 0,
      });
    }

    // Sort by safety score for the selected mode
    return routes.sort((a, b) => {
      if (safetyMode === 'safety_first') {
        return b.safetyScore - a.safetyScore;
      } else if (safetyMode === 'speed') {
        return a.estimatedTime - b.estimatedTime;
      }
      return b.safetyScore - a.safetyScore;
    });
  }

  /**
   * Find safest path avoiding high-density areas
   */
  private static findSafestPath(
    start: string,
    end: string,
    crowdData: Map<string, CrowdData>,
    safetyMode: string
  ): string[] {
    if (start === end) return [start];

    const visited = new Set<string>();
    const queue: { zoneId: string; path: string[]; safety: number }[] = [
      { zoneId: start, path: [start], safety: 100 },
    ];

    let bestPath: string[] = [start];
    let bestSafety = 0;

    while (queue.length > 0) {
      const { zoneId, path, safety } = queue.shift()!;

      if (visited.has(zoneId)) continue;
      visited.add(zoneId);

      if (zoneId === end) {
        if (safety > bestSafety) {
          bestPath = path;
          bestSafety = safety;
        }
        continue;
      }

      const zone = DEFAULT_VENUE.zones.find((z) => z.id === zoneId);
      if (!zone) continue;

      for (const connectedId of zone.connectedZones) {
        if (!visited.has(connectedId)) {
          const crowd = crowdData.get(connectedId);
          const density = crowd?.density || 0;

          // Calculate safety score for connected zone
          let newSafety = safety;
          if (safetyMode === 'safety_first') {
            newSafety -= density * 0.5; // Heavier penalty
          } else {
            newSafety -= density * 0.2;
          }

          queue.push({
            zoneId: connectedId,
            path: [...path, connectedId],
            safety: Math.max(0, newSafety),
          });
        }
      }
    }

    return bestPath;
  }

  /**
   * Generate comprehensive emergency alert for admin
   */
  static generateEmergencyAlert(
    panicDetected: boolean,
    crowdData: Map<string, CrowdData>,
    alerts: AnomalyAlert[]
  ): AdminAlert | null {
    if (!panicDetected && alerts.filter((a) => a.severity === 'critical').length === 0) {
      return null;
    }

    const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
    const affectedZones = new Set(criticalAlerts.map((a) => a.zone));
    const affectedPeople = Array.from(crowdData.values())
      .filter((c) => affectedZones.has(c.zone))
      .reduce((sum, c) => sum + c.currentCount, 0);

    return {
      id: `emergency-${Date.now()}`,
      type: 'emergency',
      severity: panicDetected ? 'critical' : 'warning',
      title: panicDetected ? 'PANIC DETECTION ACTIVATED' : 'EMERGENCY ALERT',
      message: panicDetected
        ? 'Abnormal crowd behavior detected. Automated emergency protocols initiated.'
        : `Critical overcrowding in ${affectedZones.size} zone(s).`,
      affectedZones: Array.from(affectedZones),
      affectedPeople,
      recommendedActions: this.generateEmergencyActions(panicDetected, affectedZones),
      timestamp: Date.now(),
      acknowledged: false,
    };
  }

  private static generateEmergencyActions(
    panicDetected: boolean,
    affectedZones: Set<string>
  ): string[] {
    const actions: string[] = [];

    if (panicDetected) {
      actions.push('Activate emergency communication system');
      actions.push('Deploy evacuation routes to all attendees');
      actions.push('Alert security and emergency services');
      actions.push('Redirect incoming foot traffic away from affected zones');
      actions.push('Open all emergency exits');
      actions.push('Position medical teams at key locations');
    } else {
      actions.push('Redirect crowds to less dense areas');
      actions.push('Open additional exits if available');
      actions.push('Increase staff presence in critical zones');
      actions.push('Begin measured evacuation procedures');
    }

    return actions;
  }

  /**
   * Calculate optimal assembly point for users from a zone
   */
  static getNearestAssemblyPoint(
    userZone: string,
    crowdData: Map<string, CrowdData>
  ): Location {
    const assemblyPoints = DEFAULT_VENUE.emergencyMeetingPoints;
    let nearest = assemblyPoints[0];
    let bestScore = Infinity;

    for (const point of assemblyPoints) {
      // Simple distance calculation
      const distance = Math.sqrt(Math.pow(point.x - 50, 2) + Math.pow(point.y - 50, 2));

      // Prefer less crowded assembly points
      const crowd = crowdData.get(point.zone);
      const crowdPenalty = crowd ? crowd.density * 100 : 0;

      const score = distance + crowdPenalty;
      if (score < bestScore) {
        bestScore = score;
        nearest = point;
      }
    }

    return nearest;
  }

  /**
   * Estimate evacuation time for all attendees from a zone
   */
  static estimateEvacuationTime(
    zone: string,
    crowdData: Map<string, CrowdData>,
    evacuationRoute: EvacuationRoute
  ): number {
    const zoneCrowd = crowdData.get(zone);
    if (!zoneCrowd) return 0;

    // Base time per zone: 0.5 minutes
    // Add time proportional to crowd density
    const baseTime = evacuationRoute.zones.length * 0.5;
    const congestionFactor = 1 + (zoneCrowd.density / 100) * 2; // Up to 3x slower when 100% dense

    return Math.round(baseTime * congestionFactor);
  }

  /**
   * Detect if situation is becoming more severe
   */
  static isSituationEscalating(
    previousAlerts: AnomalyAlert[],
    currentAlerts: AnomalyAlert[]
  ): boolean {
    const prevCritical = previousAlerts.filter((a) => a.severity === 'critical').length;
    const currCritical = currentAlerts.filter((a) => a.severity === 'critical').length;

    // Escalating if critical alerts are increasing
    return currCritical > prevCritical && currCritical >= 3;
  }
}
