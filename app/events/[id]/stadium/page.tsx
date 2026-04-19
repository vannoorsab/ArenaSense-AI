'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import {
  ArrowLeft,
  Users,
  MapPin,
  Navigation,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Utensils,
  Coffee,
  ShoppingBag,
  Info,
  Box,
  Layers,
  Zap,
  Shield,
} from 'lucide-react';
import { getEventById, formatEventDate, formatEventTime } from '@/lib/data/events-data';
import { CrowdService, type CrowdState } from '@/lib/services/crowd-service';
import { DEFAULT_VENUE } from '@/lib/data/venue-schema';
import { VenueZone, User, CrowdData, SportEvent } from '@/lib/types';
import { AlertService } from '@/lib/services/alert-service';
import type { AIRecommendation } from '@/lib/types';
import dynamic from 'next/dynamic';
import AIAssistant from '@/components/ai-assistant';

// Dynamic import for 3D component
const Stadium3D = dynamic(() => import('@/components/stadium-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] md:h-[600px] bg-gradient-to-b from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  ),
});

// Stadium Heatmap Component
function StadiumHeatmap({
  layout,
  crowdData,
  selectedZone,
  currentZone,
  onZoneSelect,
  onZoneNavigate,
}: {
  layout: typeof DEFAULT_VENUE;
  crowdData: Map<string, CrowdData>;
  selectedZone: string | null;
  currentZone: string;
  onZoneSelect: (zone: string | null) => void;
  onZoneNavigate: (zone: string) => void;
}) {
  const getDensityColor = (density: number): string => {
    if (density < 30) return 'bg-green-500';
    if (density < 50) return 'bg-green-400';
    if (density < 70) return 'bg-yellow-500';
    if (density < 85) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatZoneName = (name: string) => {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Group zones by type
  const zonesByType = layout.zones.reduce((acc, zone) => {
    if (!acc[zone.type]) acc[zone.type] = [];
    acc[zone.type].push(zone);
    return acc;
  }, {} as Record<string, VenueZone[]>);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs justify-center">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /><span>Low</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /><span>Medium</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500" /><span>High</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span>Critical</span></div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {layout.zones.slice(0, 20).map((zone) => {
          const data = crowdData.get(zone.id);
          const density = data?.density || 0;
          const isSelected = selectedZone === zone.id;
          const isCurrent = currentZone === zone.id;

          return (
            <button
              key={zone.id}
              onClick={() => onZoneSelect(isSelected ? null : zone.id)}
              onDoubleClick={() => onZoneNavigate(zone.id)}
              className={`relative p-3 rounded-lg transition-all border-2 ${getDensityColor(density)} ${
                isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
              } ${isCurrent ? 'border-white' : 'border-transparent'}`}
            >
              <div className="text-white text-center">
                <p className="text-xs font-medium truncate">{formatZoneName(zone.name)}</p>
                <p className="text-lg font-bold">{Math.round(density)}%</p>
                {data && (
                  <div className="flex items-center justify-center gap-1 text-[10px]">
                    {data.trend === 'increasing' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : data.trend === 'decreasing' ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                  </div>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-1 -right-1 text-[8px] px-1 py-0 bg-white text-primary">
                    You
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            {(() => {
              const zone = layout.zones.find(z => z.id === selectedZone);
              const data = crowdData.get(selectedZone);
              if (!zone) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{formatZoneName(zone.name)}</h4>
                    <Badge variant="outline">{zone.type}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Density</p>
                      <p className="font-medium">{Math.round(data?.density || 0)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">People</p>
                      <p className="font-medium">{data?.currentCount.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Trend</p>
                      <p className="font-medium capitalize">{data?.trend || 'stable'}</p>
                    </div>
                  </div>
                  {currentZone !== selectedZone && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onZoneNavigate(selectedZone);
                        onZoneSelect(null);
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate Here
                    </Button>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EventStadiumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [crowdState, setCrowdState] = useState<CrowdState | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [currentZone, setCurrentZone] = useState<string>('main-entrance');
  const [isRunning, setIsRunning] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Initialize
  useEffect(() => {
    const foundEvent = getEventById(id);
    if (foundEvent) {
      setEvent(foundEvent);
      setCrowdState(CrowdService.initialize(foundEvent.registeredCount));
    }
  }, [id]);

  // Simulation loop
  useEffect(() => {
    if (!crowdState || !isRunning) return;

    const interval = setInterval(() => {
      setCrowdState(prev => prev ? CrowdService.processStep(prev, prev.scenarioType) : prev);
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, crowdState === null]);

  const handleReset = useCallback(() => {
    if (event) {
      setCrowdState(CrowdService.initialize(event.registeredCount));
    }
  }, [event]);

  if (!event || !crowdState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Calibrating Venue AI...</p>
        </div>
      </div>
    );
  }

  const crowdData = crowdState.crowdData;
  const totalPeople = Array.from(crowdData.values()).reduce((sum, d) => sum + d.currentCount, 0);
  const avgDensity = crowdData.size > 0
    ? Array.from(crowdData.values()).reduce((sum, d) => sum + d.density, 0) / crowdData.size
    : 0;

  // Sport-specific colors
  const sportColors: Record<string, { primary: string; secondary: string; bg: string }> = {
    football: { primary: '#22c55e', secondary: '#16a34a', bg: 'from-green-900 to-green-950' },
    basketball: { primary: '#f97316', secondary: '#ea580c', bg: 'from-orange-900 to-orange-950' },
    cricket: { primary: '#3b82f6', secondary: '#2563eb', bg: 'from-blue-900 to-blue-950' },
    tennis: { primary: '#eab308', secondary: '#ca8a04', bg: 'from-yellow-900 to-yellow-950' },
    concert: { primary: '#a855f7', secondary: '#9333ea', bg: 'from-purple-900 to-purple-950' },
    other: { primary: '#6b7280', secondary: '#4b5563', bg: 'from-gray-900 to-gray-950' },
  };

  const colors = sportColors[event.sport] || sportColors.other;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colors.bg}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/events/${id}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Back to Event</span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge 
              className="text-white"
              style={{ backgroundColor: event.status === 'live' ? '#ef4444' : colors.primary }}
            >
              {event.status === 'live' ? 'LIVE' : 'SIMULATION'}
            </Badge>
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-sm truncate max-w-[200px]">{event.name}</p>
              <p className="text-white/60 text-xs">{event.venue}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary + '30' }}>
                  <Users className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Total Attendance</p>
                  <p className="text-white font-bold text-lg">{totalPeople.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Avg Density</p>
                  <p className="text-white font-bold text-lg">{Math.round(avgDensity)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Safety Status</p>
                  <p className="text-white font-bold text-lg">Normal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Your Location</p>
                  <p className="text-white font-bold text-sm truncate">{currentZone.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simulation Controls */}
        <Card className="bg-white/10 border-white/20 mb-6">
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRunning(!isRunning)}
                  className="text-white hover:bg-white/20"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <span className="text-white/60 text-sm ml-2">
                  {isRunning ? 'Simulation Running' : 'Paused'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm mr-2">Scenario:</span>
                {['entry_rush', 'normal', 'halftime', 'exit_surge'].map((scenario) => (
                  <Button
                    key={scenario}
                    variant="ghost"
                    size="sm"
                    onClick={() => crowdState && setCrowdState({ ...crowdState, scenarioType: scenario })}
                    className={`text-xs ${crowdState?.scenarioType === scenario ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
                  >
                    {scenario.replace('_', ' ').charAt(0).toUpperCase() + scenario.replace('_', ' ').slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Heatmap/3D View */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: colors.primary }} />
                    Live Crowd {viewMode === '3d' ? '3D View' : 'Heatmap'}
                  </CardTitle>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-black/30 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('2d')}
                        className={`h-7 px-3 text-xs ${viewMode === '2d' ? 'bg-white text-black hover:bg-white' : 'text-white/70 hover:bg-white/20'}`}
                      >
                        <Layers className="w-3 h-3 mr-1" />
                        2D
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('3d')}
                        className={`h-7 px-3 text-xs ${viewMode === '3d' ? 'bg-white text-black hover:bg-white' : 'text-white/70 hover:bg-white/20'}`}
                      >
                        <Box className="w-3 h-3 mr-1" />
                        3D
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === '2d' ? (
                  <StadiumHeatmap
                    layout={DEFAULT_VENUE}
                    crowdData={crowdData}
                    selectedZone={selectedZone}
                    currentZone={currentZone}
                    onZoneSelect={setSelectedZone}
                    onZoneNavigate={setCurrentZone}
                  />
                ) : (
                  <Stadium3D
                    zones={DEFAULT_VENUE.zones}
                    crowdData={crowdData}
                    currentZone={currentZone}
                    selectedZone={selectedZone}
                    onZoneSelect={setSelectedZone}
                    onZoneNavigate={setCurrentZone}
                    stadiumName={event.venue}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Recommendation */}
            {recommendation && (
              <Card className="bg-white/10 border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" style={{ color: colors.primary }} />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge className="text-white" style={{ backgroundColor: colors.primary }}>
                      {recommendation.type.toUpperCase()}
                    </Badge>
                    <p className="text-white/90 text-sm">{recommendation.description}</p>
                    <div className="flex items-center justify-between text-xs mt-3">
                      <span className="text-white/50">Confidence</span>
                      <span className="text-white font-medium">{recommendation.confidence}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tabs */}
            <Tabs defaultValue="facilities" className="w-full">
              <TabsList className="w-full bg-white/10">
                <TabsTrigger value="facilities" className="flex-1 text-white data-[state=active]:bg-white/20">Facilities</TabsTrigger>
                <TabsTrigger value="alerts" className="flex-1 text-white data-[state=active]:bg-white/20">Alerts</TabsTrigger>
                <TabsTrigger value="info" className="flex-1 text-white data-[state=active]:bg-white/20">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="facilities" className="mt-3">
                <div className="space-y-2">
                  {[
                    { icon: Utensils, name: 'Food Court A', wait: '3 min', density: 45 },
                    { icon: Coffee, name: 'Refreshments', wait: '1 min', density: 25 },
                    { icon: ShoppingBag, name: 'Merch Store', wait: '5 min', density: 60 },
                  ].map((facility, i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                      <CardContent className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                            <facility.icon className="w-4 h-4 text-white/70" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{facility.name}</p>
                            <p className="text-white/50 text-xs">Wait: {facility.wait}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              facility.density < 40 ? 'border-green-500 text-green-400' :
                              facility.density < 60 ? 'border-yellow-500 text-yellow-400' :
                              'border-red-500 text-red-400'
                            }`}
                          >
                            {facility.density}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="mt-3">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3 text-white/70">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="text-sm">No active alerts. Enjoy the event!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="mt-3">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-white/50" />
                      <div>
                        <p className="text-white text-sm font-medium">{event.name}</p>
                        <p className="text-white/50 text-xs">{formatEventDate(event.date)} at {formatEventTime(event.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-white/50" />
                      <p className="text-white/70 text-sm">{event.venue}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-white/50" />
                      <p className="text-white/70 text-sm">{event.registeredCount.toLocaleString()} attendees</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* AI Assistant */}
            <AIAssistant
              currentZone={currentZone}
              crowdDensity={crowdData.get(currentZone)?.density || 50}
              onNavigate={(zone) => setCurrentZone(zone)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
