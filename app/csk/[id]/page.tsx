'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Ticket,
  Check,
  Trophy,
  Wifi,
  Shield,
  Navigation,
  Utensils,
  Info,
  Zap,
} from 'lucide-react';
import { getCSKMatchById, formatMatchDate, formatMatchTime, type CSKMatch } from '@/lib/csk-matches';
import { getStadiumById, type IPLStadium } from '@/lib/ipl-stadiums';
import { getAuthState, registerForEvent, getUserTickets } from '@/lib/auth-store';

export default function CSKMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<CSKMatch | null>(null);
  const [stadium, setStadium] = useState<IPLStadium | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    const matchData = getCSKMatchById(id);
    if (matchData) {
      setMatch(matchData);
      const stadiumData = getStadiumById(matchData.stadiumId);
      if (stadiumData) {
        setStadium(stadiumData);
      }
    }

    // Check if user already has a ticket
    const authState = getAuthState();
    if (authState.user) {
      const tickets = getUserTickets();
      const existingTicket = tickets.find(t => t.eventId === id);
      if (existingTicket) {
        setHasTicket(true);
        setTicketId(existingTicket.id);
      }
    }
  }, [id]);

  const handleRegister = async () => {
    const authState = getAuthState();
    if (!authState.user) {
      router.push(`/login?redirect=/csk/${id}`);
      return;
    }

    if (!selectedTicket || !match) return;

    setIsRegistering(true);
    
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Convert CSKMatch to SportEvent format for registration
    const sportEvent = {
      id: match.id,
      name: `CSK vs ${match.opponent}`,
      sport: 'cricket' as const,
      date: match.date,
      time: match.time,
      venue: match.venue,
      venueLayoutId: match.stadiumId,
      description: match.description,
      imageUrl: '',
      capacity: match.capacity,
      registeredCount: match.registeredCount,
      status: match.status,
      gates: match.gates,
      ticketTypes: match.ticketTypes,
    };
    
    const result = registerForEvent(sportEvent, selectedTicket);
    if (result.success && result.ticket) {
      setHasTicket(true);
      setTicketId(result.ticket.id);
    }

    setIsRegistering(false);
  };

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
          <Link href="/csk" className="flex items-center gap-2 text-white hover:text-[#FDB913] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Matches</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FDB913] flex items-center justify-center">
              <span className="text-[#003B7B] font-black text-[10px]">CSK</span>
            </div>
          </div>
        </div>
      </header>

      {/* Match Hero */}
      <section className="relative overflow-hidden border-b border-yellow-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003B7B] via-[#002855] to-[#001F3F]" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Match Info */}
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-[#FDB913]/20 text-[#FDB913] border-[#FDB913]/40">
                Match {match.matchNumber} • IPL 2026
              </Badge>

              {/* Teams Display */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#FDB913] flex items-center justify-center shadow-xl shadow-yellow-500/30 mb-2">
                    <span className="text-[#003B7B] font-black text-lg">CSK</span>
                  </div>
                  <p className="text-sm font-semibold text-white">Chennai</p>
                  <p className="text-xs text-blue-300">Super Kings</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white/40">VS</span>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${match.isHome ? 'border-green-500/50 text-green-400' : 'border-blue-400/50 text-blue-300'}`}
                  >
                    {match.isHome ? 'HOME' : 'AWAY'}
                  </Badge>
                </div>
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-2"
                    style={{ backgroundColor: match.opponentColor }}
                  >
                    <span className="text-white font-black text-lg">{match.opponentShort}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{match.opponent.split(' ')[0]}</p>
                  <p className="text-xs text-blue-300">{match.opponent.split(' ').slice(1).join(' ')}</p>
                </div>
              </div>

              {/* Match Details */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FDB913]" />
                  <span>{formatMatchDate(match.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FDB913]" />
                  <span>{formatMatchTime(match.time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FDB913]" />
                  <span>{stadium.name}, {stadium.city}</span>
                </div>
              </div>
            </div>

            {/* Stadium Info Card */}
            <Card className="w-full lg:w-80 bg-[#002855]/80 border-yellow-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FDB913]" />
                  Stadium Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-blue-400">Venue</p>
                  <p className="font-semibold text-white">{stadium.name}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-blue-400">Capacity</p>
                    <p className="font-semibold text-white">{stadium.capacity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400">Gates</p>
                    <p className="font-semibold text-white">{stadium.gates.length}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-400 mb-2">Entry Gates</p>
                  <div className="flex flex-wrap gap-1">
                    {stadium.gates.slice(0, 3).map((gate) => (
                      <Badge key={gate} variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-300">
                        {gate}
                      </Badge>
                    ))}
                    {stadium.gates.length > 3 && (
                      <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-300">
                        +{stadium.gates.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card className="bg-[#002855] border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#FDB913]" />
                  About This Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-200 leading-relaxed">{match.description}</p>
              </CardContent>
            </Card>

            {/* Stadium Features */}
            <Card className="bg-[#002855] border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#FDB913]" />
                  AI Stadium Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: Navigation, title: 'Smart Navigation', desc: 'AI-powered crowd avoidance routing' },
                    { icon: Users, title: 'Live Crowd Heatmap', desc: 'Real-time density visualization' },
                    { icon: Utensils, title: 'Queue Prediction', desc: 'Optimal time to visit facilities' },
                    { icon: Wifi, title: 'Real-time Updates', desc: 'Instant alerts and notifications' },
                    { icon: Shield, title: 'Safety System', desc: 'Emergency evacuation guidance' },
                    { icon: Zap, title: 'AI Assistant', desc: 'Voice-enabled smart helper' },
                  ].map((feature) => (
                    <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-[#003B7B]/50">
                      <div className="w-10 h-10 rounded-lg bg-[#FDB913]/20 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-[#FDB913]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{feature.title}</p>
                        <p className="text-xs text-blue-300">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {hasTicket ? (
              <Card className="bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-500/40">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">You&apos;re Registered!</h3>
                  <p className="text-green-200 text-sm mb-6">Your ticket for this match is confirmed.</p>
                  <div className="space-y-3">
                    <Link href={`/tickets/${ticketId}`}>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <Ticket className="w-4 h-4 mr-2" />
                        View Ticket
                      </Button>
                    </Link>
                    <Link href={`/csk/${match.id}/stadium`}>
                      <Button variant="outline" className="w-full border-green-500/50 text-green-300 hover:bg-green-500/20">
                        <Zap className="w-4 h-4 mr-2" />
                        Enter Stadium Experience
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#002855] border-yellow-500/30 sticky top-20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#FDB913]" />
                    Select Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {match.ticketTypes.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket.id)}
                      disabled={ticket.available === 0}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedTicket === ticket.id
                          ? 'border-[#FDB913] bg-[#FDB913]/10'
                          : ticket.available === 0
                          ? 'border-gray-600/30 bg-gray-600/10 opacity-50 cursor-not-allowed'
                          : 'border-yellow-500/20 hover:border-yellow-500/50 bg-[#003B7B]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{ticket.name}</span>
                        <span className="text-lg font-bold text-[#FDB913]">₹{ticket.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-300">{ticket.section}</span>
                        <span className={ticket.available > 0 ? 'text-green-400' : 'text-red-400'}>
                          {ticket.available > 0 ? `${ticket.available.toLocaleString()} available` : 'Sold Out'}
                        </span>
                      </div>
                    </button>
                  ))}

                  <Button
                    onClick={handleRegister}
                    disabled={!selectedTicket || isRegistering}
                    className="w-full bg-[#FDB913] hover:bg-yellow-400 text-[#003B7B] font-bold h-12 text-base"
                  >
                    {isRegistering ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#003B7B] border-t-transparent rounded-full animate-spin" />
                        Booking...
                      </div>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5 mr-2" />
                        Book Ticket
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-blue-400 text-center">
                    By booking, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Capacity */}
            <Card className="bg-[#002855] border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-300">Stadium Capacity</span>
                  <span className="text-sm font-semibold text-white">
                    {Math.round((match.registeredCount / match.capacity) * 100)}% Full
                  </span>
                </div>
                <div className="h-2 bg-[#003B7B] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#FDB913] rounded-full"
                    style={{ width: `${(match.registeredCount / match.capacity) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-400">
                  <span>{match.registeredCount.toLocaleString()} registered</span>
                  <span>{match.capacity.toLocaleString()} capacity</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
