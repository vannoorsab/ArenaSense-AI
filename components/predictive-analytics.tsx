'use client';

import { CrowdData, PredictionData } from '@/lib/types';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface PredictiveAnalyticsProps {
  predictions: PredictionData[];
  crowdData: Map<string, CrowdData>;
}

export default function PredictiveAnalytics({
  predictions,
  crowdData,
}: PredictiveAnalyticsProps) {
  const sortedPredictions = [...predictions]
    .sort((a, b) => a.timeToImpact - b.timeToImpact)
    .slice(0, 8);

  if (sortedPredictions.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No significant predictions at this time. All zones stable.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedPredictions.map((pred) => {
        const currentCrowd = crowdData.get(pred.zone);
        const currentDensity = currentCrowd?.density || 0;
        const increase = pred.predictedDensity - currentDensity;
        const severity =
          pred.predictedDensity > 85 ? 'critical' : pred.predictedDensity > 70 ? 'high' : 'medium';

        const severityColors = {
          critical: 'bg-red-50 border-red-200',
          high: 'bg-orange-50 border-orange-200',
          medium: 'bg-yellow-50 border-yellow-200',
        };

        return (
          <div key={pred.zone} className={`border rounded-lg p-3 ${severityColors[severity]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{pred.zone}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded">
                    {pred.confidence.toFixed(0)}% confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Current Density</p>
                    <p className="font-semibold">{currentDensity.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Predicted Density</p>
                    <p className="font-semibold">{pred.predictedDensity.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(pred.predictedDensity, 100)}%`,
                      backgroundColor:
                        severity === 'critical'
                          ? '#dc2626'
                          : severity === 'high'
                            ? '#f97316'
                            : '#eab308',
                    }}
                  />
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-bold text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {pred.timeToImpact}m
                </div>
                {increase > 0 && (
                  <div className="flex items-center gap-1 text-sm font-bold text-orange-600 mt-1">
                    <TrendingUp className="w-4 h-4" />
                    +{increase.toFixed(0)}%
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              {pred.trend === 'increasing'
                ? '📈 Zone will become increasingly crowded'
                : pred.trend === 'decreasing'
                  ? '📉 Crowd expected to disperse'
                  : '→ Expected to remain stable'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
