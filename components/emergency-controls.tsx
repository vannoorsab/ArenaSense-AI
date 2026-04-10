'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnomalyAlert } from '@/lib/types';
import { AlertTriangle, AlertCircle, Navigation, Zap } from 'lucide-react';

interface EmergencyControlsProps {
  alerts: AnomalyAlert[];
}

export default function EmergencyControls({ alerts }: EmergencyControlsProps) {
  const [emergencyActive, setEmergencyActive] = useState(false);

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setEmergencyActive(!emergencyActive)}
        variant={emergencyActive ? 'destructive' : 'outline'}
        className="w-full"
        disabled={criticalAlerts.length === 0}
      >
        <Zap className="w-4 h-4 mr-2" />
        {emergencyActive ? 'EMERGENCY ACTIVE' : 'Activate Emergency'}
      </Button>

      {emergencyActive && (
        <div className="space-y-2 p-3 bg-red-50 rounded border border-red-200">
          <p className="text-xs font-bold text-destructive">EMERGENCY MODE ACTIVATED</p>

          <Button variant="outline" className="w-full text-xs justify-start" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Deploy Evacuation Routes
          </Button>

          <Button variant="outline" className="w-full text-xs justify-start" size="sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            Alert All Staff
          </Button>

          <Button variant="outline" className="w-full text-xs justify-start" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Call Emergency Services
          </Button>

          <Button variant="destructive" className="w-full text-xs" size="sm">
            Close All Exits
          </Button>
        </div>
      )}

      {criticalAlerts.length > 0 && !emergencyActive && (
        <div className="p-2 bg-red-50 rounded border border-red-200">
          <p className="text-xs font-bold text-destructive flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
