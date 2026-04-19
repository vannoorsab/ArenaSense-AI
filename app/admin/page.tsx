'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, TrendingUp, Users, AlertCircle, Activity, 
  Send, Play, Pause, RotateCcw, Radio, ShieldAlert, Eye,
  ChevronDown, ArrowLeft, Calendar, MapPin, Ticket, Clock,
  CheckCircle2, XCircle, BarChart3, DoorOpen, Brain, Zap
} from 'lucide-react';
import Link from 'next/link';
import SystemMetricsChart from '@/components/system-metrics-chart';
import PredictiveAnalytics from '@/components/predictive-analytics';
import CrowdHeatmap from '@/components/crowd-heatmap';
import GateCrowdPanel from '@/components/gate-crowd-panel';
import AIVisionPanel from '@/components/ai-vision-panel';
import { CrowdService, type CrowdState } from '@/lib/services/crowd-service';
import { AlertService } from '@/lib/services/alert-service';
import { EmergencyService } from '@/lib/services/emergency-service';
import { getEventById, EVENTS, formatEventDate, getSportIcon } from '@/lib/data/events-data';
import { CSK_MATCHES, formatMatchDate } from '@/lib/data/csk-matches';
import { SystemMetrics, AnomalyAlert } from '@/lib/types';

type Scenario = 'normal' | 'entry_rush' | 'halftime' | 'exit_surge';

// Combine all events for admin view
const ALL_EVENTS = [
  ...CSK_MATCHES.map(m => ({
    id: m.id,
    name: `CSK vs ${m.opponent}`,
    sport: 'cricket' as const,
    date: m.date,
    time: m.time,
    venue: m.venue,
    capacity: m.capacity,
    registeredCount: m.registeredCount,
    status: m.status,
    isCSK: true,
  })),
  ...EVENTS.map(e => ({
    id: e.id,
    name: e.name,
    sport: e.sport,
    date: e.date,
    time: e.time,
    venue: e.venue,
    capacity: e.capacity,
    registeredCount: e.registeredCount,
    status: e.status,
    isCSK: false,
  })),
];

export default function AdminDashboard() {
  const [crowdState, setCrowdState] = useState<CrowdState | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    setCrowdState(CrowdService.initialize(45000));
  }, []);

  useEffect(() => {
    if (!crowdState || !isRunning) return;

    const runStep = async () => {
      try {
        const next = await CrowdService.processStep(crowdState, scenario);
        
        // Compute metrics
        const dataArray = Array.from(next.crowdData.values());
        const totalPeople = dataArray.reduce((s, z) => s + z.currentCount, 0);
        const avgDensity = dataArray.length > 0 
          ? dataArray.reduce((s, z) => s + z.density, 0) / dataArray.length 
          : 0;
        
        setSystemMetrics({
          totalAttendees: totalPeople,
          averageDensity: avgDensity,
          criticalZones: dataArray.filter(z => z.density > 80).map(z => z.zone),
          activePredictions: next.predictions.length,
          emergencyStatus: emergencyActive ? 'critical' : 'normal',
          lastUpdate: Date.now(),
        });

        setCrowdState(next);
      } catch (error) {
        console.error("[AdminDashboard] Simulation step failed:", error);
      }
    };

    const interval = setTimeout(runStep, 2000);
    return () => clearTimeout(interval);
  }, [isRunning, scenario, crowdState, emergencyActive]);

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      AlertService.broadcast(broadcastMessage.trim(), 'warning');
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 3000);
      setBroadcastMessage('');
    }
  };

  const handleScenarioChange = (newScenario: Scenario) => {
    setScenario(newScenario);
    setShowScenarioMenu(false);
    setCrowdState(CrowdService.initialize(45000));
  };

  const handleReset = () => {
    setCrowdState(CrowdService.initialize(45000));
    setScenario('normal');
    setEmergencyActive(false);
  };

  if (!crowdState || !systemMetrics) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const highAlerts = alerts.filter((a) => a.severity === 'high');
  const dangerZones = [...criticalAlerts, ...highAlerts].map(a => a.zone);

  const scenarioLabels: Record<Scenario, string> = {
    normal: 'Normal Operations',
    entry_rush: 'Entry Rush',
    halftime: 'Halftime Break',
    exit_surge: 'Exit Surge',
  };

  // Calculate event stats
  const liveEvents = ALL_EVENTS.filter(e => e.status === 'live');
  const upcomingEvents = ALL_EVENTS.filter(e => e.status === 'upcoming');
  const totalRegistered = ALL_EVENTS.reduce((sum, e) => sum + e.registeredCount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Emergency Banner */}
      {emergencyActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              EMERGENCY PROTOCOL ACTIVE - All users receiving evacuation guidance
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEmergencyActive(false)}
              className="h-7 text-xs"
            >
              Deactivate Emergency
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b border-border bg-card sticky ${emergencyActive ? 'top-10' : 'top-0'} z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <div className="border-l border-border pl-4">
                <h1 className="text-xl font-bold">Admin Control Center</h1>
                <p className="text-xs text-muted-foreground">Real-time Monitoring & Event Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Total Registered</p>
                <p className="font-bold text-lg">{totalRegistered.toLocaleString()}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                systemMetrics.emergencyStatus === 'critical'
                  ? 'bg-red-100 text-destructive animate-pulse'
                  : systemMetrics.emergencyStatus === 'alert'
                    ? 'bg-orange-100 text-accent'
                    : 'bg-green-100 text-green-700'
              }`}>
                System: {systemMetrics.emergencyStatus.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Critical Alert Banner */}
        {criticalAlerts.length > 0 && (
          <Card className="mb-4 border-destructive bg-red-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">
                      {criticalAlerts.length} Critical Incident{criticalAlerts.length > 1 ? 's' : ''} Detected
                    </p>
                    <p className="text-xs text-red-700">
                      {criticalAlerts.map(a => a.zone).join(', ')} - Immediate action recommended
                    </p>
                  </div>
                </div>
                {!emergencyActive && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setEmergencyActive(true)}
                    className="gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Activate Emergency
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-card border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-1.5">
              <Eye className="w-4 h-4" />
              Live Overview
            </TabsTrigger>
            <TabsTrigger value="gates" className="gap-1.5">
              <DoorOpen className="w-4 h-4" />
              Gates
            </TabsTrigger>
            <TabsTrigger value="ai-vision" className="gap-1.5">
              <Brain className="w-4 h-4" />
              Cloud AI
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5">
              <Calendar className="w-4 h-4" />
              All Events ({ALL_EVENTS.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Live Events</p>
                      <p className="text-2xl font-bold text-green-600">{liveEvents.length}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                    </div>
                    <Calendar className="w-6 h-6 text-primary opacity-30" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Attendees</p>
                      <p className="text-2xl font-bold">{systemMetrics.totalAttendees.toLocaleString()}</p>
                    </div>
                    <Users className="w-6 h-6 text-primary opacity-30" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Density</p>
                      <p className="text-2xl font-bold">{systemMetrics.averageDensity.toFixed(0)}%</p>
                    </div>
                    <Activity className="w-6 h-6 text-secondary opacity-30" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Alerts</p>
                      <p className={`text-2xl font-bold ${alerts.length > 0 ? 'text-accent' : 'text-green-600'}`}>
                        {alerts.length}
                      </p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-accent opacity-30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* Full Stadium Heatmap */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Stadium Overview
                        </CardTitle>
                        <CardDescription className="text-xs">Full venue crowd distribution</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CrowdHeatmap
                      crowdData={crowdState.crowdData}
                      currentZone=""
                      onZoneSelect={() => {}}
                      emergencyMode={emergencyActive}
                      dangerZones={dangerZones}
                    />
                  </CardContent>
                </Card>
 
                {/* Real-Time Metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Real-Time Crowd Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SystemMetricsChart crowdData={crowdState.crowdData} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4">
                {/* Simulation Controls */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Simulation Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={isRunning ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsRunning(!isRunning)}
                        className="flex-1 gap-1.5"
                      >
                        {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isRunning ? 'Pause' : 'Resume'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                        className="w-full justify-between"
                      >
                        <span className="text-xs">Scenario: {scenarioLabels[scenario]}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                      
                      {showScenarioMenu && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
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
                  </CardContent>
                </Card>

                {/* Alert Detection */}
                <Card className={alerts.length > 0 ? 'border-accent' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent" />
                      Alert Detection ({alerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alerts.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No active alerts. All zones operating normally.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {alerts.slice(0, 5).map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-2 rounded-lg border text-xs ${
                              alert.severity === 'critical'
                                ? 'bg-red-50 border-red-200 text-red-900'
                                : alert.severity === 'high'
                                  ? 'bg-orange-50 border-orange-200 text-orange-900'
                                  : 'bg-yellow-50 border-yellow-200 text-yellow-900'
                            }`}
                          >
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-[10px] opacity-70 mt-0.5">
                              {alert.zone} - {alert.affectedPeople.toLocaleString()} affected
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Emergency Control */}
                <Card className="border-destructive/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                      <ShieldAlert className="w-4 h-4" />
                      Emergency Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={emergencyActive ? 'outline' : 'destructive'}
                      size="sm"
                      onClick={() => setEmergencyActive(!emergencyActive)}
                      className="w-full gap-1.5"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      {emergencyActive ? 'Deactivate Emergency' : 'Activate Emergency Mode'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Broadcast System */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Broadcast to Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Quick Presets */}
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Quick Presets</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      <Button size="sm" variant="outline" className="w-full text-xs h-7 gap-1 justify-start" onClick={() => handlePresetAlert('gate2Overcrowded')}>
                        <Zap className="w-3 h-3 text-red-500" /> Gate B Overcrowded
                      </Button>
                      <Button size="sm" variant="outline" className="w-full text-xs h-7 gap-1 justify-start" onClick={() => handlePresetAlert('useAlternateExit')}>
                        <Zap className="w-3 h-3 text-amber-500" /> Use Alternate Exit
                      </Button>
                      <Button size="sm" variant="outline" className="w-full text-xs h-7 gap-1 justify-start" onClick={() => handlePresetAlert('gateBlockage')}>
                        <Zap className="w-3 h-3 text-amber-500" /> Gate C Blockage
                      </Button>
                      <Button size="sm" variant="destructive" className="w-full text-xs h-7 gap-1 justify-start" onClick={() => handlePresetAlert('emergency')}>
                        <ShieldAlert className="w-3 h-3" /> Emergency Broadcast
                      </Button>
                    </div>
                    <div className="border-t border-border pt-2">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Custom Message</p>
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Enter custom announcement..."
                        className="w-full h-14 px-3 py-2 text-xs border border-border rounded-lg bg-card resize-none"
                      />
                      <Button
                        size="sm"
                        onClick={handleBroadcast}
                        disabled={!broadcastMessage.trim()}
                        className="w-full gap-1.5 mt-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send to All
                      </Button>
                    </div>
                    {broadcastSent && (
                      <p className="text-xs text-green-600 text-center animate-pulse">
                        ✅ Alert broadcast to all users!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gates Tab */}
          <TabsContent value="gates" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DoorOpen className="w-4 h-4" />
                      Gate Crowd Management
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Real-time crowd density at all entry and exit gates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GateCrowdPanel scenario={scenario} />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Cloud AI Vision
                    </CardTitle>
                    <CardDescription className="text-xs">Google Cloud Vision AI analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIVisionPanel scenario={scenario} compact />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cloud AI Tab */}
          <TabsContent value="ai-vision" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Google Cloud Vision AI — Crowd Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-powered crowd density estimation across all camera feeds · Updates every 5 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIVisionPanel scenario={scenario} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            {/* Event Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Live Now</p>
                      <p className="text-2xl font-bold text-green-800">{liveEvents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Registered</p>
                      <p className="text-2xl font-bold">{totalRegistered.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Events</p>
                      <p className="text-2xl font-bold">{ALL_EVENTS.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">All Events</CardTitle>
                <CardDescription>Click on an event to view details and member counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {ALL_EVENTS.sort((a, b) => {
                    // Live events first, then by date
                    if (a.status === 'live' && b.status !== 'live') return -1;
                    if (b.status === 'live' && a.status !== 'live') return 1;
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                  }).map((event) => {
                    const fillPercentage = Math.round((event.registeredCount / event.capacity) * 100);
                    const isExpanded = selectedEvent === event.id;
                    
                    return (
                      <div
                        key={event.id}
                        className={`border rounded-lg transition-all cursor-pointer ${
                          event.status === 'live' 
                            ? 'border-green-300 bg-green-50/50' 
                            : 'border-border hover:border-primary/50'
                        } ${isExpanded ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedEvent(isExpanded ? null : event.id)}
                      >
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Event Icon/Badge */}
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                event.isCSK 
                                  ? 'bg-[#FDB913]' 
                                  : event.sport === 'football' 
                                    ? 'bg-green-500'
                                    : event.sport === 'basketball'
                                      ? 'bg-orange-500'
                                      : event.sport === 'concert'
                                        ? 'bg-purple-500'
                                        : 'bg-primary'
                              }`}>
                                {event.isCSK ? (
                                  <span className="text-[#003B7B] font-black text-sm">CSK</span>
                                ) : (
                                  <span className="text-white text-lg">{getSportIcon(event.sport)}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm truncate">{event.name}</h3>
                                  {event.status === 'live' && (
                                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0">
                                      LIVE
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatMatchDate(event.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {event.time}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.venue}
                                </p>
                              </div>
                            </div>

                            {/* Registration Stats */}
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1 justify-end mb-1">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="font-bold text-lg">{event.registeredCount.toLocaleString()}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                of {event.capacity.toLocaleString()} capacity
                              </p>
                              <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    fillPercentage > 90 ? 'bg-red-500' :
                                    fillPercentage > 75 ? 'bg-orange-500' :
                                    fillPercentage > 50 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${fillPercentage}%` }}
                                />
                              </div>
                              <p className="text-[10px] font-medium mt-0.5">{fillPercentage}% filled</p>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold text-primary">{event.registeredCount.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">Registered</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold">{(event.capacity - event.registeredCount).toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">Available</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold">{fillPercentage}%</p>
                                  <p className="text-xs text-muted-foreground">Fill Rate</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold flex items-center justify-center">
                                    {event.status === 'live' ? (
                                      <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-5 h-5" /> Live
                                      </span>
                                    ) : event.status === 'upcoming' ? (
                                      <span className="text-primary">Upcoming</span>
                                    ) : (
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <XCircle className="w-5 h-5" /> Ended
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Status</p>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Link href={event.isCSK ? `/csk/${event.id}` : `/events/${event.id}`} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full">
                                    View Event
                                  </Button>
                                </Link>
                                {event.status === 'live' && (
                                  <Link href={event.isCSK ? `/csk/${event.id}/stadium` : `/stadium-live`} className="flex-1">
                                    <Button size="sm" className="w-full">
                                      Live Stadium
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Predictive Analytics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription className="text-xs">AI forecasts for next 30+ minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <PredictiveAnalytics
                  predictions={crowdState.predictions}
                  crowdData={crowdState.crowdData}
                />
              </CardContent>
            </Card>

            {/* Real-Time Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Real-Time Crowd Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemMetricsChart crowdData={crowdState.crowdData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
