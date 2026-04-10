'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Navigation, MapPin, Clock, Users, AlertCircle } from 'lucide-react';
import EvacuationMap from '@/components/evacuation-map';
import EmergencyStats from '@/components/emergency-stats';
import { CrowdSimulator, SimulationState } from '@/lib/crowd-simulator';
import { AIDecisionEngine } from '@/lib/ai-engine';
import { EmergencySystem } from '@/lib/emergency-system';
import { EvacuationRoute, AnomalyAlert } from '@/lib/types';

export default function EmergencyPage() {
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoute[]>([]);
  const [panicDetected, setPanicDetected] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  // Initialize simulation with emergency scenario
  useEffect(() => {
    const initial = CrowdSimulator.initializeSimulation(60000); // Higher attendance for demo
    setSimState(initial);
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (!simState || !isRunning) return;

    const interval = setInterval(() => {
      setSimState((prev) => {
        if (!prev) return prev;

        // Run simulation with aggressive entry_rush to trigger alerts
        const newState = CrowdSimulator.step(prev, 'entry_rush');
        const newAlerts = AIDecisionEngine.detectAnomalies(newState.crowdData, newState.predictions);

        // Check for panic
        const isPanic = EmergencySystem.detectPanicMovement(newAlerts, newState.crowdData);
        setPanicDetected(isPanic);

        // Generate evacuation routes
        const routes = EmergencySystem.generateEvacuationRoutes(
          'seating-lower-north',
          newState.crowdData,
          isPanic ? 'safety_first' : 'balanced'
        );
        setEvacuationRoutes(routes);
        setAlerts(newAlerts);

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simState]);

  if (!simState) {
    return <div className="flex items-center justify-center h-screen">Loading Emergency System...</div>;
  }

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const bestRoute = evacuationRoutes[0];
  const totalAffected = Array.from(simState.crowdData.values()).reduce((sum, c) => sum + c.currentCount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Emergency Banner */}
      <header className={`border-b sticky top-0 z-40 ${
        panicDetected
          ? 'bg-red-600 border-red-700'
          : criticalAlerts.length > 0
            ? 'bg-orange-600 border-orange-700'
            : 'bg-card border-border'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className={panicDetected || criticalAlerts.length > 0 ? 'text-white' : ''}>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {panicDetected ? (
                  <>
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                    EMERGENCY EVACUATION PROTOCOL
                  </>
                ) : criticalAlerts.length > 0 ? (
                  <>
                    <AlertCircle className="w-6 h-6" />
                    CRITICAL ALERTS ACTIVE
                  </>
                ) : (
                  <>
                    <Navigation className="w-6 h-6" />
                    Emergency Response System
                  </>
                )}
              </h1>
              <p className={`text-sm mt-1 ${panicDetected || criticalAlerts.length > 0 ? 'text-white/90' : 'text-muted-foreground'}`}>
                Real-time evacuation assistance and emergency guidance
              </p>
            </div>

            <div className={`text-right px-4 py-2 rounded ${
              panicDetected
                ? 'bg-red-700 text-white'
                : criticalAlerts.length > 0
                  ? 'bg-orange-700 text-white'
                  : 'bg-muted text-foreground'
            }`}>
              <div className="font-bold">{totalAffected.toLocaleString()} People</div>
              <div className="text-xs">{criticalAlerts.length} Alert{criticalAlerts.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Evacuation Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Evacuation Route Map</CardTitle>
                <CardDescription>
                  {panicDetected ? 'Safety-optimized routes' : 'Optimal evacuation paths'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvacuationMap
                  routes={evacuationRoutes}
                  crowdData={simState.crowdData}
                  selectedRouteId={selectedRoute}
                  onSelectRoute={setSelectedRoute}
                />
              </CardContent>
            </Card>

            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <Card className="mt-6 border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Critical Alerts ({criticalAlerts.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {criticalAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-3 bg-red-50 rounded border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-sm">
                          <p className="font-bold">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.zone} • {alert.affectedPeople.toLocaleString()} people
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Route Selection */}
          <div className="space-y-6">
            {/* Recommended Route */}
            {bestRoute && (
              <Card className={bestRoute.safetyScore > 70 ? 'border-green-200' : 'border-orange-200'}>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Route</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-bold text-lg">{bestRoute.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Safety Score: {bestRoute.safetyScore.toFixed(0)}/100</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted p-3 rounded">
                      <Clock className="w-4 h-4 text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">Estimated Time</p>
                      <p className="font-bold text-sm">{bestRoute.estimatedTime.toFixed(0)} min</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <Users className="w-4 h-4 text-secondary mb-1" />
                      <p className="text-xs text-muted-foreground">Current Crowding</p>
                      <p className="font-bold text-sm">{bestRoute.currentCrowding}</p>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Navigation className="w-4 h-4 mr-2" />
                    Follow This Route
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* All Routes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Available Routes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {evacuationRoutes.map((route) => (
                  <Button
                    key={route.id}
                    onClick={() => setSelectedRoute(route.id)}
                    variant={selectedRoute === route.id ? 'default' : 'outline'}
                    className="w-full justify-start text-xs h-auto py-2"
                  >
                    <div className="text-left">
                      <div className="font-semibold">{route.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Safety: {route.safetyScore.toFixed(0)}% • {route.estimatedTime.toFixed(0)} min
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency Status</CardTitle>
              </CardHeader>
              <CardContent>
                <EmergencyStats alerts={alerts} crowdData={simState.crowdData} />
              </CardContent>
            </Card>

            {/* Demo Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demo Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant={isRunning ? 'default' : 'outline'}
                  className="w-full text-sm"
                >
                  {isRunning ? 'Pause' : 'Resume'} Simulation
                </Button>
                <p className="text-xs text-muted-foreground">
                  Showing entry rush scenario with {evacuationRoutes.length} available exits
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
