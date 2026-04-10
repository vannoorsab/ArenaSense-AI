'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  MapPin,
  Users,
  Navigation,
  Utensils,
  AlertTriangle,
  Info,
  Play,
  Pause,
  RotateCcw,
  Mic,
  Volume2,
  ChevronRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Coffee,
  ShoppingBag,
  Toilet,
  Megaphone,
} from 'lucide-react';
import { getCSKMatchById, formatMatchTime, type CSKMatch } from '@/lib/csk-matches';
import { getStadiumById, getPhaseMultiplier, type IPLStadium, type MatchPhase } from '@/lib/ipl-stadiums';
import { CrowdSimulator, type SimulationState } from '@/lib/crowd-simulator';
import type { CrowdData } from '@/lib/types';
import { AIDecisionEngine, type AIRecommendation } from '@/lib/ai-engine';
import { VenueZone, User } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Box, Layers, MessageCircle } from 'lucide-react';
import AIAssistant from '@/components/ai-assistant';

// Dynamic import for 3D component to avoid SSR issues
const Stadium3D = dynamic(() => import('@/components/stadium-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] md:h-[600px] bg-[#001020] rounded-xl flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#FDB913] border-t-transparent rounded-full" />
    </div>
  ),
});

const phaseDescriptions: Record<MatchPhase, { label: string; color: string; description: string }> = {
  'pre-match': { label: 'Pre-Match', color: 'bg-blue-500', description: 'Gates open, fans entering' },
  'live': { label: 'Live Match', color: 'bg-green-500', description: 'Match in progress' },
  'innings-break': { label: 'Innings Break', color: 'bg-yellow-500', description: '20-min break' },
  'post-match': { label: 'Post-Match', color: 'bg-orange-500', description: 'Fans exiting' },
};

export default function CSKStadiumExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<CSKMatch | null>(null);
  const [stadium, setStadium] = useState<IPLStadium | null>(null);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [crowdData, setCrowdData] = useState<Map<string, CrowdData>>(new Map());
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<MatchPhase>('pre-match');
  const [isRunning, setIsRunning] = useState(true);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [currentZone, setCurrentZone] = useState<string>('north-concourse');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Initialize
  useEffect(() => {
    const matchData = getCSKMatchById(id);
    if (matchData) {
      setMatch(matchData);
      setCurrentPhase(matchData.phase);
      const stadiumData = getStadiumById(matchData.stadiumId);
      if (stadiumData) {
        setStadium(stadiumData);
        // Use static method to initialize simulation
        const initialState = CrowdSimulator.initializeSimulation(matchData.registeredCount || 45000);
        // Set scenario based on match phase
        const scenarioMap: Record<MatchPhase, 'normal' | 'entry_rush' | 'halftime' | 'exit_surge'> = {
          'pre-match': 'entry_rush',
          'live': 'normal',
          'innings-break': 'halftime',
          'post-match': 'exit_surge',
        };
        initialState.scenarioType = scenarioMap[matchData.phase];
        setSimState(initialState);
        setCrowdData(initialState.crowdData);
      }
    }
  }, [id]);

  // Simulation loop
  useEffect(() => {
    if (!simState || !isRunning) return;

    const interval = setInterval(() => {
      // Use static step method to advance simulation
      const newState = CrowdSimulator.step(simState, simState.scenarioType);
      setSimState(newState);
      setCrowdData(new Map(newState.crowdData));
    }, 1000);

    return () => clearInterval(interval);
  }, [simState, isRunning]);

  // Update recommendations
  useEffect(() => {
    if (!stadium || crowdData.size === 0) return;

    // Create a mock user for the AI engine
    const mockUser: User = {
      id: 'csk-attendee',
      name: 'Attendee',
      currentZone,
      ticket: { section: currentZone, seat: 'A1', gate: 'Gate A' },
      preferences: {
        avoidCrowds: true,
        preferQuickestRoute: true,
        accessibility: false,
        notifications: true,
      },
    };

    // Use static method from AIDecisionEngine
    const rec = AIDecisionEngine.generateRecommendation(
      mockUser,
      crowdData,
      [], // predictions
      [], // queues
      []  // alerts
    );
    setRecommendation(rec);
  }, [currentZone, crowdData, stadium]);

  const handlePhaseChange = useCallback((phase: MatchPhase) => {
    setCurrentPhase(phase);
    if (simState) {
      const scenarioMap: Record<MatchPhase, 'normal' | 'entry_rush' | 'halftime' | 'exit_surge'> = {
        'pre-match': 'entry_rush',
        'live': 'normal',
        'innings-break': 'halftime',
        'post-match': 'exit_surge',
      };
      setSimState({ ...simState, scenarioType: scenarioMap[phase] });
    }
  }, [simState]);

  const handleReset = useCallback(() => {
    if (stadium && match) {
      const initialState = CrowdSimulator.initializeSimulation(match.registeredCount || 45000);
      initialState.scenarioType = 'entry_rush';
      setSimState(initialState);
      setCrowdData(initialState.crowdData);
      setCurrentPhase('pre-match');
    }
  }, [stadium, match]);

  if (!match || !stadium) {
    return (
      <div className="min-h-screen bg-[#003B7B] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FDB913] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003B7B]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-[#002855]/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/csk/${id}`} className="flex items-center gap-2 text-white hover:text-[#FDB913] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Back to Match</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Badge className={`${phaseDescriptions[currentPhase].color} text-white`}>
              {phaseDescriptions[currentPhase].label}
            </Badge>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-[#FDB913] flex items-center justify-center">
                <span className="text-[#003B7B] font-black text-[10px]">CSK</span>
              </div>
              <span className="text-white/60 font-bold">vs</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: match.opponentColor }}>
                <span className="text-white font-black text-[10px]">{match.opponentShort}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRunning(!isRunning)}
              className="text-white hover:bg-white/10"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stadium Info Banner */}
      <div className="border-b border-yellow-500/20 bg-[#002855]/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#FDB913]" />
              <div>
                <p className="font-semibold text-white text-sm">{stadium.name}</p>
                <p className="text-xs text-blue-300">{stadium.city} • Capacity: {stadium.capacity.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['pre-match', 'live', 'innings-break', 'post-match'] as MatchPhase[]).map((phase) => (
                <Button
                  key={phase}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePhaseChange(phase)}
                  className={`text-xs ${currentPhase === phase ? 'bg-[#FDB913] text-[#003B7B]' : 'text-white hover:bg-white/10'}`}
                >
                  {phaseDescriptions[phase].label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Heatmap / 3D View */}
          <div className="lg:col-span-2">
            <Card className="bg-[#002855] border-yellow-500/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#FDB913]" />
                    Live Crowd {viewMode === '3d' ? '3D View' : 'Heatmap'}
                  </CardTitle>
                  
                  {/* View Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-[#001F3F] rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('2d')}
                        className={`h-7 px-3 text-xs ${viewMode === '2d' ? 'bg-[#FDB913] text-[#003B7B] hover:bg-[#FDB913]' : 'text-blue-300 hover:bg-blue-900/50'}`}
                      >
                        <Layers className="w-3 h-3 mr-1" />
                        2D
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('3d')}
                        className={`h-7 px-3 text-xs ${viewMode === '3d' ? 'bg-[#FDB913] text-[#003B7B] hover:bg-[#FDB913]' : 'text-blue-300 hover:bg-blue-900/50'}`}
                      >
                        <Box className="w-3 h-3 mr-1" />
                        3D
                      </Button>
                    </div>
                    
                    {viewMode === '2d' && (
                      <div className="hidden sm:flex items-center gap-3 text-xs ml-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-green-500" />
                          <span className="text-green-300">Low</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-yellow-500" />
                          <span className="text-yellow-300">Medium</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-red-500" />
                          <span className="text-red-300">High</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === '2d' ? (
                  <StadiumHeatmap
                    layout={stadium.layout}
                    crowdData={crowdData}
                    selectedZone={selectedZone}
                    currentZone={currentZone}
                    onZoneSelect={setSelectedZone}
                    onZoneNavigate={setCurrentZone}
                  />
                ) : (
                  <Stadium3D
                    zones={stadium.layout.zones}
                    crowdData={crowdData}
                    currentZone={currentZone}
                    selectedZone={selectedZone}
                    onZoneSelect={setSelectedZone}
                    onZoneNavigate={setCurrentZone}
                    stadiumName={stadium.name}
                  />
                )}
              </CardContent>
            </Card>

            {/* Selected Zone Info (only shown in 2D mode) */}
            {viewMode === '2d' && selectedZone && (
              <Card className="mt-4 bg-[#002855] border-yellow-500/20">
                <CardContent className="pt-6">
                  <ZoneDetails
                    zone={stadium.layout.zones.find(z => z.id === selectedZone)!}
                    crowdData={crowdData.get(selectedZone)}
                    onNavigate={() => {
                      setCurrentZone(selectedZone);
                      setSelectedZone(null);
                    }}
                    isCurrentZone={currentZone === selectedZone}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Current Location */}
            <Card className="bg-[#002855] border-yellow-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDB913] flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-[#003B7B]" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-400">Your Location</p>
                    <p className="font-semibold text-white">
                      {stadium.layout.zones.find(z => z.id === currentZone)?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                {crowdData.get(currentZone) && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-200">{crowdData.get(currentZone)!.currentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {crowdData.get(currentZone)!.trend === 'increasing' ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : crowdData.get(currentZone)!.trend === 'decreasing' ? (
                        <TrendingDown className="w-4 h-4 text-green-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-blue-200 capitalize">{crowdData.get(currentZone)!.trend}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            {recommendation && (
              <Card className="bg-gradient-to-br from-[#FDB913]/20 to-[#FDB913]/5 border-[#FDB913]/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#FDB913] text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm font-medium mb-2">{recommendation.primaryAction}</p>
                  <p className="text-blue-200 text-xs mb-3">{recommendation.reasoning}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] border-[#FDB913]/50 text-[#FDB913]">
                      {recommendation.confidence}% confidence
                    </Badge>
                    {recommendation.suggestedZone && (
                      <Button
                        size="sm"
                        onClick={() => setCurrentZone(recommendation.suggestedZone!)}
                        className="bg-[#FDB913] text-[#003B7B] hover:bg-yellow-400 h-7 text-xs"
                      >
                        Go There
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="facilities" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#002855]">
                <TabsTrigger value="facilities" className="text-xs data-[state=active]:bg-[#FDB913] data-[state=active]:text-[#003B7B]">
                  Facilities
                </TabsTrigger>
                <TabsTrigger value="alerts" className="text-xs data-[state=active]:bg-[#FDB913] data-[state=active]:text-[#003B7B]">
                  Alerts
                </TabsTrigger>
                <TabsTrigger value="info" className="text-xs data-[state=active]:bg-[#FDB913] data-[state=active]:text-[#003B7B]">
                  Info
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="facilities" className="mt-4">
                <Card className="bg-[#002855] border-yellow-500/20">
                  <CardContent className="pt-4 space-y-3">
                    <FacilityButton icon={Coffee} label="Food & Drinks" zone="north-concourse" onClick={setCurrentZone} />
                    <FacilityButton icon={Toilet} label="Restrooms" zone="west-concourse" onClick={setCurrentZone} />
                    <FacilityButton icon={ShoppingBag} label="Merchandise" zone="east-concourse" onClick={setCurrentZone} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="mt-4">
                <Card className="bg-[#002855] border-yellow-500/20">
                  <CardContent className="pt-4 space-y-3">
                    <AlertItem
                      severity="medium"
                      message={`${phaseDescriptions[currentPhase].description} - ${currentPhase === 'post-match' ? 'Use south exits for fastest departure' : 'Follow staff directions'}`}
                    />
                    {currentPhase === 'innings-break' && (
                      <AlertItem
                        severity="high"
                        message="High crowd expected at food courts. Consider visiting restrooms first."
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="mt-4">
                <Card className="bg-[#002855] border-yellow-500/20">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-[#FDB913]" />
                      <span className="text-blue-200">Match Time: {formatMatchTime(match.time)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-[#FDB913]" />
                      <span className="text-blue-200">{stadium.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-[#FDB913]" />
                      <span className="text-blue-200">Expected: {match.registeredCount.toLocaleString()}</span>
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

// Stadium Heatmap Component
function StadiumHeatmap({
  layout,
  crowdData,
  selectedZone,
  currentZone,
  onZoneSelect,
  onZoneNavigate,
}: {
  layout: IPLStadium['layout'];
  crowdData: Map<string, CrowdData>;
  selectedZone: string | null;
  currentZone: string;
  onZoneSelect: (zone: string | null) => void;
  onZoneNavigate: (zone: string) => void;
}) {
  const getDensityColor = (density: number): string => {
    if (density < 30) return 'rgba(34, 197, 94, 0.7)'; // green
    if (density < 50) return 'rgba(234, 179, 8, 0.7)'; // yellow
    if (density < 70) return 'rgba(249, 115, 22, 0.7)'; // orange
    return 'rgba(239, 68, 68, 0.8)'; // red
  };

  return (
    <div className="relative w-full aspect-square bg-[#001F3F] rounded-lg overflow-hidden">
      {/* Cricket pitch in center */}
      <div className="absolute inset-[35%] bg-green-700/30 rounded-full border-2 border-green-500/30" />
      <div className="absolute inset-[42%] bg-green-600/20 rounded-lg" />

      {/* Zones */}
      {layout.zones.map((zone) => {
        const data = crowdData.get(zone.id);
        const density = data?.density || 0;
        const isSelected = selectedZone === zone.id;
        const isCurrent = currentZone === zone.id;

        return (
          <button
            key={zone.id}
            onClick={() => onZoneSelect(isSelected ? null : zone.id)}
            onDoubleClick={() => onZoneNavigate(zone.id)}
            className={`absolute transition-all duration-300 rounded-md flex items-center justify-center ${
              isSelected ? 'ring-2 ring-white z-10' : ''
            } ${isCurrent ? 'ring-2 ring-[#FDB913] z-20' : ''}`}
            style={{
              left: `${zone.x1}%`,
              top: `${zone.y1}%`,
              width: `${zone.x2 - zone.x1}%`,
              height: `${zone.y2 - zone.y1}%`,
              backgroundColor: getDensityColor(density),
            }}
            title={`${zone.name}: ${Math.round(density)}% density`}
          >
            <div className="text-center p-1">
              <p className="text-[8px] sm:text-[10px] font-bold text-white drop-shadow-lg truncate max-w-full">
                {zone.name.replace(' Stand', '').replace(' Concourse', '').replace(' Pavilion', '')}
              </p>
              <p className="text-[8px] sm:text-[10px] font-bold text-white drop-shadow-lg">
                {Math.round(density)}%
              </p>
            </div>
            {isCurrent && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FDB913] rounded-full flex items-center justify-center">
                <Navigation className="w-2.5 h-2.5 text-[#003B7B]" />
              </div>
            )}
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 text-[10px] text-white/70">
        Tap to select • Double-tap to navigate
      </div>
    </div>
  );
}

// Zone Details Component
function ZoneDetails({
  zone,
  crowdData,
  onNavigate,
  isCurrentZone,
}: {
  zone: VenueZone;
  crowdData?: CrowdData;
  onNavigate: () => void;
  isCurrentZone: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-white">{zone.name}</h3>
        <div className="flex items-center gap-4 mt-1 text-sm text-blue-300">
          <span>Capacity: {zone.capacity.toLocaleString()}</span>
          {crowdData && (
            <>
              <span>Current: {crowdData.currentOccupancy.toLocaleString()}</span>
              <span className={`flex items-center gap-1 ${
                crowdData.density > 70 ? 'text-red-400' : crowdData.density > 50 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {Math.round(crowdData.density)}% full
              </span>
            </>
          )}
        </div>
      </div>
      {!isCurrentZone && (
        <Button onClick={onNavigate} className="bg-[#FDB913] text-[#003B7B] hover:bg-yellow-400">
          <Navigation className="w-4 h-4 mr-2" />
          Navigate Here
        </Button>
      )}
    </div>
  );
}

// Facility Button Component
function FacilityButton({
  icon: Icon,
  label,
  zone,
  onClick,
}: {
  icon: typeof Coffee;
  label: string;
  zone: string;
  onClick: (zone: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(zone)}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#003B7B]/50 hover:bg-[#003B7B] transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-[#FDB913]/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#FDB913]" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-white text-sm">{label}</p>
        <p className="text-xs text-blue-400">Tap to navigate</p>
      </div>
      <ChevronRight className="w-4 h-4 text-blue-400" />
    </button>
  );
}

// Alert Item Component
function AlertItem({ severity, message }: { severity: 'low' | 'medium' | 'high'; message: string }) {
  const colors = {
    low: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    high: 'border-red-500/30 bg-red-500/10 text-red-300',
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colors[severity]}`}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-xs">{message}</p>
    </div>
  );
}
