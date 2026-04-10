'use client';

import { CrowdData } from '@/lib/types';
import { DEFAULT_VENUE } from '@/lib/venue-schema';

interface CrowdHeatmapProps {
  crowdData: Map<string, CrowdData>;
  currentZone: string;
  onZoneSelect: (zoneId: string) => void;
  emergencyMode?: boolean;
  dangerZones?: string[];
  safeRoutes?: { from: string; to: string }[];
}

export default function CrowdHeatmap({ 
  crowdData, 
  currentZone, 
  onZoneSelect,
  emergencyMode = false,
  dangerZones = [],
  safeRoutes = []
}: CrowdHeatmapProps) {
  const getDensityColor = (density: number, zoneId: string): string => {
    if (emergencyMode && dangerZones.includes(zoneId)) {
      return '#dc2626'; // Emergency red
    }
    if (density < 30) return '#10b981'; // Green - Low
    if (density < 50) return '#22c55e'; // Light green - Moderate
    if (density < 70) return '#eab308'; // Yellow - High
    if (density < 85) return '#f97316'; // Orange - Very High
    return '#dc2626'; // Red - Critical
  };

  const getDensityLabel = (density: number): string => {
    if (density < 30) return 'Low';
    if (density < 50) return 'Moderate';
    if (density < 70) return 'High';
    if (density < 85) return 'Very High';
    return 'Critical';
  };

  const getTrendArrow = (trend: 'increasing' | 'decreasing' | 'stable'): string => {
    switch (trend) {
      case 'increasing': return '\u2191';
      case 'decreasing': return '\u2193';
      case 'stable': return '\u2022';
    }
  };

  // Filter and sort zones for cleaner display
  const displayZones = DEFAULT_VENUE.zones
    .filter((z) => z.type !== 'exit')
    .sort((a, b) => {
      // Sort by size (larger zones first for better rendering)
      const sizeA = (a.x2 - a.x1) * (a.y2 - a.y1);
      const sizeB = (b.x2 - b.x1) * (b.y2 - b.y1);
      return sizeB - sizeA;
    });

  // Get exit zones for emergency mode
  const exitZones = DEFAULT_VENUE.zones.filter((z) => z.type === 'exit');

  return (
    <div className="space-y-4">
      {/* Emergency Mode Banner */}
      {emergencyMode && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-center font-semibold animate-pulse">
          EMERGENCY MODE ACTIVE - Follow highlighted evacuation routes
        </div>
      )}

      <div className="relative bg-muted/30 border border-border rounded-xl p-4 overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-auto min-h-[380px]" style={{ aspectRatio: '1/1' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Zone elements */}
          {displayZones.map((zone) => {
            const crowd = crowdData.get(zone.id);
            const density = crowd?.density || 0;
            const color = getDensityColor(density, zone.id);
            const isCurrentZone = zone.id === currentZone;
            const isDanger = emergencyMode && dangerZones.includes(zone.id);
            const zoneWidth = zone.x2 - zone.x1;
            const zoneHeight = zone.y2 - zone.y1;
            const isSmallZone = zoneWidth < 15 || zoneHeight < 12;

            return (
              <g key={zone.id}>
                {/* Zone rectangle */}
                <rect
                  x={zone.x1}
                  y={zone.y1}
                  width={zoneWidth}
                  height={zoneHeight}
                  fill={color}
                  opacity={isDanger ? 0.9 : 0.75}
                  stroke={isCurrentZone ? '#3b82f6' : isDanger ? '#dc2626' : 'rgba(255,255,255,0.5)'}
                  strokeWidth={isCurrentZone ? 2.5 : isDanger ? 2 : 0.8}
                  rx="1"
                  className="cursor-pointer transition-all duration-300 hover:opacity-90"
                  onClick={() => onZoneSelect(zone.id)}
                />

                {/* Single density value - positioned to avoid overlap */}
                {!isSmallZone && (
                  <text
                    x={(zone.x1 + zone.x2) / 2}
                    y={(zone.y1 + zone.y2) / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="7"
                    fontWeight="600"
                    fill={density > 60 ? '#ffffff' : '#1f2937'}
                    pointerEvents="none"
                    className="select-none"
                  >
                    {Math.round(density)}%
                    {crowd && (
                      <tspan dx="2" fontSize="5" opacity="0.8">
                        {getTrendArrow(crowd.trend)}
                      </tspan>
                    )}
                  </text>
                )}

                {/* Current location marker */}
                {isCurrentZone && (
                  <circle
                    cx={(zone.x1 + zone.x2) / 2}
                    cy={zone.y1 + 4}
                    r="2"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="0.5"
                  >
                    <animate attributeName="r" values="2;2.5;2" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Exit markers in emergency mode */}
          {emergencyMode && exitZones.map((exit) => (
            <g key={exit.id}>
              <rect
                x={exit.x1}
                y={exit.y1}
                width={exit.x2 - exit.x1}
                height={exit.y2 - exit.y1}
                fill="#22c55e"
                stroke="#16a34a"
                strokeWidth="1.5"
                rx="1"
              >
                <animate attributeName="opacity" values="1;0.6;1" dur="0.8s" repeatCount="indefinite" />
              </rect>
              <text
                x={(exit.x1 + exit.x2) / 2}
                y={(exit.y1 + exit.y2) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="4"
                fontWeight="bold"
                fill="white"
              >
                EXIT
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Compact Legend */}
      <div className="flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-3">
          {[
            { color: '#10b981', label: 'Low' },
            { color: '#eab308', label: 'High' },
            { color: '#dc2626', label: 'Critical' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color, opacity: 0.75 }} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            You
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">Tap any zone to navigate</p>
    </div>
  );
}
