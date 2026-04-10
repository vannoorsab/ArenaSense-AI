'use client';

import { CrowdData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NavigationPanelProps {
  currentZone: string;
  crowdData: Map<string, CrowdData>;
}

export default function NavigationPanel({ currentZone, crowdData }: NavigationPanelProps) {
  const nearbyZones = Array.from(crowdData.values())
    .filter((c) => c.zone !== currentZone)
    .sort((a, b) => a.density - b.density)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nearby Alternatives</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {nearbyZones.map((zone) => (
            <div key={zone.zone} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
              <span>{zone.zone}</span>
              <span className="font-semibold">{zone.density.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
