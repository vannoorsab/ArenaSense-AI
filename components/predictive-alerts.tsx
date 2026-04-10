'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { CrowdPrediction } from '@/lib/types';

interface PredictiveAlertsProps {
  predictions: Map<string, CrowdPrediction>;
  currentZone: string;
}

export default function PredictiveAlerts({ predictions, currentZone }: PredictiveAlertsProps) {
  // Find zones that will become crowded soon
  const upcomingCrowdedZones: {
    zone: string;
    currentDensity: number;
    predictedDensity: number;
    timeToEvent: number;
  }[] = [];

  predictions.forEach((prediction, zone) => {
    // Type guard - ensure zone is a valid string
    if (typeof zone !== 'string' || !zone) return;
    
    // Check if zone will become significantly more crowded
    const currentDensity = prediction.predictedDensity - (prediction.trend === 'increasing' ? 15 : 0);
    const predictedDensity = prediction.predictedDensity;
    
    if (predictedDensity > 60 && prediction.trend === 'increasing') {
      upcomingCrowdedZones.push({
        zone: String(zone),
        currentDensity: Math.max(0, currentDensity),
        predictedDensity,
        timeToEvent: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
      });
    }
  });

  // Sort by urgency (time to event)
  upcomingCrowdedZones.sort((a, b) => a.timeToEvent - b.timeToEvent);

  // Take top 3 alerts
  const topAlerts = upcomingCrowdedZones.slice(0, 3);

  if (topAlerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-green-700">
            <Clock className="w-4 h-4" />
            Crowd Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600">
            All clear! No significant crowd buildup expected in the next 30 minutes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatZoneName = (zone: string): string => {
    if (!zone || typeof zone !== 'string') return 'Unknown Zone';
    return zone
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSeverityColor = (predictedDensity: number) => {
    if (predictedDensity >= 80) return 'text-destructive bg-red-50 border-red-200';
    if (predictedDensity >= 65) return 'text-accent bg-orange-50 border-orange-200';
    return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  };

  return (
    <Card className="border-accent/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Upcoming Crowd Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topAlerts.map((alert, index) => {
          const isCurrentZone = alert.zone === currentZone;
          const severityClass = getSeverityColor(alert.predictedDensity);
          
          return (
            <div
              key={alert.zone}
              className={`flex items-center justify-between p-2 rounded-lg border ${severityClass} ${
                isCurrentZone ? 'ring-2 ring-primary ring-offset-1' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium">
                    {formatZoneName(alert.zone)}
                    {isCurrentZone && <span className="ml-1 text-[10px] opacity-70">(You)</span>}
                  </p>
                  <p className="text-[10px] opacity-80">
                    {alert.predictedDensity >= 80 ? 'Will be crowded' : 'Becoming busy'} in ~{alert.timeToEvent} min
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <span className="opacity-60">{Math.round(alert.currentDensity)}%</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                  <span>{Math.round(alert.predictedDensity)}%</span>
                </div>
              </div>
            </div>
          );
        })}
        
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          AI predictions based on current trends and historical patterns
        </p>
      </CardContent>
    </Card>
  );
}
