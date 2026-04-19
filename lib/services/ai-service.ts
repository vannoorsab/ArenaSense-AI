/**
 * ai-service.ts
 * AI intelligence orchestration service.
 * Simulates Google Cloud Vision AI + Vertex AI for crowd analysis.
 * In production, replace simulation with real API calls to:
 *   - Cloud Vision API: https://vision.googleapis.com/v1
 *   - Vertex AI: https://us-central1-aiplatform.googleapis.com
 */

import { CloudAIEngine } from './cloud-ai-engine';
import { calcDensityLevel, calcFlowPrediction } from '../utils/crowd-math';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  type: 'crowd_alert' | 'gate_suggestion' | 'prediction' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;  // 0–1
  severity: 'info' | 'warning' | 'danger';
  actionLabel?: string;
  actionTarget?: string;
  timestamp: number;
}

export interface VisionAnalysisResult {
  zone: string;
  densityEstimate: number;    // people per sq meter
  crowdCount: number;
  anomalyDetected: boolean;
  anomalyType?: string;
  confidence: number;
  processingMs: number;
  apiModel: string;
}

export interface AIServiceResult {
  insights: AIInsight[];
  visionAnalysis: VisionAnalysisResult[];
  predictions: Array<{
    section: string;
    currentCount: number;
    predicted10min: number;
    predicted30min: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  processedAt: number;
  modelVersion: string;
}

// ─── AI Analysis Zones ───────────────────────────────────────────────────────

const ANALYSIS_ZONES = [
  'Gate A Area', 'Gate B Area', 'Main Concourse',
  'East Stand', 'West Stand', 'Pavilion',
  'Food Court', 'VIP Entrance', 'Car Park Area',
];

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Run full AI analysis for a stadium. Simulates Vision API and Vertex AI.
 * @param matchId - CSK match ID
 * @param scenario - current crowd scenario
 */
export async function runAIAnalysis(
  matchId: string,
  scenario: string = 'normal',
): Promise<AIServiceResult> {
  // Simulate API latency (real Cloud Vision typically 200–800ms)
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

  const startTime = Date.now();

  // Get vision analysis from cloud AI engine simulation
  const cloudAnalysis = await CloudAIEngine.performFullZoneAnalysis(scenario as any);

  // Build vision analysis results per zone
  const visionAnalysis: VisionAnalysisResult[] = ANALYSIS_ZONES.map((zone, i) => {
    const zoneData = cloudAnalysis.zones[i % cloudAnalysis.zones.length];
    return {
      zone,
      densityEstimate: (zoneData?.densityPercent ?? 0) / 40, // rough scale to people/m2
      crowdCount: zoneData?.estimatedCount ?? Math.round(Math.random() * 500),
      anomalyDetected: zoneData?.anomalyDetected ?? false,
      anomalyType: zoneData?.anomalyDetected ? 'unusual_density_spike' : undefined,
      confidence: 0.82 + Math.random() * 0.15,
      processingMs: 180 + Math.round(Math.random() * 120),
      apiModel: 'cloud-vision-v1/crowd-detection-v3',
    };
  });

  // Build predictions
  const predictions = cloudAnalysis.zones.slice(0, 5).map((zone, i) => {
    const names = ['East Stand', 'West Stand', 'Pavilion', 'Gate Area', 'VIP'];
    const current = zone.estimatedCount;
    const flow = calcFlowPrediction(current, 10000, scenario === 'live' ? 'live' : 'pre-match');
    return {
      section: names[i] ?? `Zone ${i+1}`,
      currentCount: current,
      predicted10min: Math.max(0, current + flow.netChange * 10),
      predicted30min: Math.max(0, current + flow.netChange * 30 * 0.7),
      trend: flow.netChange > 50 ? 'increasing' as const
           : flow.netChange < -50 ? 'decreasing' as const
           : 'stable' as const,
    };
  });

  // Generate AI insights
  const insights: AIInsight[] = [];

  // Anomaly insights
  visionAnalysis.filter(v => v.anomalyDetected).forEach(v => {
    insights.push({
      id: `anomaly-${v.zone}`,
      type: 'anomaly',
      title: `Unusual Activity: ${v.zone}`,
      description: `Cloud Vision AI detected abnormal crowd density at ${v.zone}. Monitoring closely.`,
      confidence: v.confidence,
      severity: 'warning',
      timestamp: Date.now(),
    });
  });

  // Density insights
  const highDensityZones = visionAnalysis.filter(v => v.densityEstimate > 2.0);
  if (highDensityZones.length > 0) {
    insights.push({
      id: 'density-alert',
      type: 'crowd_alert',
      title: `High Density in ${highDensityZones.length} Zone${highDensityZones.length > 1 ? 's' : ''}`,
      description: `${highDensityZones.map(z => z.zone).join(', ')} showing elevated crowd density. Consider redirection.`,
      confidence: 0.91,
      severity: highDensityZones.length > 2 ? 'danger' : 'warning',
      actionLabel: 'View Gate Status',
      actionTarget: '/admin',
      timestamp: Date.now(),
    });
  }

  // Predictive insight
  const increasingAreas = predictions.filter(p => p.trend === 'increasing');
  if (increasingAreas.length > 0) {
    insights.push({
      id: 'prediction-crowd',
      type: 'prediction',
      title: 'Crowd Surge Predicted',
      description: `AI predicts ${increasingAreas[0].section} will reach peak capacity in ~10 minutes. Prepare alternate routes.`,
      confidence: 0.86,
      severity: 'warning',
      timestamp: Date.now(),
    });
  }

  // Positive recommendation
  insights.push({
    id: 'gate-rec',
    type: 'gate_suggestion',
    title: 'Smart Gate Routing Active',
    description: 'AI is analyzing all 8 gates in real-time. Attendees are being intelligently routed to minimize wait times.',
    confidence: 0.98,
    severity: 'info',
    timestamp: Date.now(),
  });

  return {
    insights,
    visionAnalysis,
    predictions,
    processedAt: startTime,
    modelVersion: 'areansense-ai/v2.1.0',
  };
}

/**
 * Get quick AI summary text for display.
 */
export function getAISummary(result: AIServiceResult): string {
  const dangerCount = result.insights.filter(i => i.severity === 'danger').length;
  const warnCount = result.insights.filter(i => i.severity === 'warning').length;
  if (dangerCount > 0) return `⚠️ ${dangerCount} critical alert${dangerCount > 1 ? 's' : ''} detected`;
  if (warnCount > 0) return `🔶 ${warnCount} area${warnCount > 1 ? 's' : ''} need attention`;
  return '✅ All systems normal — AI monitoring active';
}
