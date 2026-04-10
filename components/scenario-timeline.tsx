'use client';

import { AnomalyAlert } from '@/lib/types';

interface ScenarioTimelineProps {
  alerts: AnomalyAlert[];
  currentTime: number;
}

export default function ScenarioTimeline({ alerts, currentTime }: ScenarioTimelineProps) {
  const timelineEvents = alerts
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-10);

  return (
    <div className="space-y-3">
      {timelineEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events recorded yet</p>
      ) : (
        timelineEvents.map((event, idx) => (
          <div
            key={event.id}
            className={`border-l-4 pl-3 py-2 ${
              event.severity === 'critical'
                ? 'border-destructive'
                : event.severity === 'high'
                  ? 'border-orange-500'
                  : 'border-yellow-500'
            }`}
          >
            <p className="text-xs font-semibold capitalize">{event.type.replace(/_/g, ' ')}</p>
            <p className="text-xs text-muted-foreground mt-1">{event.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
