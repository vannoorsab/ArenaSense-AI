'use client';

import { useState, useEffect, use, useRef } from 'react';
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
  ArrowLeft,
  Download,
  Share2,
  CheckCircle2,
  DoorOpen,
  QrCode,
  Ticket,
} from 'lucide-react';
import { getTicketById, getAuthState } from '@/lib/services/auth-service';
import { getEventById, formatEventDate, formatEventTime } from '@/lib/data/events-data';
import { Ticket as TicketType, SportEvent } from '@/lib/types';
import QRCode from '@/components/qr-code';

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const foundTicket = getTicketById(id);
    if (foundTicket) {
      setTicket(foundTicket);
      const foundEvent = getEventById(foundTicket.eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      }
    }
    setIsLoading(false);
  }, [id]);

  const handleDownload = () => {
    // Create a simple text representation for download
    const ticketText = `
ArenaSense AI - Event Ticket
==============================
Event: ${event?.name}
Date: ${event ? formatEventDate(event.date) : ''}
Time: ${event ? formatEventTime(event.time) : ''}
Venue: ${event?.venue}

Ticket Details:
- Ticket ID: ${ticket?.id}
- Type: ${ticket?.ticketType}
- Section: ${ticket?.section}
- Seat: ${ticket?.seat}
- Gate: ${ticket?.gate}

QR Code: ${ticket?.qrCode}

Present this QR code at the entry gate for scanning.
==============================
    `.trim();

    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket?.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${event?.name}`,
          text: `I'm attending ${event?.name} at ${event?.venue}!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <h2 className="text-xl font-bold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-4">This ticket does not exist or you don&apos;t have access to view it.</p>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/my-tickets" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">My Tickets</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Message */}
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-700">Registration Successful!</p>
            <p className="text-sm text-green-600">Your ticket has been confirmed. Show the QR code at entry.</p>
          </div>
        </div>

        {/* Ticket Card */}
        <Card className="overflow-hidden shadow-xl" ref={ticketRef}>
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {ticket.status === 'valid' ? 'Valid Ticket' : ticket.status}
                </Badge>
                <h1 className="text-2xl font-bold text-balance">{event.name}</h1>
              </div>
              <Ticket className="w-10 h-10 opacity-50" />
            </div>
          </div>

          {/* Event Info */}
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-sm">{formatEventDate(event.date).split(',')[0]}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-sm">{formatEventTime(event.time)}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="font-medium text-sm truncate">{event.venue.split(' ')[0]}</p>
              </div>
            </div>

            <Separator />

            {/* Ticket Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ticket Type</p>
                <p className="font-semibold">{ticket.ticketType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Section</p>
                <p className="font-semibold">{ticket.section}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Seat</p>
                <p className="font-semibold">{ticket.seat}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entry Gate</p>
                <div className="flex items-center gap-1">
                  <DoorOpen className="w-4 h-4 text-primary" />
                  <p className="font-semibold">{ticket.gate}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* QR Code Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-primary" />
                <p className="font-semibold">Entry QR Code</p>
              </div>
              <div className="flex justify-center mb-4">
                <QRCode value={ticket.qrCode} size={200} />
              </div>
              <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded inline-block">
                {ticket.qrCode}
              </p>
            </div>

            <Separator />

            {/* Ticket ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ticket ID</span>
              <span className="font-mono">{ticket.id}</span>
            </div>
          </CardContent>

          {/* Ticket Footer */}
          <div className="bg-muted/50 p-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Present this QR code at your assigned entry gate for scanning. 
              Gates open 2 hours before event start time.
            </p>
          </div>
        </Card>

        {/* Entry Button */}
        <div className="mt-8 text-center">
          <Link href={`/entry/${ticket.id}`}>
            <Button size="lg" className="px-8">
              <DoorOpen className="w-5 h-5 mr-2" />
              Simulate Entry Scan
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Test the smart entry system with your ticket
          </p>
        </div>
      </main>
    </div>
  );
}
