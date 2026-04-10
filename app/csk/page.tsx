'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  LogOut,
  Ticket,
  User,
  Trophy,
  Zap,
  ChevronRight,
  Home,
  Plane,
} from 'lucide-react';
import { CSK_MATCHES, formatMatchDate, formatMatchTime, CSK_COLORS, type CSKMatch } from '@/lib/csk-matches';
import { getAuthState, logoutUser } from '@/lib/auth-store';

export default function CSKMatchesPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'home' | 'away'>('all');

  useEffect(() => {
    const authState = getAuthState();
    if (authState.user) {
      setUser({ name: authState.user.name, email: authState.user.email });
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const filteredMatches = CSK_MATCHES.filter(match => {
    if (filter === 'home') return match.isHome;
    if (filter === 'away') return !match.isHome;
    return true;
  });

  const liveMatch = CSK_MATCHES.find(m => m.status === 'live');

  return (
    <div className="min-h-screen bg-[#003B7B]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-[#002855]/95 backdrop-blur supports-[backdrop-filter]:bg-[#002855]/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FDB913] flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <span className="text-[#003B7B] font-black text-sm">CSK</span>
            </div>
            <div>
              <span className="font-bold text-lg text-white">Chennai Super Kings</span>
              <p className="text-[10px] text-yellow-400 -mt-0.5">Whistle Podu!</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/my-tickets">
                  <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10">
                    <Ticket className="w-4 h-4" />
                    <span className="hidden sm:inline">My Tickets</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-yellow-500/30">
                  <div className="w-8 h-8 rounded-full bg-[#FDB913] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#003B7B]" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/10">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#FDB913] text-[#003B7B] hover:bg-yellow-400">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-yellow-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003B7B] via-[#002855] to-[#001F3F]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGREI5MTMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FDB913]/20 border border-[#FDB913]/40 mb-6">
                <Trophy className="w-4 h-4 text-[#FDB913]" />
                <span className="text-sm font-medium text-[#FDB913]">5x IPL Champions</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 text-balance">
                IPL 2026
                <span className="block text-[#FDB913]">CSK Matches</span>
              </h1>
              <p className="text-lg text-blue-200 text-pretty max-w-xl mb-8">
                Experience the roar of the Yellow Army! Book your tickets and enter the AI-powered stadium experience for every CSK match.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-[#FDB913]">{CSK_MATCHES.length}</p>
                  <p className="text-xs text-blue-300">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-[#FDB913]">{CSK_MATCHES.filter(m => m.isHome).length}</p>
                  <p className="text-xs text-blue-300">Home Games</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-[#FDB913]">{CSK_MATCHES.filter(m => !m.isHome).length}</p>
                  <p className="text-xs text-blue-300">Away Games</p>
                </div>
              </div>
            </div>

            {/* Live Match Card */}
            {liveMatch && (
              <div className="w-full lg:w-auto">
                <Card className="bg-gradient-to-br from-red-600 to-red-700 border-red-500 overflow-hidden animate-pulse-slow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      <span className="text-sm font-bold text-white">LIVE NOW</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{liveMatch.name}</h3>
                    <p className="text-red-100 text-sm mb-4">{liveMatch.venue}</p>
                    <Link href={`/csk/${liveMatch.id}/stadium`}>
                      <Button className="w-full bg-white text-red-600 hover:bg-red-50 font-bold">
                        <Zap className="w-4 h-4 mr-2" />
                        Enter Stadium
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 z-40 bg-[#002855]/95 backdrop-blur border-b border-yellow-500/20">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3">
            {[
              { key: 'all', label: 'All Matches', icon: Calendar },
              { key: 'home', label: 'Home', icon: Home },
              { key: 'away', label: 'Away', icon: Plane },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as typeof filter)}
                className={filter === key 
                  ? 'bg-[#FDB913] text-[#003B7B] hover:bg-yellow-400 border-[#FDB913]' 
                  : 'border-yellow-500/30 text-yellow-100 hover:bg-white/10 hover:text-white'
                }
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Matches Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/20 bg-[#001F3F] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-300 text-sm">Powered by ArenaSense AI</p>
          <p className="text-yellow-500 text-xs mt-1">Whistle Podu! Super Kings!</p>
        </div>
      </footer>
    </div>
  );
}

function MatchCard({ match }: { match: CSKMatch }) {
  const availableTickets = match.ticketTypes.reduce((sum, t) => sum + t.available, 0);
  const percentFull = Math.round((match.registeredCount / match.capacity) * 100);
  const isSoldOut = availableTickets === 0;

  return (
    <Card className="overflow-hidden bg-[#002855] border-yellow-500/20 hover:border-yellow-500/50 transition-all group">
      {/* Match Header */}
      <div className="relative h-32 bg-gradient-to-br from-[#003B7B] to-[#001F3F] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGREI5MTMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        {/* Teams Display */}
        <div className="relative flex items-center gap-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#FDB913] flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-1">
              <span className="text-[#003B7B] font-black text-xs">CSK</span>
            </div>
            <span className="text-[10px] text-yellow-400 font-medium">Chennai</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-white/60">VS</span>
            <Badge 
              variant="outline" 
              className={`mt-1 text-[10px] ${match.isHome ? 'border-green-500/50 text-green-400' : 'border-blue-400/50 text-blue-300'}`}
            >
              {match.isHome ? 'HOME' : 'AWAY'}
            </Badge>
          </div>
          <div className="text-center">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-1"
              style={{ backgroundColor: match.opponentColor }}
            >
              <span className="text-white font-black text-xs">{match.opponentShort}</span>
            </div>
            <span className="text-[10px] text-blue-300 font-medium">{match.opponent.split(' ')[0]}</span>
          </div>
        </div>

        {/* Live Badge */}
        {match.status === 'live' && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0 animate-pulse">
            LIVE
          </Badge>
        )}

        {/* Match Number */}
        <Badge 
          variant="outline" 
          className="absolute top-3 left-3 border-yellow-500/30 text-yellow-400 text-[10px]"
        >
          Match {match.matchNumber}
        </Badge>
      </div>

      <CardContent className="p-5">
        {/* Match Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <Calendar className="w-4 h-4 flex-shrink-0 text-[#FDB913]" />
            <span>{formatMatchDate(match.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <Clock className="w-4 h-4 flex-shrink-0 text-[#FDB913]" />
            <span>{formatMatchTime(match.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <MapPin className="w-4 h-4 flex-shrink-0 text-[#FDB913]" />
            <span className="truncate">{match.venue}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-blue-300 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {match.registeredCount.toLocaleString()} / {match.capacity.toLocaleString()}
            </span>
            <span className={`font-medium ${percentFull > 90 ? 'text-red-400' : percentFull > 70 ? 'text-yellow-400' : 'text-green-400'}`}>
              {percentFull}% Full
            </span>
          </div>
          <div className="h-1.5 bg-[#003B7B] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${percentFull > 90 ? 'bg-red-500' : percentFull > 70 ? 'bg-[#FDB913]' : 'bg-green-500'}`}
              style={{ width: `${percentFull}%` }}
            />
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-400">Starting from</p>
            <p className="font-bold text-lg text-white">
              ₹{Math.min(...match.ticketTypes.map(t => t.price)).toLocaleString()}
            </p>
          </div>
          
          {match.status === 'live' ? (
            <Link href={`/csk/${match.id}/stadium`}>
              <Button className="bg-red-500 hover:bg-red-600 text-white gap-1.5">
                <Zap className="w-4 h-4" />
                Enter Stadium
              </Button>
            </Link>
          ) : isSoldOut ? (
            <Button disabled className="bg-gray-600 text-gray-300">
              Sold Out
            </Button>
          ) : (
            <Link href={`/csk/${match.id}`}>
              <Button className="bg-[#FDB913] hover:bg-yellow-400 text-[#003B7B] gap-1.5 font-semibold">
                View Match
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
