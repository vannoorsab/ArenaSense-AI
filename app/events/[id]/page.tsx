'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft,
  Check,
  Shield,
  Zap,
  Navigation,
  Info,
  DoorOpen,
  AlertCircle,
} from 'lucide-react';
import { getEventById, formatEventDate, formatEventTime } from '@/lib/events-data';
import { getAuthState, registerForEvent } from '@/lib/auth-store';
import { SportEvent } from '@/lib/types';

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const foundEvent = getEventById(id);
    if (foundEvent) {
      setEvent(foundEvent);
      setSelectedTicket(foundEvent.ticketTypes[0]?.id || null);
    }
    
    const authState = getAuthState();
    setIsAuthenticated(authState.isAuthenticated);
  }, [id]);

  const handleRegister = async () => {
    if (!event || !selectedTicket) return;
    
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }
    
    setIsRegistering(true);
    setError('');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = registerForEvent(event, selectedTicket);
    
    if (result.success && result.ticket) {
      router.push(`/tickets/${result.ticket.id}`);
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setIsRegistering(false);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  const selectedTicketData = event.ticketTypes.find(t => t.id === selectedTicket);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Events</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AS</span>
            </div>
            <span className="font-bold text-lg">ArenaSense AI</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <Card className="overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                  <Badge className="mb-4" variant="outline">{event.sport}</Badge>
                  <h1 className="text-3xl font-bold text-balance px-4">{event.name}</h1>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium">{formatEventDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-medium">{formatEventTime(event.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Venue</p>
                      <p className="font-medium">{event.venue}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About This Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Stadium Features */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Smart Stadium Features</CardTitle>
                  <Link href={`/events/${event.id}/stadium`}>
                    <Button size="sm" className="gap-2">
                      <Navigation className="w-4 h-4" />
                      Enter Stadium
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Navigation, title: 'AI Navigation', desc: 'Real-time crowd avoidance routing' },
                    { icon: Zap, title: 'Live Heatmaps', desc: 'See crowd density in real-time' },
                    { icon: Shield, title: 'Emergency Alerts', desc: 'Instant safety notifications' },
                    { icon: Users, title: 'Queue Predictions', desc: 'Know wait times before you go' },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Stadium Experience CTA */}
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Try the Stadium Experience</p>
                      <p className="text-sm text-muted-foreground">3D View, AI Assistant, Live Heatmap & more</p>
                    </div>
                    <Link href={`/events/${event.id}/stadium`}>
                      <Button>
                        Launch Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Entry Gates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="w-5 h-5" />
                  Entry Gates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.gates.map((gate, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {gate}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Your assigned gate will be shown on your ticket after registration.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Select Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ticket Types */}
                <div className="space-y-3">
                  {event.ticketTypes.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket.id)}
                      disabled={ticket.available === 0}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedTicket === ticket.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${ticket.available === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{ticket.name}</p>
                          <p className="text-sm text-muted-foreground">{ticket.section} Section</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${ticket.price}</p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.available > 0 ? `${ticket.available} left` : 'Sold out'}
                          </p>
                        </div>
                      </div>
                      {selectedTicket === ticket.id && (
                        <div className="mt-2 flex items-center gap-1 text-primary text-sm">
                          <Check className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <Separator />

                {/* Summary */}
                {selectedTicketData && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ticket</span>
                      <span>{selectedTicketData.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Section</span>
                      <span>{selectedTicketData.section}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${selectedTicketData.price}</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleRegister}
                  disabled={!selectedTicket || isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <Spinner className="mr-2" />
                      Processing...
                    </>
                  ) : !isAuthenticated ? (
                    'Sign In to Register'
                  ) : (
                    'Register Now'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout. Your ticket will include a unique QR code for entry.
                </p>
              </CardContent>
            </Card>

            {/* Capacity Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Event Capacity
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((event.registeredCount / event.capacity) * 100)}% Full
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {event.registeredCount.toLocaleString()} of {event.capacity.toLocaleString()} registered
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
