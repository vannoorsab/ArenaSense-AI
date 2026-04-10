'use client';

import { AnomalyAlert, CrowdData } from '@/lib/types';
import { AlertTriangle, AlertCircle, Zap, Users } from 'lucide-react';

interface EmergencyStatsProps {
  alerts: AnomalyAlert[];
  crowdData: Map<string, CrowdData>;
}

export default function EmergencyStats({ alerts, crowdData }: EmergencyStatsProps) {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;

  const mostCrowded = Array.from(crowdData.values())
    .sort((a, b) => b.density - a.density)
    .slice(0, 3);

  const totalPeople = Array.from(crowdData.values()).reduce((sum, c) => sum + c.currentCount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 rounded p-3 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive">CRITICAL</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
        </div>

        <div className="bg-orange-50 rounded p-3 border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-semibold text-orange-600">HIGH</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{highCount}</p>
        </div>
      </div>

      <div className="bg-muted rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4" />
          <span className="text-xs font-semibold">Total Affected</span>
        </div>
        <p className="text-2xl font-bold">{totalPeople.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">people in venue</p>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2">Most Crowded Zones</p>
        <div className="space-y-2">
          {mostCrowded.map((zone, idx) => (
            <div key={zone.zone} className="flex items-center justify-between text-xs">
              <span>{idx + 1}. {zone.zone}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded h-2">
                  <div
                    className="h-full rounded bg-orange-500"
                    style={{ width: `${zone.density}%` }}
                  />
                </div>
                <span className="font-bold w-8 text-right">{zone.density.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
        <p className="text-xs font-semibold mb-2">Evacuation Priority</p>
        <p className="text-xs text-muted-foreground">
          {criticalCount > 0 ? 'Immediate evacuation required' : 'Monitor situation closely'}
        </p>
      </div>
    </div>
  );
}
