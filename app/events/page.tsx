'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  LogOut,
  Ticket,
  User,
  ArrowRight,
  Flame,
  Star,
  TrendingUp,
  Sparkles,
  Filter,
  ChevronRight,
  Zap,
  CircleDot,
  Music2,
  Trophy,
  Timer,
} from 'lucide-react';
import { EVENTS, formatEventDate, formatEventTime, getLiveEvents } from '@/lib/events-data';
import { getAuthState, logoutUser } from '@/lib/auth-store';
import { SportEvent } from '@/lib/types';

const sportConfig: Record<SportEvent['sport'], { icon: React.ReactNode; color: string; bg: string; gradient: string }> = {
  football: { 
    icon: <Trophy className="w-5 h-5" />, 
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    gradient: 'from-emerald-500/20 to-emerald-600/5'
  },
  basketball: { 
    icon: <CircleDot className="w-5 h-5" />, 
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    gradient: 'from-orange-500/20 to-orange-600/5'
  },
  cricket: { 
    icon: <CircleDot className="w-5 h-5" />, 
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    gradient: 'from-sky-500/20 to-sky-600/5'
  },
  tennis: { 
    icon: <CircleDot className="w-5 h-5" />, 
    color: 'text-lime-500',
    bg: 'bg-lime-500/10',
    gradient: 'from-lime-500/20 to-lime-600/5'
  },
  concert: { 
    icon: <Music2 className="w-5 h-5" />, 
    color: 'text-fuchsia-500',
    bg: 'bg-fuchsia-500/10',
    gradient: 'from-fuchsia-500/20 to-fuchsia-600/5'
  },
  other: { 
    icon: <Zap className="w-5 h-5" />, 
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    gradient: 'from-amber-500/20 to-amber-600/5'
  },
};

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

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

  const liveEvents = useMemo(() => getLiveEvents(), []);
  
  const filteredEvents = useMemo(() => {
    return EVENTS.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            event.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = selectedSport === 'all' || event.sport === selectedSport;
      return matchesSearch && matchesSport && event.status !== 'completed';
    });
  }, [searchQuery, selectedSport]);

  const featuredEvents = useMemo(() => {
    return EVENTS.filter(e => e.status === 'upcoming')
      .sort((a, b) => (b.registeredCount / b.capacity) - (a.registeredCount / a.capacity))
      .slice(0, 3);
  }, []);

  const sports = [
    { id: 'all', label: 'All Events', count: EVENTS.filter(e => e.status !== 'completed').length },
    { id: 'football', label: 'Football', count: EVENTS.filter(e => e.sport === 'football' && e.status !== 'completed').length },
    { id: 'basketball', label: 'Basketball', count: EVENTS.filter(e => e.sport === 'basketball' && e.status !== 'completed').length },
    { id: 'cricket', label: 'Cricket', count: EVENTS.filter(e => e.sport === 'cricket' && e.status !== 'completed').length },
    { id: 'tennis', label: 'Tennis', count: EVENTS.filter(e => e.sport === 'tennis' && e.status !== 'completed').length },
    { id: 'concert', label: 'Concerts', count: EVENTS.filter(e => e.sport === 'concert' && e.status !== 'completed').length },
    { id: 'other', label: 'Other', count: EVENTS.filter(e => e.sport === 'other' && e.status !== 'completed').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-sm">AS</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg tracking-tight">ArenaSense AI</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">AI-Powered Events</p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/csk">
              <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10 gap-1.5">
                <span className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-black text-blue-900">CSK</span>
                <span className="hidden sm:inline">IPL 2026</span>
              </Button>
            </Link>
            {user ? (
              <>
                <Link href="/my-tickets">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Ticket className="w-4 h-4" />
                    <span className="hidden sm:inline">My Tickets</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-lg shadow-primary/20">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Live Events Banner */}
      {liveEvents.length > 0 && (
        <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 py-3 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-bold text-sm uppercase tracking-wider">Live Now</span>
              </div>
              {liveEvents.map((event, idx) => (
                <Link key={event.id} href={`/events/${event.id}`} className="flex-shrink-0">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full pl-2 pr-4 py-1.5 hover:bg-white/20 transition-colors">
                    <div className={`w-7 h-7 rounded-full ${sportConfig[event.sport].bg} flex items-center justify-center`}>
                      <span className={sportConfig[event.sport].color}>{sportConfig[event.sport].icon}</span>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{event.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Experience
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {EVENTS.filter(e => e.status !== 'completed').length} Events
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-balance mb-4 tracking-tight">
              Discover Amazing
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent"> Live Events</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty mb-8 max-w-2xl">
              From epic sports battles to unforgettable concerts. Book tickets and navigate venues 
              with our smart stadium AI for the best experience.
            </p>
            
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search events, venues, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base border-2 focus:border-primary rounded-xl"
                />
              </div>
              <Button size="lg" className="h-12 px-6 gap-2 rounded-xl shadow-lg shadow-primary/20">
                <Filter className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Trending Events</h2>
              <p className="text-sm text-muted-foreground">Selling fast - Don&apos;t miss out!</p>
            </div>
          </div>
          <Button variant="ghost" className="gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {featuredEvents.map((event, idx) => (
            <FeaturedEventCard key={event.id} event={event} rank={idx + 1} />
          ))}
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4">
          <Tabs value={selectedSport} onValueChange={setSelectedSport} className="w-full">
            <TabsList className="h-auto p-1.5 bg-muted/50 w-full justify-start overflow-x-auto flex-nowrap rounded-none border-0">
              {sports.map((sport) => (
                <TabsTrigger 
                  key={sport.id} 
                  value={sport.id}
                  className="px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg whitespace-nowrap gap-2"
                >
                  {sport.label}
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    {sport.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Events Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> events
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="w-4 h-4" />
            Updated just now
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedSport('all'); }}>
              Clear all filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function FeaturedEventCard({ event, rank }: { event: SportEvent; rank: number }) {
  const percentFull = Math.round((event.registeredCount / event.capacity) * 100);
  const config = sportConfig[event.sport];
  
  return (
    <Link href={`/events/${event.id}`}>
      <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/30 bg-gradient-to-br ${config.gradient}`}>
        <div className="absolute top-3 left-3 z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
            #{rank}
          </div>
        </div>
        <CardContent className="p-5 pt-14">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center`}>
              <span className={config.color}>{config.icon}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {percentFull}% sold
            </Badge>
          </div>
          
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.name}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatEventDate(event.date)}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">From</p>
              <p className="font-bold text-xl">${Math.min(...event.ticketTypes.map(t => t.price))}</p>
            </div>
            <Button size="sm" className="gap-1.5 shadow-md">
              Get Tickets <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EventCard({ event }: { event: SportEvent }) {
  const availableTickets = event.ticketTypes.reduce((sum, t) => sum + t.available, 0);
  const percentFull = Math.round((event.registeredCount / event.capacity) * 100);
  const config = sportConfig[event.sport];
  const isAlmostSoldOut = percentFull > 90;
  const isHot = percentFull > 75;
  
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full border hover:border-primary/20">
        {/* Header */}
        <div className={`relative h-32 bg-gradient-to-br ${config.gradient} p-4 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <Badge variant="secondary" className={`${config.bg} ${config.color} border-0 text-xs font-semibold`}>
              {event.sport}
            </Badge>
            <div className="flex items-center gap-1.5">
              {event.status === 'live' && (
                <Badge className="bg-red-500 text-white animate-pulse gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  LIVE
                </Badge>
              )}
              {isHot && event.status !== 'live' && (
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-0 gap-1">
                  <Flame className="w-3 h-3" />
                  Hot
                </Badge>
              )}
            </div>
          </div>
          <div className={`w-14 h-14 rounded-2xl ${config.bg} backdrop-blur-sm flex items-center justify-center border border-white/10`}>
            <span className={`${config.color} scale-125`}>{config.icon}</span>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {event.name}
          </h3>
          
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatEventDate(event.date)} · {formatEventTime(event.time)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
          
          {/* Capacity */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.registeredCount.toLocaleString()} attending
              </span>
              <span className={`font-semibold ${isAlmostSoldOut ? 'text-red-500' : isHot ? 'text-orange-500' : 'text-emerald-500'}`}>
                {availableTickets > 0 ? `${percentFull}%` : 'Sold Out'}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isAlmostSoldOut ? 'bg-gradient-to-r from-red-500 to-red-400' : 
                  isHot ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 
                  'bg-gradient-to-r from-emerald-500 to-green-400'
                }`}
                style={{ width: `${percentFull}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-[10px] text-muted-foreground">Starting from</p>
              <p className="font-bold text-lg">${Math.min(...event.ticketTypes.map(t => t.price))}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1 h-8 px-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/events/${event.id}/stadium`;
                }}
              >
                <MapPin className="w-3 h-3" />
                <span className="hidden sm:inline text-xs">Stadium</span>
              </Button>
              <Button 
                size="sm" 
                variant={availableTickets > 0 ? 'default' : 'secondary'}
                className={availableTickets > 0 ? 'shadow-md' : ''}
                disabled={availableTickets === 0}
              >
                {availableTickets > 0 ? 'Book' : 'Sold'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
