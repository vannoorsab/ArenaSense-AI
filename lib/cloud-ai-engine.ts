import { CloudAIAnalysis, CloudAIZoneAnalysis } from './types';

/**
 * Google Cloud Vision AI Integration (Simulated)
 * In production: calls Cloud Vision API / Vertex AI for crowd density estimation
 * Here: generates realistic simulated responses that feed heatmaps and alerts
 */

const MODEL_VERSION = 'crowd-vision-v2.1-gemini';
const CLOUD_PROJECT = 'arenahsense-ai-prod';

const VISION_ZONES = [
  { id: 'entry-north', name: 'North Entry Gate A', baseCount: 1200 },
  { id: 'entry-south', name: 'South Entry Gate B', baseCount: 1100 },
  { id: 'entry-east',  name: 'East Entry Gate C',  baseCount:  900 },
  { id: 'entry-west',  name: 'West Entry Gate D',  baseCount:  850 },
  { id: 'exit-north',  name: 'North Exit Gate E',  baseCount:  400 },
  { id: 'exit-south',  name: 'South Exit Gate F',  baseCount:  380 },
  { id: 'concourse-north', name: 'North Concourse', baseCount: 3500 },
  { id: 'concourse-south', name: 'South Concourse', baseCount: 3200 },
  { id: 'seating-lower-north', name: 'Lower North Stand', baseCount: 8500 },
  { id: 'seating-lower-south', name: 'Lower South Stand', baseCount: 8200 },
];

export class CloudAIEngine {
  private static sessionId = `gcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  private static callCount = 0;

  /**
   * Performs full-frame crowd density analysis across all vision zones.
   * In a production environment, this triggers a Cloud Vision API request or Vertex AI inference.
   */
  static async performFullZoneAnalysis(
    scenario: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge' = 'normal'
  ): Promise<CloudAIAnalysis> {
    const startMs = performance.now();
    this.callCount++;

    // Simulate network + inference latency (80–350ms)
    await new Promise(r => setTimeout(r, 80 + Math.random() * 270));

    const zones = VISION_ZONES.map(z => this.processZoneVisionFrame(z, scenario));

    const anomalyZones = zones.filter(z => z.anomalyDetected);
    const totalPeople = zones.reduce((s, z) => s + z.estimatedCount, 0);
    const maxDensity = Math.max(...zones.map(z => z.densityPercent));

    let overallRiskLevel: CloudAIAnalysis['overallRiskLevel'] = 'low';
    if (maxDensity >= 80 || anomalyZones.length >= 3) overallRiskLevel = 'critical';
    else if (maxDensity >= 65 || anomalyZones.length >= 2) overallRiskLevel = 'high';
    else if (maxDensity >= 45 || anomalyZones.length >= 1) overallRiskLevel = 'medium';

    const processingTimeMs = Math.round(performance.now() - startMs);

    return {
      sessionId: this.sessionId,
      modelVersion: MODEL_VERSION,
      zones,
      overallRiskLevel,
      totalPeopleDetected: totalPeople,
      processingTimeMs,
      timestamp: Date.now(),
    };
  }

  /**
   * Internal processor for individual zone vision frames.
   */
  private static processZoneVisionFrame(
    zone: typeof VISION_ZONES[number],
    scenario: string
  ): CloudAIZoneAnalysis {
    const scenarioMultipliers: Record<string, Record<string, number>> = {
      entry_rush: {
        'entry-north': 2.8, 'entry-south': 2.6, 'entry-east': 2.2, 'entry-west': 2.0,
      },
      exit_surge: {
        'exit-north': 3.2, 'exit-south': 3.0,
      },
      halftime: {
        'concourse-north': 2.4, 'concourse-south': 2.1,
      },
    };

    const multiplier = (scenarioMultipliers[scenario] || {})[zone.id] ?? 1.0;
    const noise = 0.85 + Math.random() * 0.3;
    const estimatedCount = Math.round(zone.baseCount * multiplier * noise);
    const capacity = zone.baseCount * 3.5;
    const densityPercent = Math.min(100, Math.round((estimatedCount / capacity) * 100));
    const confidence = Math.round(82 + Math.random() * 15);

    let anomalyType: CloudAIZoneAnalysis['anomalyType'] = 'none';
    let anomalyDetected = false;
    let description = '';

    if (densityPercent >= 80) {
      anomalyDetected = true;
      anomalyType = 'overcrowding';
      description = `Severe overcrowding detected. ${estimatedCount.toLocaleString()} people estimated. Immediate intervention recommended.`;
    } else if (densityPercent >= 65) {
      anomalyDetected = true;
      anomalyType = 'bottleneck';
      description = `High density bottleneck forming. Flow rate reduced by ~${Math.round((densityPercent - 50) * 0.8)}%.`;
    } else if (densityPercent >= 50 && Math.random() > 0.6) {
      anomalyDetected = true;
      anomalyType = 'rapid_movement';
      description = `Unusual movement pattern detected. Crowd velocity above normal threshold.`;
    } else {
      description = `Normal crowd flow. Density at ${densityPercent}% — within safe operating parameters.`;
    }

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      estimatedCount,
      densityPercent,
      confidence,
      anomalyDetected,
      anomalyType,
      description,
      lastAnalyzed: Date.now(),
    };
  }

  static getProjectInfo() {
    return {
      project: CLOUD_PROJECT,
      region: 'asia-south1',
      model: MODEL_VERSION,
      endpoint: `https://vision.googleapis.com/v1/projects/${CLOUD_PROJECT}/`,
      callsThisSession: this.callCount,
    };
  }

  static getRiskColor(risk: CloudAIAnalysis['overallRiskLevel']): string {
    return {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#f97316',
      critical: '#ef4444',
    }[risk];
  }
}
