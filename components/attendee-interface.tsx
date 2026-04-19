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
import { CrowdService, type CrowdState } from '@/lib/services/crowd-service';
import { AlertService } from '@/lib/services/alert-service';
import { EmergencyService } from '@/lib/services/emergency-service';
import { GoogleCloudLogging } from '@/lib/services/google-cloud-logging';
import { User, AIRecommendation, AnomalyAlert } from '@/lib/types';

type Scenario = 'normal' | 'entry_rush' | 'halftime' | 'exit_surge';

export default function AttendeeInterface() {
  const [crowdState, setCrowdState] = useState<CrowdState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('seating-lower-north');
  const [isRunning, setIsRunning] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  // Initialize
  useEffect(() => {
    setCrowdState(CrowdService.initialize(45000));
    setCurrentUser({
      id: 'user-vip',
      currentZone: 'seating-lower-north',
      location: { x: 50, y: 30, zone: 'seating-lower-north' },
      preferences: { avoidCrowds: true, preferQuickestRoute: true, accessibility: false },
    });
  }, []);

  // Main Loop
  useEffect(() => {
    if (!crowdState || !currentUser || !isRunning) return;

    const interval = setInterval(() => {
      setCrowdState(prev => {
        if (!prev) return prev;
        const next = CrowdService.processStep(prev, scenario);
        
        // Log telemetry to Google Cloud
        GoogleCloudLogging.info('Crowd Telemetry Updated', {
          timestamp: next.timestamp,
          scenario,
          activeAlerts: AlertService.getActiveAlerts().length,
          avgDensity: Array.from(next.crowdData.values()).reduce((s, d) => s + d.density, 0) / next.crowdData.size
        });

        // Auto-trigger AI alerts
        const currentZoneCrowd = next.crowdData.get(currentUser.currentZone);
        if (currentZoneCrowd) {
          AlertService.triggerAiAlert(currentZoneCrowd.zone, currentZoneCrowd.density);
        }

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, currentUser, scenario, crowdState === null]);

  const handleScenarioChange = (newScenario: Scenario) => {
    setScenario(newScenario);
    setShowScenarioMenu(false);
    setCrowdState(CrowdService.initialize(45000));
  };

  const handleReset = () => {
    setCrowdState(CrowdService.initialize(45000));
    setEmergencyMode(false);
    setScenario('normal');
  };

  if (!crowdState || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium animate-pulse">Establishing Secure Connection to ArenaSense AI...</p>
        </div>
      </div>
    );
  }

  const currentCrowd = crowdState.crowdData.get(currentUser.currentZone);
  const dangerZones = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').map(a => a.zone);

  const scenarioLabels: Record<Scenario, string> = {
    normal: 'Normal Operations',
    entry_rush: 'Entry Rush Level 3',
    halftime: 'Halftime Peak',
    exit_surge: 'Exit Surge Alert',
  };

  return (
    <div className={`min-h-screen bg-background text-foreground transition-all duration-500 ${emergencyMode ? 'bg-red-950/20' : ''}`}>
      {/* Emergency Mode Global Banner */}
      {emergencyMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 text-center shadow-xl border-b-2 border-red-700">
          <div className="flex items-center justify-center gap-3 text-sm font-black uppercase tracking-tighter">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            CRITICAL EMERGENCY: FOLLOW EVACUATION ROUTES IMMEDIATELY
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEmergencyMode(false)}
              className="ml-6 bg-white text-red-600 border-none h-7 px-4 hover:bg-white/90"
            >
              System Override
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b border-border bg-card/80 backdrop-blur-md sticky ${emergencyMode ? 'top-12' : 'top-0'} z-40 shadow-sm transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-indigo-500/20 shadow-lg">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">ARENASENSE <span className="text-primary italic">AI</span></h1>
                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-0.5">Production Monitoring Node</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1 bg-green-500/10 text-green-600 border-green-500/20 font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                SYSTEM HEALTH: OPTIMAL
              </Badge>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="h-8 font-bold border-2 hover:bg-primary hover:text-white transition-all">
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  ADMIN PANEL
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-primary" />
                       REAL-TIME STADIUM HEATMAP
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">Vision AI analyzed zone density metrics</CardDescription>
                  </div>
                  <Button
                    variant={emergencyMode ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setEmergencyMode(!emergencyMode)}
                    className="gap-2 h-9 font-black border-2 shadow-lg transition-all active:scale-95"
                    aria-label={emergencyMode ? 'Terminate emergency mode' : 'Trigger emergency evacuation protocol'}
                    aria-pressed={emergencyMode}
                  >
                    <ShieldAlert className={`w-4 h-4 ${emergencyMode ? 'animate-pulse' : ''}`} />
                    {emergencyMode ? 'TERMINATE EMERGENCY' : 'TRIGGER EMERGENCY'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CrowdHeatmap
                  crowdData={crowdState.crowdData}
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

            <PredictiveAlerts 
              predictions={crowdState.predictions} 
              currentZone={currentUser.currentZone}
            />

            <Card className="border-2 shadow-sm">
              <CardHeader className="bg-muted/10 pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Operational Dynamics</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={isRunning ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsRunning(!isRunning)}
                    className="gap-2 font-bold px-4"
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'FREEZE ENGINE' : 'RESUME ENGINE'}
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 font-bold px-4 border-2">
                    <RotateCcw className="w-4 h-4" />
                    RESTART
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                      className="gap-2 font-bold border-2 bg-background"
                    >
                      <span>Scenario:</span>
                      <span className="text-primary italic underline-offset-4 decoration-2">{scenarioLabels[scenario]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    
                    {showScenarioMenu && (
                      <div className="absolute top-full left-0 mt-2 bg-card border-2 border-border rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden animate-in fade-in zoom-in duration-200">
                        {(Object.keys(scenarioLabels) as Scenario[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleScenarioChange(s)}
                            className={`w-full text-left px-4 py-3 text-xs font-bold transition-all hover:bg-primary hover:text-white ${
                              s === scenario ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
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

          <div className="space-y-6">
            <Card className="border-2 bg-primary/5 shadow-inner">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-black">USER TELEMETRY</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">
                      {currentUser.currentZone.replace(/-/g, ' ')}
                    </p>
                    <p className="text-[11px] font-bold text-muted-foreground">
                      Density Impact: {Math.round(currentCrowd?.density || 0)}%
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-primary/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Zone Status</span>
                  <Badge className={`font-black tracking-tighter ${
                    currentCrowd?.trend === 'increasing' ? 'bg-orange-500' : 'bg-green-600'
                  }`}>
                    {currentCrowd?.trend === 'increasing' ? 'CONGESTING' : 'STABLE'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {recommendation && <RecommendationCard recommendation={recommendation} />}

            <AIAssistant
              currentZone={currentUser.currentZone}
              crowdDensity={currentCrowd?.density || 50}
              onNavigate={(zone) => {
                setSelectedZone(zone);
                setCurrentUser({ ...currentUser, currentZone: zone });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
