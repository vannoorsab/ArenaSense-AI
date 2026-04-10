'use client';

import { AnomalyAlert } from '@/lib/types';
import { AlertTriangle, AlertCircle, Zap } from 'lucide-react';

interface AlertsPanelProps {
  alerts: AnomalyAlert[];
  compact?: boolean;
}

const severityColors = {
  low: 'bg-blue-50 border-blue-200 text-blue-900',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  high: 'bg-orange-50 border-orange-200 text-orange-900',
  critical: 'bg-red-50 border-red-200 text-red-900',
};

const severityIcons = {
  low: AlertCircle,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: AlertTriangle,
};

export default function AlertsPanel({ alerts, compact = false }: AlertsPanelProps) {
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  const displayCount = compact ? 3 : 5;

  if (compact) {
    return (
      <div className="space-y-2">
        {sortedAlerts.slice(0, displayCount).map((alert) => {
          const SeverityIcon = severityIcons[alert.severity];
          return (
            <div key={alert.id} className={`flex items-center gap-2 p-2 rounded-lg border ${severityColors[alert.severity]}`}>
              <SeverityIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{alert.message}</p>
                <p className="text-[10px] opacity-70">{alert.zone} · {alert.affectedPeople.toLocaleString()} affected</p>
              </div>
            </div>
          );
        })}
        {alerts.length > displayCount && (
          <p className="text-[10px] text-muted-foreground text-center">
            +{alerts.length - displayCount} more
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedAlerts.slice(0, displayCount).map((alert) => {
        const SeverityIcon = severityIcons[alert.severity];

        return (
          <div key={alert.id} className={`border rounded-lg p-3 ${severityColors[alert.severity]}`}>
            <div className="flex items-start gap-3">
              <SeverityIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm capitalize">{alert.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs mt-1">{alert.message}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-white bg-opacity-50 rounded whitespace-nowrap">
                    {alert.zone}
                  </span>
                </div>

                {alert.recommendedAction && (
                  <p className="text-xs mt-2 font-medium">Action: {alert.recommendedAction}</p>
                )}

                <div className="flex gap-4 mt-2 text-xs">
                  {alert.affectedPeople > 0 && (
                    <span>People: {alert.affectedPeople.toLocaleString()}</span>
                  )}
                  {alert.escalated && (
                    <span className="font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> ESCALATED
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {alerts.length > displayCount && (
        <p className="text-xs text-muted-foreground text-center py-2">
          +{alerts.length - displayCount} more alert{alerts.length - displayCount > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
