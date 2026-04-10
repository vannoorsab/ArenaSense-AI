'use client';

interface ScenarioRun {
  name: string;
  type: string;
  duration: number;
  startTime: number;
  results: {
    maxDensity: number;
    avgDensity: number;
    peakAlerts: number;
    criticalZones: string[];
    evacuationTime: number;
  };
}

interface ScenarioResultsProps {
  runs: ScenarioRun[];
}

export default function ScenarioResults({ runs }: ScenarioResultsProps) {
  if (runs.length === 0) {
    return <p className="text-sm text-muted-foreground">No completed scenarios yet</p>;
  }

  return (
    <div className="space-y-3">
      {runs.slice().reverse().map((run) => (
        <div key={run.startTime} className="border border-border rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-sm">{run.name}</p>
              <p className="text-xs text-muted-foreground">{run.duration} minutes</p>
            </div>
            <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {new Date(run.startTime).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Max Density</p>
              <p className="font-semibold">{run.results.maxDensity.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Density</p>
              <p className="font-semibold">{run.results.avgDensity.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Peak Alerts</p>
              <p className="font-semibold text-orange-600">{run.results.peakAlerts}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Evacuation</p>
              <p className="font-semibold">{run.results.evacuationTime} min</p>
            </div>
          </div>

          {run.results.criticalZones.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold mb-1">Critical Zones ({run.results.criticalZones.length})</p>
              <div className="flex flex-wrap gap-1">
                {run.results.criticalZones.slice(0, 3).map((zone) => (
                  <span key={zone} className="text-xs bg-red-100 text-red-900 px-2 py-0.5 rounded">
                    {zone.split('-').pop()}
                  </span>
                ))}
                {run.results.criticalZones.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{run.results.criticalZones.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
