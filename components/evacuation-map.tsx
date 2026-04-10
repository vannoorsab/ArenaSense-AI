'use client';

import { EvacuationRoute, CrowdData } from '@/lib/types';
import { DEFAULT_VENUE } from '@/lib/venue-schema';

interface EvacuationMapProps {
  routes: EvacuationRoute[];
  crowdData: Map<string, CrowdData>;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
}

export default function EvacuationMap({
  routes,
  crowdData,
  selectedRouteId,
  onSelectRoute,
}: EvacuationMapProps) {
  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const selectedZones = new Set(selectedRoute?.zones || []);

  const getDensityColor = (density: number): string => {
    if (density < 30) return '#10b981';
    if (density < 50) return '#84cc16';
    if (density < 70) return '#f59e0b';
    if (density < 85) return '#ef4444';
    return '#991b1b';
  };

  const zoneElements = DEFAULT_VENUE.zones.map((zone) => {
    const crowd = crowdData.get(zone.id);
    const density = crowd?.density || 0;
    const color = getDensityColor(density);
    const isInRoute = selectedZones.has(zone.id);
    const isExit = zone.type === 'exit';

    return (
      <g key={zone.id}>
        <rect
          x={zone.x1}
          y={zone.y1}
          width={zone.x2 - zone.x1}
          height={zone.y2 - zone.y1}
          fill={color}
          opacity={isInRoute ? 0.8 : 0.3}
          stroke={isInRoute ? '#3b82f6' : isExit ? '#16a34a' : 'rgba(0,0,0,0.1)'}
          strokeWidth={isInRoute ? 2 : isExit ? 2 : 1}
          style={{
            transition: 'all 0.2s ease',
          }}
        />
        {isInRoute && (
          <>
            <text
              x={(zone.x1 + zone.x2) / 2}
              y={(zone.y1 + zone.y2) / 2 - 5}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={density > 70 ? 'white' : 'black'}
              pointerEvents="none"
            >
              {density.toFixed(0)}%
            </text>
            <text
              x={(zone.x1 + zone.x2) / 2}
              y={(zone.y1 + zone.y2) / 2 + 8}
              textAnchor="middle"
              fontSize="9"
              fill="#3b82f6"
              pointerEvents="none"
              fontWeight="bold"
            >
              ➤
            </text>
          </>
        )}
      </g>
    );
  });

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="bg-secondary/10 border border-secondary rounded-lg p-4 overflow-x-auto">
        <svg viewBox="0 0 100 100" className="w-full h-auto min-h-[400px]" style={{ aspectRatio: '1/1' }}>
          {/* Stadium outline */}
          <rect x="0" y="0" width="100" height="100" fill="white" stroke="#ccc" strokeWidth="1" />

          {/* Zone elements */}
          {zoneElements}

          {/* Route animation arrows */}
          {selectedRoute &&
            selectedRoute.zones.slice(0, -1).map((zoneId, idx) => {
              const currentZone = DEFAULT_VENUE.zones.find((z) => z.id === zoneId);
              const nextZone = DEFAULT_VENUE.zones.find((z) => z.id === selectedRoute.zones[idx + 1]);

              if (!currentZone || !nextZone) return null;

              const x1 = (currentZone.x1 + currentZone.x2) / 2;
              const y1 = (currentZone.y1 + currentZone.y2) / 2;
              const x2 = (nextZone.x1 + nextZone.x2) / 2;
              const y2 = (nextZone.y1 + nextZone.y2) / 2;

              return (
                <line
                  key={`arrow-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  opacity="0.6"
                  strokeDasharray="2,2"
                />
              );
            })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Route details */}
      {selectedRoute && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold mb-2">Route: {selectedRoute.name}</p>
          <p className="text-xs text-muted-foreground mb-3">
            {selectedRoute.zones.length} zones • {selectedRoute.estimatedTime.toFixed(0)} minutes
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedRoute.zones.map((zoneId, idx) => (
              <div key={zoneId} className="flex items-center">
                <span className="text-xs bg-white px-2 py-1 rounded border">{zoneId.split('-').pop()}</span>
                {idx < selectedRoute.zones.length - 1 && <span className="mx-1 text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Safe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Crowded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-green-500" />
          <span>Exit</span>
        </div>
      </div>
    </div>
  );
}
