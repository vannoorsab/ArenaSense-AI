'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, MapPin, Users, Clock, AlertTriangle, Zap, 
  ShieldAlert, Play, Pause, RotateCcw, ChevronDown, Settings
} from 'lucide-react';
import Link from 'next/link';
import CrowdHeatmap from './crowd-heatmap';
import AlertsPanel from './alerts-panel';
import RecommendationCard from './recommendation-card';
import AIAssistant from './ai-assistant';
import PredictiveAlerts from './predictive-alerts';
import { CrowdSimulator, SimulationState } from '@/lib/crowd-simulator';
import { AIDecisionEngine } from '@/lib/ai-engine';
import { User, AIRecommendation, AnomalyAlert } from '@/lib/types';

type Scenario = 'normal' | 'entry_rush' | 'halftime' | 'exit_surge';

export default function AttendeeInterface() {
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('seating-lower-north');
  const [isRunning, setIsRunning] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  // Initialize simulation
  useEffect(() => {
    const initial = CrowdSimulator.initializeSimulation(45000);
    setSimState(initial);

    setCurrentUser({
      id: 'user-1',
      currentZone: 'seating-lower-north',
      location: { x: 50, y: 30, zone: 'seating-lower-north' },
      preferences: {
        avoidCrowds: true,
        preferQuickestRoute: false,
        accessibility: false,
      },
    });
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (!simState || !currentUser || !isRunning) return;

    const interval = setInterval(() => {
      setSimState((prev) => {
        if (!prev) return prev;

        const newState = CrowdSimulator.step(prev, scenario);
        const newAlerts = AIDecisionEngine.detectAnomalies(newState.crowdData, newState.predictions);
        setAlerts(newAlerts);

        const rec = AIDecisionEngine.generateRecommendation(
          currentUser,
          newState.crowdData,
          newState.predictions,
          newState.queues,
          newAlerts,
          selectedZone !== currentUser.currentZone ? selectedZone : undefined
        );
        setRecommendation(rec);

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentUser, selectedZone, scenario]);

  // Auto-activate emergency mode on critical alerts
  useEffect(() => {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0 && !emergencyMode) {
      // Don't auto-activate, just warn
    }
  }, [alerts]);

  const handleScenarioChange = (newScenario: Scenario) => {
    setScenario(newScenario);
    setShowScenarioMenu(false);
    // Reset simulation with new scenario
    const initial = CrowdSimulator.initializeSimulation(45000);
    setSimState(initial);
  };

  const handleReset = () => {
    const initial = CrowdSimulator.initializeSimulation(45000);
    setSimState(initial);
    setSelectedZone('seating-lower-north');
    setEmergencyMode(false);
    setScenario('normal');
    setCurrentUser({
      id: 'user-1',
      currentZone: 'seating-lower-north',
      location: { x: 50, y: 30, zone: 'seating-lower-north' },
      preferences: {
        avoidCrowds: true,
        preferQuickestRoute: false,
        accessibility: false,
      },
    });
  };

  if (!simState || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Stadium Navigator...</p>
        </div>
      </div>
    );
  }

  const currentCrowd = simState.crowdData.get(currentUser.currentZone);
  const systemMetrics = AIDecisionEngine.generateSystemMetrics(simState.crowdData, alerts);
  const dangerZones = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').map(a => a.zone);

  const scenarioLabels: Record<Scenario, string> = {
    normal: 'Normal',
    entry_rush: 'Entry Rush',
    halftime: 'Halftime',
    exit_surge: 'Exit Rush',
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${emergencyMode ? 'emergency-active' : ''}`}>
      {/* Emergency Mode Global Banner */}
      {emergencyMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <ShieldAlert className="w-4 h-4" />
            EMERGENCY MODE ACTIVE - Follow evacuation routes shown on map
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEmergencyMode(false)}
              className="ml-4 h-6 text-xs"
            >
              Deactivate
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b border-border bg-card sticky ${emergencyMode ? 'top-10' : 'top-0'} z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">ArenaSense AI Navigator</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Crowd Intelligence</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                systemMetrics.emergencyStatus === 'critical'
                  ? 'bg-red-100 text-destructive'
                  : systemMetrics.emergencyStatus === 'alert'
                    ? 'bg-orange-100 text-accent'
                    : 'bg-green-100 text-green-700'
              }`}>
                {systemMetrics.totalAttendees.toLocaleString()} Attendees
              </div>
              
              {/* Admin Link */}
              <Link href="/admin">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Settings className="w-3.5 h-3.5" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Column - Heatmap & Alerts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Heatmap Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Live Crowd Heatmap</CardTitle>
                    <CardDescription className="text-xs">Real-time density by zone</CardDescription>
                  </div>
                  {/* Emergency Button */}
                  <Button
                    variant={emergencyMode ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setEmergencyMode(!emergencyMode)}
                    className="gap-1.5 h-8"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    {emergencyMode ? 'Exit Emergency' : 'Emergency Mode'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CrowdHeatmap
                  crowdData={simState.crowdData}
                  currentZone={currentUser.currentZone}
                  onZoneSelect={(zoneId) => {
                    setSelectedZone(zoneId);
                    setCurrentUser({ ...currentUser, currentZone: zoneId });
                  }}
                  emergencyMode={emergencyMode}
                  dangerZones={dangerZones}
                />
              </CardContent>
            </Card>

            {/* Predictive Alerts */}
            <PredictiveAlerts 
              predictions={simState.predictions} 
              currentZone={currentUser.currentZone}
            />

            {/* Active Alerts */}
            {alerts.length > 0 && (
              <Card className={alerts.some(a => a.severity === 'critical') ? 'border-destructive' : 'border-accent'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      alerts.some(a => a.severity === 'critical') ? 'text-destructive' : 'text-accent'
                    }`} />
                    Active Alerts ({alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertsPanel alerts={alerts} compact />
                </CardContent>
              </Card>
            )}

            {/* Simulation Controls */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Simulation Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Play/Pause */}
                  <Button
                    variant={isRunning ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsRunning(!isRunning)}
                    className="gap-1.5 h-8"
                  >
                    {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isRunning ? 'Pause' : 'Play'}
                  </Button>

                  {/* Reset */}
                  <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 h-8">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>

                  {/* Scenario Selector */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                      className="gap-1.5 h-8"
                    >
                      Scenario: {scenarioLabels[scenario]}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    
                    {showScenarioMenu && (
                      <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                        {(Object.keys(scenarioLabels) as Scenario[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleScenarioChange(s)}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              s === scenario ? 'bg-muted font-semibold' : ''
                            }`}
                          >
                            {scenarioLabels[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Current Location Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Your Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {currentUser.currentZone.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Density: {currentCrowd?.density.toFixed(0)}% · {currentCrowd?.currentCount.toLocaleString()} people
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Trend:</span>
                  </div>
                  <span className={`font-medium ${
                    currentCrowd?.trend === 'increasing' ? 'text-accent' :
                    currentCrowd?.trend === 'decreasing' ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {currentCrowd?.trend === 'increasing' ? 'Filling Up' :
                     currentCrowd?.trend === 'decreasing' ? 'Emptying' : 'Stable'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Smart Recommendation */}
            {recommendation && <RecommendationCard recommendation={recommendation} />}

            {/* AI Assistant */}
            <AIAssistant
              currentZone={currentUser.currentZone}
              crowdDensity={currentCrowd?.density || 50}
              onNavigate={(zone) => {
                setSelectedZone(zone);
                setCurrentUser({ ...currentUser, currentZone: zone });
              }}
              onQuickAction={(action) => {
                if (action === 'exit' && emergencyMode) {
                  // Could trigger specific navigation
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
