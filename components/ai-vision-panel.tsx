'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { CloudAIAnalysis, CloudAIZoneAnalysis } from '@/lib/types';
import { VisionService } from '@/lib/services/vision-service';
import { Badge } from '@/components/ui/badge';
import { Brain, Wifi, AlertCircle, CheckCircle2, Loader2, TrendingUp } from 'lucide-react';

interface AIVisionPanelProps {
  scenario?: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge';
  compact?: boolean;
}

const RISK_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  low:      { label: 'Low Risk',      badge: 'bg-green-500', dot: 'bg-green-400' },
  medium:   { label: 'Medium Risk',   badge: 'bg-amber-500', dot: 'bg-amber-400 animate-pulse' },
  high:     { label: 'High Risk',     badge: 'bg-orange-500', dot: 'bg-orange-400 animate-pulse' },
  critical: { label: 'Critical Risk', badge: 'bg-red-600',   dot: 'bg-red-400 animate-ping' },
};

const ANOMALY_LABELS: Record<string, string> = {
  overcrowding:    '⚠️ Overcrowding',
  rapid_movement:  '⚡ Erratic Movement',
  bottleneck:      '🚧 Bottleneck',
  none:            '✅ Normal',
};

/**
 * ZoneRow Component
 * Displays individual zone status with density and confidence metrics.
 * Memoized to prevent unnecessary re-renders when other zones change.
 */
const ZoneRow = memo(function ZoneRow({ zone }: { zone: CloudAIZoneAnalysis }) {
  const hasAnomaly = zone.anomalyDetected;
  return (
    <div 
      className={`px-3 py-2 rounded-lg border transition-all ${
        hasAnomaly ? 'bg-red-50 border-red-200' : 'bg-muted/30 border-transparent'
      }`}
      role="listitem"
      aria-label={`${zone.zoneName}: ${zone.densityPercent}% density`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {hasAnomaly
            ? <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" aria-hidden="true" />
            : <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" aria-hidden="true" />}
          <span className="text-xs font-medium">{zone.zoneName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground" aria-label="Confidence level">
            {zone.confidence}% conf
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            zone.densityPercent >= 75 ? 'bg-red-100 text-red-700' :
            zone.densityPercent >= 50 ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>
            {zone.densityPercent}%
          </span>
        </div>
      </div>
      {/* density bar */}
      <div 
        className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={zone.densityPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Crowd density for ${zone.zoneName}`}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${zone.densityPercent}%`,
            backgroundColor: zone.densityPercent >= 75 ? '#ef4444' :
              zone.densityPercent >= 50 ? '#f59e0b' : '#22c55e'
          }}
        />
      </div>
      {hasAnomaly && (
        <p className="text-[10px] text-muted-foreground mt-1 truncate">
          {ANOMALY_LABELS[zone.anomalyType ?? 'none']} · {zone.estimatedCount.toLocaleString()} est.
        </p>
      )}
    </div>
  );
});

export default function AIVisionPanel({ scenario = 'normal', compact = false }: AIVisionPanelProps) {
  const [analysis, setAnalysis] = useState<CloudAIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [callCount, setCallCount] = useState(0);
  const [lastLatency, setLastLatency] = useState<number>(0);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const result = await VisionService.performFullZoneAnalysis(scenario);
      setAnalysis(result);
      setLastLatency(result.processingTimeMs);
      setCallCount(c => c + 1);
    } finally {
      setLoading(false);
    }
  }, [scenario]);

  useEffect(() => {
    runAnalysis();
    const interval = setInterval(runAnalysis, 5000);
    return () => clearInterval(interval);
  }, [runAnalysis]);

  const projectInfo = VisionService.getProjectInfo();
  const risk = analysis?.overallRiskLevel ?? 'low';
  const cfg = RISK_CONFIG[risk];

  const sortedZones = useMemo(() => {
    if (!analysis) return [];
    return [...analysis.zones].sort((a, b) => b.densityPercent - a.densityPercent);
  }, [analysis]);

  return (
    <div 
      className="space-y-3" 
      role="region" 
      aria-label="AI Vision Analytics"
    >
      {/* Header status bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">Google Cloud Vision AI</span>
        </div>
        {loading ? (
          <Badge variant="outline" className="gap-1 text-[10px]">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyzing...
          </Badge>
        ) : (
          <Badge className={`${cfg.badge} text-white text-[10px] gap-1`}>
            <Wifi className="w-2.5 h-2.5" />
            {cfg.label}
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground ml-auto">
          {lastLatency}ms · call #{callCount}
        </span>
      </div>

      {/* GCP info strip */}
      <div className="text-[10px] text-muted-foreground font-mono bg-muted/30 rounded px-2 py-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
        <span>project: {projectInfo.project}</span>
        <span>region: {projectInfo.region}</span>
        <span>model: {projectInfo.model}</span>
      </div>

      {analysis && (
        <>
          {/* Top-level summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-base font-bold">{analysis.totalPeopleDetected.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">People Detected</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-red-500">
                {analysis.zones.filter(z => z.anomalyDetected).length}
              </p>
              <p className="text-[10px] text-muted-foreground">Anomalies</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-base font-bold">
                {Math.round(analysis.zones.reduce((s, z) => s + z.confidence, 0) / analysis.zones.length)}%
              </p>
              <p className="text-[10px] text-muted-foreground">Avg Confidence</p>
            </div>
          </div>

          {/* Zone analysis */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Zone Analysis ({analysis.zones.length} cameras)
            </p>
            <div 
              className={`space-y-1.5 outline-none ${compact ? 'max-h-48 overflow-y-auto' : 'max-h-80 overflow-y-auto'}`}
              role="list"
              aria-label="Zone metrics"
            >
              {sortedZones.map(zone => (
                <ZoneRow key={zone.zoneId} zone={zone} />
              ))}
            </div>
          </div>

          <p className="text-[9px] text-muted-foreground text-center">
            Powered by Google Cloud Vision AI · {new Date(analysis.timestamp).toLocaleTimeString()}
          </p>
        </>
      )}

      {!analysis && !loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <p className="text-xs">Waiting for AI feed…</p>
        </div>
      )}
    </div>
  );
}
