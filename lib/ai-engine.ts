import {
  AIRecommendation,
  CrowdData,
  Queue,
  User,
  PredictionData,
  EvacuationRoute,
  AnomalyAlert,
  SystemMetrics,
} from './types';
import { findShortestRoute, getNearbyZones, DEFAULT_VENUE } from './venue-schema';

export type { AIRecommendation, CrowdData, PredictionData, EvacuationRoute, AnomalyAlert };

/**
 * Central AI Decision Engine
 * Combines user context, crowd data, predictions, and system signals
 * to produce intelligent, context-aware recommendations
 */

export class AIDecisionEngine {
  /**
   * Generate intelligent recommendation combining multiple data sources
   */
  static generateRecommendation(
    user: User,
    crowdData: Map<string, CrowdData>,
    predictions: PredictionData[],
    queues: Queue[],
    alerts: AnomalyAlert[],
    destinationZone?: string
  ): AIRecommendation {
    const currentZone = crowdData.get(user.currentZone);
    const relevantPredictions = predictions.filter((p) => p.zone === user.currentZone);
    const nearbyAlerts = alerts.filter((a) => a.zone === user.currentZone);

    // Analyze user context
    const userContext = {
      avoidsCrowds: user.preferences.avoidCrowds,
      wantsFastRoute: user.preferences.preferQuickestRoute,
      hasAccessibilityNeeds: user.preferences.accessibility,
    };

    // Check immediate safety
    if (nearbyAlerts.some((a) => a.severity === 'critical')) {
      return this.generateEmergencyRecommendation(user, alerts);
    }

    // Check for crowd buildup prediction
    if (relevantPredictions.some((p) => p.predictedDensity > 80 && p.timeToImpact < 10)) {
      return this.generateProactiveCrowdAvoidance(user, crowdData, predictions);
    }

    // Generate navigation/facility recommendation
    if (destinationZone) {
      return this.generateNavigationRecommendation(user, destinationZone, crowdData, userContext);
    }

    // Recommend queue alternatives
    const queueRec = this.generateQueueRecommendation(user, queues, crowdData);
    if (queueRec) return queueRec;

    // Default: suggest best nearby amenity
    return this.generateAmenityRecommendation(user, crowdData);
  }

  private static generateEmergencyRecommendation(
    user: User,
    alerts: AnomalyAlert[]
  ): AIRecommendation {
    const criticalAlert = alerts.find((a) => a.severity === 'critical');
    return {
      type: 'safety',
      title: 'Evacuate Area - Safety Priority',
      description: criticalAlert?.message || 'Abnormal crowd detected. Please evacuate safely.',
      action: 'move_to_emergency_zone',
      urgency: 'critical',
      confidence: 98,
      context: {
        reason: criticalAlert?.type,
        affectedZones: criticalAlert ? [criticalAlert.zone] : [user.currentZone],
      },
      timestamp: Date.now(),
    };
  }

  private static generateProactiveCrowdAvoidance(
    user: User,
    crowdData: Map<string, CrowdData>,
    predictions: PredictionData[]
  ): AIRecommendation {
    const prediction = predictions.find((p) => p.zone === user.currentZone);

    // Find least crowded nearby zone
    const venue = DEFAULT_VENUE;
    const currentZone = venue.zones.find((z) => z.id === user.currentZone);
    const nearbyZones = currentZone?.connectedZones || [];

    let bestZone = nearbyZones[0];
    let bestDensity = 100;

    for (const zoneId of nearbyZones) {
      const crowd = crowdData.get(zoneId);
      if (crowd && crowd.density < bestDensity) {
        bestDensity = crowd.density;
        bestZone = zoneId;
      }
    }

    return {
      type: 'navigation',
      title: `Avoid Crowd Buildup (${prediction?.timeToImpact || 5} min)`,
      description: `This area will become crowded in ${prediction?.timeToImpact || 5} minutes. Moving to ${bestZone} is recommended to stay comfortable.`,
      action: `move_to_zone:${bestZone}`,
      urgency: 'high',
      confidence: prediction?.confidence || 85,
      context: {
        timeToImpact: prediction?.timeToImpact,
        predictedDensity: prediction?.predictedDensity,
        alternativeZone: bestZone,
        currentDensity: crowdData.get(bestZone)?.density || 0,
      },
      timestamp: Date.now(),
    };
  }

  private static generateNavigationRecommendation(
    user: User,
    destination: string,
    crowdData: Map<string, CrowdData>,
    userContext: any
  ): AIRecommendation {
    // Find best route based on user preferences
    const shortestPath = findShortestRoute('default', user.currentZone, destination);

    // Calculate route metrics
    let routeScore = 100;
    let avgDensity = 0;
    let maxDensity = 0;

    for (const zoneId of shortestPath) {
      const crowd = crowdData.get(zoneId);
      if (crowd) {
        avgDensity += crowd.density;
        maxDensity = Math.max(maxDensity, crowd.density);
        if (crowd.density > 70) routeScore -= 10;
        if (crowd.density > 85) routeScore -= 20;
      }
    }
    avgDensity /= shortestPath.length;

    const recommendation: AIRecommendation = {
      type: 'navigation',
      title: `Navigate to ${destination}`,
      description:
        userContext.avoidsCrowds && avgDensity > 60
          ? `Best route available. Note: moderate crowds expected. Average density: ${avgDensity.toFixed(0)}%`
          : `Direct route to destination. Estimated walk time: 3-5 minutes.`,
      action: `navigate_to:${destination}:${shortestPath.join('->')}`,
      urgency: maxDensity > 85 ? 'high' : maxDensity > 70 ? 'medium' : 'low',
      confidence: 92,
      context: {
        path: shortestPath,
        avgDensity,
        maxDensity,
        estimatedTime: shortestPath.length * 0.5,
      },
      timestamp: Date.now(),
    };

    return recommendation;
  }

  private static generateQueueRecommendation(
    user: User,
    queues: Queue[],
    crowdData: Map<string, CrowdData>
  ): AIRecommendation | null {
    // Find fastest queue nearby
    const nearbyQueues = queues.filter((q) => {
      const zone = crowdData.get(q.zone);
      return zone && zone.density < 70;
    });

    if (nearbyQueues.length === 0) return null;

    const bestQueue = nearbyQueues.reduce((best, q) =>
      q.estimatedWaitTime < best.estimatedWaitTime ? q : best
    );

    if (bestQueue.estimatedWaitTime > 15) return null; // Only recommend if reasonable wait

    return {
      type: 'queue',
      title: `Quick ${bestQueue.facilityName} Visit`,
      description: `Short wait time at ${bestQueue.facilityName} (${bestQueue.estimatedWaitTime} min). Queue is moving well.`,
      action: `visit_facility:${bestQueue.facilityName}:${bestQueue.zone}`,
      urgency: 'low',
      confidence: 85,
      context: {
        facilityName: bestQueue.facilityName,
        zone: bestQueue.zone,
        waitTime: bestQueue.estimatedWaitTime,
        queueLength: bestQueue.people,
      },
      timestamp: Date.now(),
    };
  }

  private static generateAmenityRecommendation(
    user: User,
    crowdData: Map<string, CrowdData>
  ): AIRecommendation {
    const venue = DEFAULT_VENUE;
    const currentZone = venue.zones.find((z) => z.id === user.currentZone);
    const nearestFacility = currentZone?.facilities?.[0];

    return {
      type: 'facility',
      title: 'Nearby Amenities',
      description: `Visit ${nearestFacility || 'nearby facilities'} for restrooms, food, or merchandise. Current area is comfortable.`,
      action: `explore_facilities:${user.currentZone}`,
      urgency: 'low',
      confidence: 70,
      context: {
        facilities: currentZone?.facilities || [],
        zone: user.currentZone,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Detect anomalies and generate alerts
   */
  static detectAnomalies(
    crowdData: Map<string, CrowdData>,
    predictions: PredictionData[]
  ): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];
    const now = Date.now();

    crowdData.forEach((crowd, zone) => {
      // Overcrowding detection
      if (crowd.density > 90) {
        alerts.push({
          id: `alert-overcrowd-${zone}-${now}`,
          type: 'overcrowding',
          severity: crowd.density > 95 ? 'critical' : 'high',
          zone,
          message: `Critical overcrowding detected in ${zone} (${crowd.density.toFixed(0)}%)`,
          timestamp: now,
          affectedPeople: crowd.currentCount,
          recommendedAction: 'Redirect visitors to less crowded areas or implement emergency procedures',
          escalated: crowd.density > 95,
        });
      }

      // Bottleneck detection
      if (crowd.trend === 'increasing' && crowd.density > 70) {
        alerts.push({
          id: `alert-bottleneck-${zone}-${now}`,
          type: 'bottleneck',
          severity: 'medium',
          zone,
          message: `Potential bottleneck forming in ${zone}. Crowds increasing rapidly.`,
          timestamp: now,
          affectedPeople: crowd.currentCount,
          recommendedAction: 'Open additional exits or redirect flow through alternative routes',
          escalated: false,
        });
      }
    });

    // Panic movement prediction
    const rapidIncreases = Array.from(crowdData.values()).filter(
      (c) => c.trend === 'increasing' && c.density > 75
    );
    if (rapidIncreases.length >= 3) {
      alerts.push({
        id: `alert-panic-${now}`,
        type: 'panic_movement',
        severity: 'critical',
        zone: 'Multiple',
        message: 'Rapid crowd movement detected across multiple zones. Potential panic situation.',
        timestamp: now,
        affectedPeople: rapidIncreases.reduce((sum, c) => sum + c.currentCount, 0),
        recommendedAction: 'Activate emergency protocol. Deploy staff to affected areas.',
        escalated: true,
      });
    }

    return alerts;
  }

  /**
   * Calculate safest evacuation route
   */
  static calculateSafeEvacuationRoute(
    currentZone: string,
    crowdData: Map<string, CrowdData>
  ): EvacuationRoute[] {
    const venue = DEFAULT_VENUE;
    const exits = venue.zones.filter((z) => z.type === 'exit');
    const routes: EvacuationRoute[] = [];

    // Simple BFS to find routes to each exit
    for (const exit of exits) {
      const path = findShortestRoute('default', currentZone, exit.id);
      let safetyScore = 100;
      let totalCrowding = 0;

      for (const zoneId of path) {
        const crowd = crowdData.get(zoneId);
        if (crowd) {
          const density = crowd.density;
          totalCrowding += density;
          safetyScore -= density * 0.5; // Penalize based on density
        }
      }

      routes.push({
        id: exit.id,
        name: `Evacuation via ${exit.name}`,
        zones: path,
        safetyScore: Math.max(0, safetyScore),
        estimatedTime: path.length * 0.75,
        capacity: exit.capacity,
        currentCrowding: crowdData.get(exit.id)?.currentCount || 0,
      });
    }

    // Sort by safety score (highest first)
    return routes.sort((a, b) => b.safetyScore - a.safetyScore);
  }

  /**
   * Generate system metrics for admin dashboard
   */
  static generateSystemMetrics(
    crowdData: Map<string, CrowdData>,
    alerts: AnomalyAlert[]
  ): SystemMetrics {
    let totalAttendees = 0;
    let totalDensity = 0;
    const criticalZones: string[] = [];

    crowdData.forEach((crowd) => {
      totalAttendees += crowd.currentCount;
      totalDensity += crowd.density;
      if (crowd.density > 85) {
        criticalZones.push(crowd.zone);
      }
    });

    const avgDensity = crowdData.size > 0 ? totalDensity / crowdData.size : 0;
    const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

    return {
      totalAttendees,
      averageDensity: avgDensity,
      criticalZones,
      activePredictions: 0,
      emergencyStatus:
        criticalAlerts.length > 0
          ? 'critical'
          : avgDensity > 75
            ? 'alert'
            : 'normal',
      lastUpdate: Date.now(),
    };
  }
}
