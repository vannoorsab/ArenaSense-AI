'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Navigation, Clock, Users, AlertCircle } from 'lucide-react';
import { CrowdService, type CrowdState } from '@/lib/services/crowd-service';
import { EmergencyService } from '@/lib/services/emergency-service';
import { AlertService } from '@/lib/services/alert-service';
import { EvacuationRoute, AnomalyAlert } from '@/lib/types';

export default function EmergencyPage() {
  const [crowdState, setCrowdState] = useState<CrowdState | null>(null);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoute[]>([]);
  const [panicDetected, setPanicDetected] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  // Initialize simulation with emergency scenario
  useEffect(() => {
    const initial = CrowdService.initialize(60000); 
    setCrowdState(initial);
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (!crowdState || !isRunning) return;

    const interval = setInterval(() => {
      setCrowdState((prev) => {
        if (!prev) return prev;

        const next = CrowdService.processStep(prev, 'entry_rush');
        const nextAlerts = AlertService.triggerAiAlert(next.crowdData, next.predictions);
        
        // Safety protocol
        const panic = EmergencyService.detectPanicMovement(nextAlerts, next.crowdData);
        const routes = EmergencyService.generateEvacuationRoutes(
          'seating-lower-north',
          next.crowdData,
          panic ? 'safety_first' : 'balanced'
        );

        setPanicDetected(panic);
        setEvacuationRoutes(routes);
        setAlerts(nextAlerts);

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, crowdState === null]);

  if (!crowdState) return null;

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const bestRoute = evacuationRoutes[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className={`border-b sticky top-0 z-40 transition-colors ${
        panicDetected ? 'bg-red-600 border-red-700 text-white' : 'bg-card border-border'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {panicDetected ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <Navigation className="w-6 h-6" />}
                {panicDetected ? 'EMERGENCY PROTOCOL ACTIVE' : 'Emergency Response System'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Route</CardTitle>
                <CardDescription>AI-generated safety paths</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bestRoute ? (
                    <div className="p-6 bg-muted rounded-xl border-2 border-primary/20">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">{bestRoute.name}</h2>
                          <p className="text-muted-foreground">Safety Score: {bestRoute.safetyScore.toFixed(0)}/100</p>
                        </div>
                        <Badge variant="outline" className="px-3 py-1">Optimal Path</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-background rounded-lg shadow-sm">
                          <Clock className="w-5 h-5 text-primary mb-2" />
                          <p className="text-xs text-muted-foreground">Est. Time</p>
                          <p className="font-bold text-lg">{bestRoute.estimatedTime.toFixed(0)} min</p>
                        </div>
                        <div className="p-4 bg-background rounded-lg shadow-sm">
                          <Users className="w-5 h-5 text-secondary mb-2" />
                          <p className="text-xs text-muted-foreground">Current Crowding</p>
                          <p className="font-bold text-lg">{bestRoute.currentCrowding}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Calculating routes...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Live Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalAlerts.length > 0 ? (
                  criticalAlerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-white rounded-lg border border-destructive/20 shadow-sm flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{alert.zone}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No critical alerts currently active.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Exit Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {evacuationRoutes.map(route => (
                  <Button
                    key={route.id}
                    variant={selectedRoute === route.id ? 'default' : 'outline'}
                    className="w-full justify-between h-auto py-3 px-4"
                    onClick={() => setSelectedRoute(route.id)}
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm">{route.name}</p>
                      <p className="text-[10px] opacity-70">Safety: {route.safetyScore.toFixed(0)}%</p>
                    </div>
                    <span className="text-xs font-mono">{route.estimatedTime.toFixed(0)}m</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant: 'outline' | 'default', className?: string }) {
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold ${variant === 'outline' ? 'border border-current' : 'bg-primary text-white'} ${className}`}>
      {children}
    </span>
  );
}
