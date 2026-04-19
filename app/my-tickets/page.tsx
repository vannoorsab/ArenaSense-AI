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
  ArrowLeft,
  Ticket,
  QrCode,
  DoorOpen,
  ChevronRight,
} from 'lucide-react';
import { getUserTickets, getAuthState } from '@/lib/services/auth-service';
import { getEventById, formatEventDate, formatEventTime } from '@/lib/data/events-data';
import { Ticket as TicketType, SportEvent } from '@/lib/types';

interface TicketWithEvent extends TicketType {
  event?: SportEvent;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      window.location.href = '/login?redirect=/my-tickets';
      return;
    }

    const userTickets = getUserTickets();
    const ticketsWithEvents = userTickets.map(ticket => ({
      ...ticket,
      event: getEventById(ticket.eventId),
    }));
    setTickets(ticketsWithEvents);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your tickets...</p>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Tickets</h1>
            <p className="text-muted-foreground">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} purchased
            </p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">No Tickets Yet</h2>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t registered for any events yet.
              </p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketWithEvent }) {
  const event = ticket.event;
  
  if (!event) return null;

  const statusColors = {
    valid: 'bg-green-500/10 text-green-600 border-green-200',
    used: 'bg-gray-500/10 text-gray-600 border-gray-200',
    expired: 'bg-red-500/10 text-red-600 border-red-200',
    cancelled: 'bg-red-500/10 text-red-600 border-red-200',
  };

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
        <CardContent className="p-0">
          <div className="flex">
            {/* Left - Event Info */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className={statusColors[ticket.status]}>
                  {ticket.status === 'valid' ? 'Valid' : ticket.status}
                </Badge>
                <Badge variant="outline">{event.sport}</Badge>
              </div>
              
              <h3 className="font-bold text-lg mb-3 line-clamp-1">{event.name}</h3>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatEventDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatEventTime(event.time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Section</p>
                  <p className="font-medium text-sm">{ticket.section}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Seat</p>
                  <p className="font-medium text-sm">{ticket.seat}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gate</p>
                  <div className="flex items-center gap-1">
                    <DoorOpen className="w-3 h-3 text-primary" />
                    <p className="font-medium text-sm">{ticket.gate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - QR Preview */}
            <div className="w-32 bg-muted/30 border-l flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center mb-2 border">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground text-center">View QR</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
