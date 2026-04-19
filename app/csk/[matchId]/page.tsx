'use client';
/**
 * /csk/[matchId]/page.tsx
 * Dynamic per-match stadium experience page.
 * Loads stadium layout, live crowd data, gate status, AI insights.
 * No login required — direct access.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Activity, MapPin, Users, Shield, Brain, DoorOpen,
  ArrowLeft, Zap, Eye, Layers, RefreshCw, Trophy,
  AlertTriangle, Clock, Radio,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveAlertBanner from '@/components/live-alert-banner';
import AccessibilityToolbar from '@/components/accessibility-toolbar';
import GateStatusBoard from '@/components/gate-status-board';
import CrowdPredictionCard from '@/components/crowd-prediction-card';
import { getCSKMatchById, formatMatchDate, formatMatchTime } from '@/lib/data/csk-matches';
import { getMatchStadiumStatus, type StadiumStatus } from '@/lib/services/stadium-service';
import { runAIAnalysis, getAISummary, type AIServiceResult } from '@/lib/services/ai-service';

// ─── Status helpers ────────────────────────────────────────────────────────────

const DENSITY_COLORS: Record<string, string> = {
  low: 'bg-green-500/80',
  medium: 'bg-yellow-500/80',
  high: 'bg-orange-500/80',
  critical: 'bg-red-500/90',
};

const DENSITY_BADGE: Record<string, string> = {
  low: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MatchStadiumPage() {
  const params = useParams();
  const matchId = params?.matchId as string;

  const match = getCSKMatchById(matchId);
  if (!match) notFound();

  const [stadiumStatus, setStadiumStatus] = useState<StadiumStatus | null>(null);
  const [aiResult, setAiResult] = useState<AIServiceResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [scenario, setScenario] = useState<'normal' | 'high' | 'peak' | 'emergency'>('normal');
  const [refreshTick, setRefreshTick] = useState(0);

  // Load stadium status
  const loadStadiumData = useCallback(() => {
    const status = getMatchStadiumStatus(matchId, scenario);
    setStadiumStatus(status);
  }, [matchId, scenario]);

  // Load AI analysis
  const loadAI = useCallback(async () => {
    setAiLoading(true);
    try {
      const result = await runAIAnalysis(matchId, scenario);
      setAiResult(result);
    } finally {
      setAiLoading(false);
    }
  }, [matchId, scenario]);

  useEffect(() => {
    loadStadiumData();
    loadAI();
  }, [loadStadiumData, loadAI, refreshTick]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => setRefreshTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!match) return null;

  const isLive = match.status === 'live';
  const totalPct = stadiumStatus ? Math.round((stadiumStatus.totalAttendees / stadiumStatus.totalCapacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Live Alert Banner */}
      <LiveAlertBanner />

      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b bg-[#002855]/95 backdrop-blur-md"
        role="banner"
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/csk"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
              aria-label="Back to all CSK matches"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div className="w-7 h-7 rounded-full bg-[#FDB913] flex items-center justify-center" aria-hidden="true">
              <span className="text-[#003B7B] font-black text-[10px]">CSK</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">{match.name}</p>
              <p className="text-yellow-400/80 text-[10px] mt-0.5">{match.venue}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLive && (
              <Badge className="bg-red-500 text-white border-0 gap-1 animate-pulse" aria-label="Match is live">
                <Radio className="w-3 h-3" aria-hidden="true" />
                LIVE
              </Badge>
            )}
            {/* Scenario selector */}
            <select
              value={scenario}
              onChange={e => setScenario(e.target.value as typeof scenario)}
              className="text-xs bg-white/10 text-white border border-white/20 rounded px-2 py-1"
              aria-label="Select crowd scenario"
            >
              <option value="normal">Normal</option>
              <option value="high">High Crowd</option>
              <option value="peak">Peak</option>
              <option value="emergency">Emergency</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => setRefreshTick(t => t + 1)}
              aria-label="Refresh stadium data"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-6 space-y-6">
        {/* Match Info Bar */}
        <section
          className="rounded-xl bg-gradient-to-r from-[#003B7B] to-[#002855] p-4 border border-yellow-500/20"
          aria-label="Match information"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Teams */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FDB913] flex items-center justify-center shadow-lg">
                <span className="text-[#003B7B] font-black text-xs">CSK</span>
              </div>
              <span className="text-white font-bold text-lg">vs</span>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: match.opponentColor }}
              >
                <span className="text-white font-black text-xs">{match.opponentShort}</span>
              </div>
              <div>
                <p className="text-white font-bold">{match.opponent}</p>
                <p className="text-yellow-400/70 text-xs">{match.isHome ? '🏠 Home Match' : '✈️ Away Match'}</p>
              </div>
            </div>

            {/* Date/Time/Venue */}
            <div className="flex items-center gap-4 text-sm text-blue-200">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-yellow-500" aria-hidden="true" />
                <span>{formatMatchDate(match.date)} · {formatMatchTime(match.time)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-yellow-500" aria-hidden="true" />
                <span>{match.venue}</span>
              </div>
            </div>

            {/* Overall crowd */}
            {stadiumStatus && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                <div>
                  <p className="text-white font-bold text-sm">{stadiumStatus.totalAttendees.toLocaleString('en-IN')}</p>
                  <p className="text-blue-300 text-[10px]">{totalPct}% capacity</p>
                </div>
                <Badge className={`text-[10px] ${DENSITY_BADGE[stadiumStatus.overallDensity.level] ?? ''}`}>
                  {stadiumStatus.overallDensity.level.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </section>

        {/* AI Summary Bar */}
        {aiResult && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm"
            role="status"
            aria-live="polite"
            aria-label="AI analysis summary"
          >
            <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-purple-300 font-medium">{getAISummary(aiResult)}</span>
            {aiLoading && (
              <span className="ml-auto text-[10px] text-purple-400/60 flex items-center gap-1" aria-live="polite">
                <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />
                Analyzing...
              </span>
            )}
          </div>
        )}

        {/* Stats Row */}
        {stadiumStatus && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="region" aria-label="Stadium statistics">
            {[
              { label: 'Total Capacity', value: stadiumStatus.totalCapacity.toLocaleString('en-IN'), icon: Users, color: 'text-blue-500' },
              { label: 'Attendance', value: stadiumStatus.totalAttendees.toLocaleString('en-IN'), icon: Activity, color: 'text-green-500' },
              { label: 'Open Gates', value: stadiumStatus.gateStatuses.filter((g: any) => g.status !== 'closed').length.toString(), icon: DoorOpen, color: 'text-yellow-500' },
              { label: 'Best Entry', value: stadiumStatus.recommendedGate ?? 'Any Gate', icon: Trophy, color: 'text-purple-500' },
            ].map(stat => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-4 pb-3">
                  <stat.icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} aria-hidden="true" />
                  <p className="text-lg font-bold leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4" role="tablist" aria-label="Stadium view tabs">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="gates" className="gap-1.5 text-xs">
              <DoorOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Gates
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5 text-xs">
              <Brain className="w-3.5 h-3.5" aria-hidden="true" />
              AI Intel
            </TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Sections grid */}
              {stadiumStatus && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                      Stadium Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2" role="list" aria-label="Stadium sections">
                      {stadiumStatus.sections.map(section => (
                        <div
                          key={section.id}
                          role="listitem"
                          aria-label={`${section.name}: ${section.density.level} density, ${section.density.percentage}% full`}
                          className={`rounded-lg p-3 border transition-all
                            ${DENSITY_BADGE[section.density.level] ?? 'border-border'}`}
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <p className="font-medium text-xs leading-tight">{section.name}</p>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${DENSITY_COLORS[section.density.level] ?? 'bg-muted'}`} aria-hidden="true" />
                          </div>
                          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mb-1">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${DENSITY_COLORS[section.density.level]}`}
                              style={{ width: `${section.density.percentage}%` }}
                              role="progressbar"
                              aria-valuenow={section.density.percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] opacity-70">{section.currentCount.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-bold">{section.density.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Predictions */}
              {stadiumStatus && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" aria-hidden="true" />
                    AI Crowd Predictions
                  </p>
                  {stadiumStatus.sections.slice(0, 4).map(section => (
                    <CrowdPredictionCard
                      key={section.id}
                      sectionName={section.name}
                      currentCount={section.currentCount}
                      capacity={section.capacity}
                      matchPhase={match.phase as 'pre-match' | 'live' | 'post-match'}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Gates Tab ── */}
          <TabsContent value="gates" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                  Entry Gates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GateStatusBoard scenario={scenario} gateType="entry" refreshMs={5000} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  Exit Gates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GateStatusBoard scenario={scenario} gateType="exit" refreshMs={5000} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Heatmap Tab ── */}
          <TabsContent value="heatmap">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-500" aria-hidden="true" />
                    Live Crowd Heatmap
                  </CardTitle>
                  <div className="flex gap-1" role="group" aria-label="Heatmap view mode">
                    {(['2d', '3d'] as const).map(mode => (
                      <Button
                        key={mode}
                        variant={viewMode === mode ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-3 text-[11px]"
                        onClick={() => setViewMode(mode)}
                        aria-pressed={viewMode === mode}
                        aria-label={`Switch to ${mode.toUpperCase()} view`}
                      >
                        {mode.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="relative rounded-lg overflow-hidden bg-[#001428] aspect-video"
                  role="img"
                  aria-label={`${viewMode === '3d' ? '3D' : '2D'} stadium crowd heatmap for ${match.venue}`}
                >
                  {/* 2D Heatmap visualization */}
                  {viewMode === '2d' && stadiumStatus && (
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      {/* Cricket oval field */}
                      <div className="flex-1 relative flex items-center justify-center">
                        {/* Oval boundary */}
                        <div className="w-3/4 h-3/4 rounded-[50%] border-2 border-green-600/40 relative flex items-center justify-center">
                          {/* Inner 22 yards */}
                          <div className="absolute w-[15%] h-[45%] bg-yellow-900/30 rounded border border-yellow-700/30" aria-label="Cricket pitch" />
                          
                          {/* Section heat overlays at each stand position */}
                          {stadiumStatus.sections.map((section, i) => {
                            const positions: Record<string, { top?: string; left?: string; right?: string; bottom?: string }> = {
                              north:    { top: '-6%', left: '38%' },
                              south:    { bottom: '-6%', left: '38%' },
                              east:     { top: '38%', right: '-4%' },
                              west:     { top: '38%', left: '-4%' },
                              vip:      { top: '10%', left: '10%' },
                              pavilion: { top: '10%', right: '10%' },
                            };
                            const pos = positions[section.position] ?? { top: `${i * 15}%`, left: '5%' };
                            const alpha = 0.3 + section.density.capacityUsed * 0.6;
                            const color = section.density.level === 'critical' ? `rgba(239,68,68,${alpha})`
                              : section.density.level === 'high' ? `rgba(249,115,22,${alpha})`
                              : section.density.level === 'medium' ? `rgba(234,179,8,${alpha})`
                              : `rgba(34,197,94,${alpha})`;
                            return (
                              <div
                                key={section.id}
                                className="absolute rounded flex flex-col items-center justify-center px-2 py-1 transition-all duration-1000"
                                style={{ ...pos, backgroundColor: color, minWidth: '60px' }}
                                role="text"
                                aria-label={`${section.name}: ${section.density.percentage}% full`}
                              >
                                <p className="text-white text-[9px] font-bold leading-none text-center">{section.name}</p>
                                <p className="text-white/90 text-[9px] mt-0.5">{section.density.percentage}%</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Density Legend */}
                      <div className="flex justify-center gap-3 mt-2" role="legend" aria-label="Heatmap density legend">
                        {[
                          ['low', 'bg-green-500', 'Low'],
                          ['medium', 'bg-yellow-500', 'Medium'],
                          ['high', 'bg-orange-500', 'High'],
                          ['critical', 'bg-red-500', 'Critical'],
                        ].map(([key, cls, label]) => (
                          <div key={key} className="flex items-center gap-1 text-[9px] text-white/70">
                            <div className={`w-2.5 h-2.5 rounded ${cls}`} aria-hidden="true" />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3D placeholder — links to stadium-3d component */}
                  {viewMode === '3d' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="text-center">
                        <Layers className="w-12 h-12 text-blue-400/60 mx-auto mb-3" aria-hidden="true" />
                        <p className="text-white/60 text-sm font-medium">3D Stadium View</p>
                        <p className="text-white/30 text-xs mt-1">Powered by Three.js — Interactive 3D visualization</p>
                      </div>
                      <Link href="/stadium-live">
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                          <Zap className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                          Open Full 3D View
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── AI Intelligence Tab ── */}
          <TabsContent value="ai" className="space-y-4">
            {aiLoading && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-purple-500/20 bg-purple-500/10" aria-live="polite">
                <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-purple-300">Cloud Vision AI analyzing...</p>
                  <p className="text-xs text-purple-400/60">Processing crowd imagery with GCP Vision API</p>
                </div>
              </div>
            )}

            {aiResult && (
              <>
                {/* Insights */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-500" aria-hidden="true" />
                      AI Insights ({aiResult.insights.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {aiResult.insights.map(insight => (
                      <div
                        key={insight.id}
                        role="alert"
                        aria-live="polite"
                        className={`flex gap-3 p-3 rounded-lg border text-sm
                          ${insight.severity === 'danger' ? 'border-red-500/30 bg-red-500/10' :
                            insight.severity === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10' :
                            'border-blue-500/30 bg-blue-500/10'}`}
                      >
                        <AlertTriangle
                          className={`w-4 h-4 flex-shrink-0 mt-0.5
                            ${insight.severity === 'danger' ? 'text-red-500' :
                              insight.severity === 'warning' ? 'text-yellow-500' :
                              'text-blue-500'}`}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-semibold text-xs leading-none mb-1">{insight.title}</p>
                          <p className="text-xs text-muted-foreground">{insight.description}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            Confidence: {Math.round(insight.confidence * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Vision Analysis */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-500" aria-hidden="true" />
                      Cloud Vision AI — Zone Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mb-3 bg-muted/50 rounded px-2 py-1.5 font-mono">
                      Model: cloud-vision-v1/crowd-detection-v3 · Region: asia-south1
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {aiResult.visionAnalysis.slice(0, 6).map(zone => (
                        <div
                          key={zone.zone}
                          className={`rounded-lg border p-2.5 text-xs
                            ${zone.anomalyDetected ? 'border-red-500/40 bg-red-500/10' : 'border-border bg-muted/30'}`}
                          role="region"
                          aria-label={`${zone.zone}: density ${zone.densityEstimate.toFixed(1)} persons per sqm`}
                        >
                          <p className="font-semibold leading-tight mb-1.5 text-[11px]">{zone.zone}</p>
                          <div className="space-y-0.5 text-muted-foreground">
                            <p>Density: <strong className="text-foreground">{zone.densityEstimate.toFixed(1)} /m²</strong></p>
                            <p>Count: <strong className="text-foreground">{zone.crowdCount}</strong></p>
                            <p>Confidence: <strong>{Math.round(zone.confidence * 100)}%</strong></p>
                            <p>Latency: {zone.processingMs}ms</p>
                          </div>
                          {zone.anomalyDetected && (
                            <p className="mt-1.5 text-red-500 text-[10px] font-semibold" role="alert">⚠ Anomaly detected</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />
    </div>
  );
}
