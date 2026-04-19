'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, Save } from 'lucide-react';
import CrowdDensityGraph from '@/components/crowd-density-graph';
import { CrowdService, type CrowdState } from '@/lib/services/crowd-service';
import { AlertService } from '@/lib/services/alert-service';
import { AnomalyAlert, SystemMetrics } from '@/lib/types';
import ScenarioResults from '@/components/scenario-results';

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
  const [crowdState, setCrowdState] = useState<CrowdState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1); 
  const [currentTime, setCurrentTime] = useState(0);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [scenarioRuns, setScenarioRuns] = useState<ScenarioRun[]>([]);
  const [densityHistory, setDensityHistory] = useState<number[]>([]);

  // Initialize simulation
  useEffect(() => {
    const initial = CrowdService.initialize(45000);
    setCrowdState(initial);
  }, []);

  const handleResetScenario = () => {
    const initial = CrowdService.initialize(45000);
    setCrowdState(initial);
    setCurrentTime(0);
    setDensityHistory([]);
    setAlerts([]);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!crowdState || !isRunning) return;

    const stepInterval = Math.max(50, 500 / timeMultiplier);

    const interval = setInterval(() => {
      setCrowdState((prev) => {
        if (!prev) return prev;

        const next = CrowdService.processStep(prev, activeScenario);
        setCurrentTime((t) => t + 1);

        // Calculate avg density for history
        const avgDensity = Array.from(next.crowdData.values()).reduce((s, z) => s + z.density, 0) / next.crowdData.size;
        setDensityHistory((hist) => [...hist.slice(-119), avgDensity]);

        return next;
      });
    }, stepInterval);

    return () => clearInterval(interval);
  }, [isRunning, activeScenario, timeMultiplier, crowdState === null]);

  if (!crowdState) return null;

  const currentDensity = densityHistory[densityHistory.length - 1] || 0;
  const maxDensity = Math.max(...densityHistory, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Scenario Testing & Validation</h1>
          <p className="text-sm text-muted-foreground">Test system behavior under different crowd conditions</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                      className="h-auto py-3 px-4"
                    >
                      <div className="text-left">
                        <div className="font-semibold text-sm capitalize">{scenario.replace(/_/g, ' ')}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button onClick={() => setIsRunning(!isRunning)} size="sm" className="flex-1">
                      {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button onClick={handleResetScenario} variant="outline" size="sm" disabled={isRunning}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulation Telemetry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Average Density</p>
                    <p className="text-2xl font-bold">{currentDensity.toFixed(0)}%</p>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Max Recorded</p>
                    <p className="text-2xl font-bold">{maxDensity.toFixed(0)}%</p>
                  </div>
                </div>
                <CrowdDensityGraph data={densityHistory} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scenario</span>
                  <span className="font-semibold capitalize">{activeScenario.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendees</span>
                  <span className="font-semibold">45,000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
