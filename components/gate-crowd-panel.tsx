'use client';

import { useState, useEffect } from 'react';
import { GateData, GateSuggestion } from '@/lib/types';
import { GateManager } from '@/lib/gate-manager';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight, TrendingUp, TrendingDown, Minus,
  DoorOpen, DoorClosed, AlertTriangle, Clock, Users, Navigation,
} from 'lucide-react';

interface GateCrowdPanelProps {
  scenario?: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge';
  compact?: boolean;
}

function statusColor(status: GateData['status']): string {
  return status === 'high' ? '#ef4444' : status === 'medium' ? '#f59e0b' : '#22c55e';
}

function statusBg(status: GateData['status']): string {
  return status === 'high'
    ? 'bg-red-50 border-red-200'
    : status === 'medium'
    ? 'bg-amber-50 border-amber-200'
    : 'bg-green-50 border-green-200';
}

function statusLabel(status: GateData['status']): string {
  return status === 'high' ? 'HIGH' : status === 'medium' ? 'MED' : 'LOW';
}

function TrendIcon({ trend }: { trend: GateData['trend'] }) {
  if (trend === 'increasing') return <TrendingUp className="w-3 h-3 text-red-500" />;
  if (trend === 'decreasing') return <TrendingDown className="w-3 h-3 text-green-500" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

function GateCard({ gate }: { gate: GateData }) {
  const fillPct = Math.min(100, gate.density);
  const barColor = statusColor(gate.status);
  const label = gate.name.split(' - ')[1] || gate.name;
  const gateCode = gate.name.match(/Gate ([A-H])/)?.[1] ?? '';

  return (
    <div className={`rounded-xl border p-3 transition-all ${statusBg(gate.status)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
            style={{ backgroundColor: barColor }}
          >
            {gateCode}
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight">{label}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{gate.type} gate</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon trend={gate.trend} />
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: barColor + '20', color: barColor }}
          >
            {statusLabel(gate.status)}
          </span>
        </div>
      </div>

      {/* Density bar */}
      <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${fillPct}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {gate.currentCount.toLocaleString()} / {gate.capacity.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~{gate.waitTimeMinutes} min wait
        </span>
        <span className="font-medium" style={{ color: barColor }}>
          {Math.round(gate.density)}%
        </span>
      </div>

      {!gate.isOpen && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-destructive font-semibold">
          <DoorClosed className="w-3 h-3" />Closed
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ s }: { s: GateSuggestion }) {
  return (
    <div className={`rounded-lg border p-3 flex items-start gap-3 ${
      s.urgency === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    }`}>
      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
        s.urgency === 'critical' ? 'text-red-500' : 'text-amber-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">
          {s.reason}
        </p>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
          <Navigation className="w-3 h-3" />
          <span className="truncate">{s.fromGate.split(' - ')[1]}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0" />
          <span className="truncate font-medium text-foreground">{s.toGate.split(' - ')[1]}</span>
          <span className="flex-shrink-0 text-green-600 font-medium">
            · Save ~{s.timeSavedMinutes} min
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GateCrowdPanel({ scenario = 'normal', compact = false }: GateCrowdPanelProps) {
  const [gates, setGates] = useState<GateData[]>([]);
  const [suggestions, setSuggestions] = useState<GateSuggestion[]>([]);

  useEffect(() => {
    const initial = GateManager.initializeGates(scenario);
    setGates(initial);
    setSuggestions(GateManager.generateSuggestions(initial));
  }, [scenario]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGates(prev => {
        const updated = GateManager.updateGateStateTransitions(prev, scenario);
        setSuggestions(GateManager.generateSuggestions(updated));
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [scenario]);

  const entryGates = gates.filter(g => g.type === 'entry');
  const exitGates = gates.filter(g => g.type === 'exit');
  const highCount = gates.filter(g => g.status === 'high').length;
  const medCount = gates.filter(g => g.status === 'medium').length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <DoorOpen className="w-3 h-3" />
          {gates.length} Gates Active
        </Badge>
        {highCount > 0 && (
          <Badge className="bg-red-500 text-white gap-1">
            <AlertTriangle className="w-3 h-3" />
            {highCount} High
          </Badge>
        )}
        {medCount > 0 && (
          <Badge className="bg-amber-500 text-white gap-1">{medCount} Medium</Badge>
        )}
        <Badge className="bg-green-500 text-white gap-1">
          {gates.filter(g => g.status === 'low').length} Clear
        </Badge>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            🧠 AI Smart Suggestions
          </p>
          {suggestions.map((s, i) => <SuggestionCard key={i} s={s} />)}
        </div>
      )}

      {/* Entry Gates */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Entry Gates
        </p>
        <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {entryGates.map(g => <GateCard key={g.id} gate={g} />)}
        </div>
      </div>

      {/* Exit Gates */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Exit Gates
        </p>
        <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {exitGates.map(g => <GateCard key={g.id} gate={g} />)}
        </div>
      </div>
    </div>
  );
}
