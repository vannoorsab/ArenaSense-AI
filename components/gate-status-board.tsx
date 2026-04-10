'use client';
/**
 * gate-status-board.tsx
 * Real-time gate status grid with AI-driven routing suggestions.
 * Accessible: ARIA live region updates, keyboard navigation, color + icon indicators.
 */

import { useState, useEffect } from 'react';
import { DoorOpen, DoorClosed, ArrowRight, Clock, Star, AlertTriangle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GateManager, type GateData } from '@/lib/gate-manager';
import { calculateEstimatedWaitTime, generateRouteRecommendation, type GateOption } from '@/lib/utils/route-optimizer';

// ─── Props ────────────────────────────────────────────────────────────────────

interface GateStatusBoardProps {
  scenario?: 'normal' | 'high' | 'peak' | 'emergency';
  /** Show only entry gates, only exit, or both */
  gateType?: 'entry' | 'exit' | 'all';
  /** Update interval in ms */
  refreshMs?: number;
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  low: {
    bg: 'bg-green-500/10 border-green-500/30',
    badge: 'bg-green-500/20 text-green-700 dark:text-green-300',
    bar: 'bg-green-500',
    label: 'Low',
    dot: 'bg-green-500',
  },
  medium: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    badge: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    bar: 'bg-yellow-500',
    label: 'Medium',
    dot: 'bg-yellow-500',
  },
  high: {
    bg: 'bg-red-500/10 border-red-500/30',
    badge: 'bg-red-500/20 text-red-700 dark:text-red-300',
    bar: 'bg-red-500',
    label: 'High',
    dot: 'bg-red-500 animate-pulse',
  },
  closed: {
    bg: 'bg-muted/50 border-border',
    badge: 'bg-muted text-muted-foreground',
    bar: 'bg-muted',
    label: 'Closed',
    dot: 'bg-gray-400',
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function GateStatusBoard({ 
  scenario = 'normal', 
  gateType = 'all',
  refreshMs = 5000,
}: GateStatusBoardProps) {
  const [gates, setGates] = useState<GateData[]>([]);
  const [recommended, setRecommended] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    function update() {
      // GateManager.getGates returns initialized gates for the scenario
      const all = GateManager.getGates(scenario as any);
      const filtered = gateType === 'all' ? all
        : all.filter(g => g.type === gateType);
      setGates(filtered);

      // Find recommended entry gate
      const entryGates: GateOption[] = all
        .filter(g => g.type === 'entry' && g.status !== 'closed')
        .map(g => ({
          id: g.id,
          name: g.name,
          currentQueue: Math.round(g.density * 500),
          capacity: 100,
          widthMeters: 4,
          distanceMeters: 0,
          isEntryGate: true,
          isExitGate: false,
          isOpen: g.status !== 'closed',
        }));

      if (entryGates.length > 0) {
        const rec = generateRouteRecommendation(entryGates[0], entryGates);
        setRecommended(rec.alternateGate?.name ?? entryGates[0].name);
      }

      setLastUpdated(new Date());
    }

    update();
    const interval = setInterval(update, refreshMs);
    return () => clearInterval(interval);
  }, [scenario, gateType, refreshMs]);

  return (
    <div className="space-y-3" role="region" aria-label="Gate Status Board" aria-live="polite">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">
            Live · Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        {recommended && (
          <div className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">
            <Star className="w-3 h-3" aria-hidden="true" />
            <span>Recommended: <strong>{recommended}</strong></span>
          </div>
        )}
      </div>

      {/* Gate Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
        role="list"
        aria-label={`${gateType === 'all' ? 'All' : gateType} gates`}
      >
        {gates.map((gate, idx) => {
          const cfg = STATUS_CONFIG[gate.status] ?? STATUS_CONFIG.low;
          const isRecommended = gate.name === recommended;
          const waitMins = calculateEstimatedWaitTime({
            id: gate.id,
            name: gate.name,
            currentQueue: Math.round(gate.density * 500),
            capacity: 100,
            widthMeters: 4,
            distanceMeters: 0,
            isEntryGate: gate.type === 'entry',
            isExitGate: gate.type === 'exit',
            isOpen: gate.status !== 'closed',
          });

          return (
            <div
              key={gate.id}
              role="listitem"
              tabIndex={0}
              aria-label={`${gate.name}: ${cfg.label} crowd, wait ${waitMins} minutes${isRecommended ? ', recommended gate' : ''}`}
              className={`relative rounded-lg border p-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500
                ${cfg.bg}
                ${isRecommended ? 'ring-2 ring-yellow-500 ring-offset-1' : ''}
              `}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 rounded-full p-0.5" aria-hidden="true">
                  <Star className="w-2.5 h-2.5 text-yellow-900" />
                </div>
              )}

              {/* Gate icon + status */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  {gate.status === 'closed'
                    ? <DoorClosed className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    : <DoorOpen className="w-4 h-4 text-foreground/70" aria-hidden="true" />
                  }
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {gate.type}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} aria-hidden="true" />
              </div>

              {/* Gate name */}
              <p className="font-bold text-[11px] leading-tight mb-1.5 line-clamp-2">{gate.name}</p>

              {/* Density bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5" role="progressbar" aria-valuenow={Math.round(gate.density * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                  style={{ width: `${Math.min(100, gate.density * 100)}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${cfg.badge}`}>
                  {cfg.label}
                </span>
                {gate.status !== 'closed' && (
                  <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>{waitMins}m</span>
                  </div>
                )}
              </div>

              {/* Suggestion if available */}
              {gate.suggestion && (
                <p className="mt-1.5 text-[9px] text-muted-foreground flex items-start gap-0.5">
                  <ArrowRight className="w-2.5 h-2.5 flex-shrink-0 mt-0.5 text-yellow-500" aria-hidden="true" />
                  <span className="line-clamp-2">{gate.suggestion}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1" role="legend" aria-label="Gate status legend">
        {(['low', 'medium', 'high', 'closed'] as const).map(status => (
          <div key={status} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} aria-hidden="true" />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
