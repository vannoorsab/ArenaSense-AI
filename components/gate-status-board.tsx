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
import { GateService } from '@/lib/services/gate-service';
import type { GateData } from '@/lib/types';

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
      setGates(prev => {
        const updated = GateService.getUpdatedGates(prev.length > 0 ? prev : null, scenario);
        return gateType === 'all' ? updated : updated.filter(g => g.type === gateType);
      });
      setLastUpdated(new Date());
    }

    update();
    const interval = setInterval(update, refreshMs);
    return () => clearInterval(interval);
  }, [scenario, gateType, refreshMs]);

  const recommended = gates.find(g => !g.suggestion && g.status === 'low')?.name;

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
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        role="list"
        aria-label={`${gateType === 'all' ? 'All' : gateType} stadium gates`}
      >
        {gates.map((gate) => {
          const cfg = STATUS_CONFIG[gate.status] ?? STATUS_CONFIG.low;
          const isRecommended = gate.name === recommended;
          
          return (
            <div
              key={gate.id}
              role="listitem"
              tabIndex={0}
              aria-label={`${gate.name}: Status ${cfg.label}, Wait ${gate.waitTimeMinutes} minutes. ${gate.suggestion || ''}`}
              className={`relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary
                ${cfg.bg}
                ${isRecommended ? 'ring-2 ring-indigo-500' : ''}
              `}
            >
              {/* Gate Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <div className={`p-1 rounded ${gate.status === 'closed' ? 'bg-muted' : 'bg-background/50'}`}>
                    {gate.status === 'closed'
                      ? <DoorClosed className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      : <DoorOpen className="w-4 h-4 text-primary" aria-hidden="true" />
                    }
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">{gate.type}</p>
                    <p className="font-bold text-xs mt-0.5">{gate.name}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} aria-hidden="true" />
              </div>

              {/* Density Progress */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3" role="progressbar" aria-valuenow={Math.round(gate.density)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${cfg.bar}`}
                  style={{ width: `${gate.density}%` }}
                />
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-[10px] ${cfg.badge}`}>
                  {cfg.label}
                </Badge>
                {gate.status !== 'closed' && (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <span>{gate.waitTimeMinutes}m</span>
                  </div>
                )}
              </div>

              {/* AI Suggestion */}
              {gate.suggestion && (
                <div className="mt-2 bg-yellow-500/10 p-1.5 rounded text-[9px] text-yellow-700 dark:text-yellow-400 font-medium animate-pulse">
                  <ArrowRight className="w-3 h-3 inline mr-1" aria-hidden="true" />
                  {gate.suggestion}
                </div>
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
