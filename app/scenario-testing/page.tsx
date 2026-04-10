'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, Save, TrendingUp } from 'lucide-react';
import ScenarioTimeline from '@/components/scenario-timeline';
import ScenarioResults from '@/components/scenario-results';
import CrowdDensityGraph from '@/components/crowd-density-graph';
import { CrowdSimulator, SimulationState } from '@/lib/crowd-simulator';
import { AIDecisionEngine } from '@/lib/ai-engine';
import { AnomalyAlert, SystemMetrics } from '@/lib/types';

interface ScenarioRun {
  name: string;
  type: 'entry_rush' | 'halftime' | 'exit_surge' | 'normal';
  duration: number; // minutes
  startTime: number;
  results: {
    maxDensity: number;
    avgDensity: number;
    peakAlerts: number;
    criticalZones: string[];
    evacuationTime: number;
  };
}

export default function ScenarioTestingPage() {
  const [activeScenario, setActiveScenario] = useState<'entry_rush' | 'halftime' | 'exit_surge' | 'normal'>('entry_rush');
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1); // 1x = real-time, 4x = fast forward
  const [currentTime, setCurrentTime] = useState(0);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [scenarioRuns, setScenarioRuns] = useState<ScenarioRun[]>([]);
  const [densityHistory, setDensityHistory] = useState<number[]>([]);

  // Initialize simulation
  useEffect(() => {
    const initial = CrowdSimulator.initializeSimulation(45000);
    setSimState(initial);
  }, []);

  // Reset scenario
  const handleResetScenario = () => {
    const initial = CrowdSimulator.initializeSimulation(45000);
    setSimState(initial);
    setCurrentTime(0);
    setDensityHistory([]);
    setAlerts([]);
    setIsRunning(false);
  };

  // Main simulation loop
  useEffect(() => {
    if (!simState || !isRunning) return;

    const stepInterval = Math.max(50, 500 / timeMultiplier); // Faster interval for fast-forward

    const interval = setInterval(() => {
      setSimState((prev) => {
        if (!prev) return prev;

        const newState = CrowdSimulator.step(prev, activeScenario);
        const newAlerts = AIDecisionEngine.detectAnomalies(newState.crowdData, newState.predictions);
        const newMetrics = AIDecisionEngine.generateSystemMetrics(newState.crowdData, newAlerts);

        setAlerts(newAlerts);
        setMetrics(newMetrics);
        setCurrentTime((t) => t + 1);

        // Track density history
        setDensityHistory((hist) => [...hist.slice(-119), newMetrics.averageDensity]);

        return newState;
      });
    }, stepInterval);

    return () => clearInterval(interval);
  }, [isRunning, activeScenario, timeMultiplier, simState]);

  // Auto-stop after 60 minutes
  useEffect(() => {
    if (currentTime >= 60) {
      setIsRunning(false);

      // Record results
      if (metrics) {
        const run: ScenarioRun = {
          name: `${activeScenario.toUpperCase()} - ${new Date().toLocaleTimeString()}`,
          type: activeScenario,
          duration: currentTime,
          startTime: Date.now(),
          results: {
            maxDensity: Math.max(...densityHistory, 0),
            avgDensity: densityHistory.reduce((a, b) => a + b, 0) / densityHistory.length || 0,
            peakAlerts: alerts.length,
            criticalZones: metrics.criticalZones,
            evacuationTime: Math.ceil(currentTime * 0.5),
          },
        };

        setScenarioRuns((prev) => [...prev, run]);
      }
    }
  }, [currentTime, metrics, alerts, densityHistory, activeScenario]);

  if (!simState || !metrics) {
    return <div className="flex items-center justify-center h-screen">Loading Scenario Testing...</div>;
  }

  const currentDensity = densityHistory[densityHistory.length - 1] || 0;
  const maxDensity = Math.max(...densityHistory, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Scenario Testing & Validation</h1>
          <p className="text-sm text-muted-foreground">Test system behavior under different crowd conditions</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scenario Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Active Scenario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(['entry_rush', 'halftime', 'exit_surge', 'normal'] as const).map((scenario) => (
                    <Button
                      key={scenario}
                      onClick={() => {
                        if (!isRunning) {
                          setActiveScenario(scenario);
                          handleResetScenario();
                        }
                      }}
                      variant={activeScenario === scenario ? 'default' : 'outline'}
                      disabled={isRunning}
                      className="h-auto py-3"
                    >
                      <div className="text-left">
                        <div className="font-semibold text-sm capitalize">{scenario.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-muted-foreground">
                          {scenario === 'entry_rush'
                            ? 'Gates opening'
                            : scenario === 'halftime'
                              ? 'Concourse rush'
                              : scenario === 'exit_surge'
                                ? 'End of event'
                                : 'Baseline'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Playback Controls */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button onClick={() => setIsRunning(!isRunning)} size="sm" className="flex-1">
                      {isRunning ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleResetScenario}
                      variant="outline"
                      size="sm"
                      disabled={isRunning}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={() => setCurrentTime((t) => Math.min(t + 5, 60))}
                      variant="outline"
                      size="sm"
                      disabled={isRunning || currentTime >= 60}
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      +5m
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Speed: {timeMultiplier}x</span>
                      <div className="flex gap-1">
                        {[1, 2, 4].map((mult) => (
                          <Button
                            key={mult}
                            onClick={() => setTimeMultiplier(mult)}
                            variant={timeMultiplier === mult ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 w-12 text-xs"
                          >
                            {mult}x
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted rounded p-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold">Simulation Time</span>
                        <span>{currentTime} / 60 min</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(currentTime / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-Time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Current Density</p>
                    <p className="text-2xl font-bold">{currentDensity.toFixed(0)}%</p>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Peak Density</p>
                    <p className="text-2xl font-bold">{maxDensity.toFixed(0)}%</p>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Active Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{alerts.length}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-3">Density Over Time</p>
                  <CrowdDensityGraph data={densityHistory} />
                </div>
              </CardContent>
            </Card>

            {/* Scenario Results */}
            {scenarioRuns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScenarioResults runs={scenarioRuns} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alert Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alert Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No alerts in current scenario</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-red-50 rounded p-2 border border-red-200">
                        <p className="text-xs text-muted-foreground">Critical</p>
                        <p className="text-xl font-bold text-destructive">
                          {alerts.filter((a) => a.severity === 'critical').length}
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded p-2 border border-orange-200">
                        <p className="text-xs text-muted-foreground">High</p>
                        <p className="text-xl font-bold text-orange-600">
                          {alerts.filter((a) => a.severity === 'high').length}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold mb-2">Most Affected Zone</p>
                      <p className="text-sm">
                        {metrics.criticalZones[0] ? metrics.criticalZones[0].split('-').pop() : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Attendees</span>
                  <span className="font-semibold">{metrics.totalAttendees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Critical Zones</span>
                  <span className="font-semibold">{metrics.criticalZones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-semibold ${
                    metrics.emergencyStatus === 'critical'
                      ? 'text-destructive'
                      : metrics.emergencyStatus === 'alert'
                        ? 'text-orange-600'
                        : 'text-green-600'
                  }`}>
                    {metrics.emergencyStatus.toUpperCase()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            {scenarioRuns.length > 0 && (
              <Button className="w-full" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
