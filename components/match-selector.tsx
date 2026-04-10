'use client';
/**
 * match-selector.tsx
 * CSK Match Cards with crowd-level indicators and direct stadium entry.
 * Accessible: keyboard navigable, ARIA labels, high-contrast badge colors.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Radio, ChevronRight, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CSK_MATCHES, formatMatchDate, formatMatchTime, type CSKMatch } from '@/lib/csk-matches';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MatchSelectorProps {
  /** Filter to only show home / away / all */
  filter?: 'home' | 'away' | 'all';
  /** Limit displayed matches */
  limit?: number;
  /** Compact card style */
  compact?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CROWD_LEVELS = [
  { threshold: 0.95, label: 'Sold Out', color: 'bg-red-500 text-white', dot: 'bg-red-500' },
  { threshold: 0.85, label: 'Almost Full', color: 'bg-orange-500 text-white', dot: 'bg-orange-500' },
  { threshold: 0.70, label: 'Filling Up', color: 'bg-yellow-500 text-black', dot: 'bg-yellow-500' },
  { threshold: 0, label: 'Available', color: 'bg-green-500 text-white', dot: 'bg-green-500' },
];

function getCrowdLevel(match: CSKMatch) {
  const ratio = match.registeredCount / match.capacity;
  return CROWD_LEVELS.find(l => ratio >= l.threshold) ?? CROWD_LEVELS[3];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MatchSelector({ filter = 'all', limit, compact = false }: MatchSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  let matches = CSK_MATCHES;
  if (filter === 'home') matches = matches.filter(m => m.isHome);
  if (filter === 'away') matches = matches.filter(m => !m.isHome);
  if (limit) matches = matches.slice(0, limit);

  return (
    <div
      role="list"
      aria-label="CSK IPL 2026 Matches"
      className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}
    >
      {matches.map((match) => {
        const crowd = getCrowdLevel(match);
        const isLive = match.status === 'live';
        const filledPct = Math.round((match.registeredCount / match.capacity) * 100);
        const isHovered = hovered === match.id;

        return (
          <Card
            key={match.id}
            role="listitem"
            aria-label={`${match.name} on ${formatMatchDate(match.date)}`}
            className={`relative overflow-hidden transition-all duration-300 cursor-pointer
              ${isHovered ? 'shadow-xl -translate-y-1 border-yellow-500/50' : 'shadow-md'}
              ${isLive ? 'ring-2 ring-red-500 ring-offset-2' : ''}
            `}
            onMouseEnter={() => setHovered(match.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* CSK Yellow top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600" />

            <CardContent className="p-4">
              {/* Match header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* Opponent colored badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-md"
                    style={{ backgroundColor: match.opponentColor }}
                    aria-label={`Vs ${match.opponent}`}
                  >
                    {match.opponentShort}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{match.name}</p>
                    <p className="text-[11px] text-muted-foreground">{match.opponent}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {/* Live badge */}
                  {isLive && (
                    <Badge variant="destructive" className="text-[10px] gap-1 animate-pulse h-5">
                      <Radio className="w-2.5 h-2.5" />
                      LIVE
                    </Badge>
                  )}
                  {/* Home/Away badge */}
                  <Badge variant={match.isHome ? 'default' : 'outline'} className="text-[10px] h-5">
                    {match.isHome ? '🏠 Home' : '✈️ Away'}
                  </Badge>
                </div>
              </div>

              {/* Match details */}
              <div className="space-y-1.5 mb-3" aria-label="Match details">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{formatMatchDate(match.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{formatMatchTime(match.time)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="line-clamp-1">{match.venue}</span>
                </div>
              </div>

              {/* Capacity fill bar */}
              <div className="mb-3" aria-label={`Stadium ${filledPct}% full`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="w-3 h-3" aria-hidden="true" />
                    <span>{match.registeredCount.toLocaleString('en-IN')} / {match.capacity.toLocaleString('en-IN')}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${crowd.color}`}
                    aria-label={`Crowd status: ${crowd.label}`}
                  >
                    {crowd.label}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={filledPct} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${filledPct}%`,
                      backgroundColor: filledPct >= 95 ? '#ef4444' : filledPct >= 85 ? '#f97316' : filledPct >= 70 ? '#eab308' : '#22c55e',
                    }}
                  />
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/csk/${match.id}`}
                aria-label={`Enter stadium experience for ${match.name}`}
              >
                <Button
                  size="sm"
                  className={`w-full gap-1.5 text-xs font-bold transition-all
                    ${isLive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-[#FDB913] hover:bg-yellow-400 text-[#003B7B]'
                    }
                  `}
                >
                  <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                  {isLive ? 'Join Live Experience' : 'Enter Stadium Experience'}
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
