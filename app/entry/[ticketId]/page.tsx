'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2,
  XCircle,
  Scan,
  DoorOpen,
  ArrowRight,
  Shield,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { getTicketById, validateTicket, getAuthState } from '@/lib/services/auth-service';
import { getEventById, formatEventTime } from '@/lib/data/events-data';
import { Ticket, SportEvent } from '@/lib/types';
import QRCode from '@/components/qr-code';

type ScanState = 'idle' | 'scanning' | 'validating' | 'success' | 'error';

export default function EntryPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const foundTicket = getTicketById(ticketId);
    if (foundTicket) {
      setTicket(foundTicket);
      const foundEvent = getEventById(foundTicket.eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      }
    }
  }, [ticketId]);

  const startScan = async () => {
    if (!ticket) return;
    
    setScanState('scanning');
    setScanProgress(0);
    
    // Simulate scanning animation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 100));
      setScanProgress(i);
    }
    
    setScanState('validating');
    await new Promise(r => setTimeout(r, 800));
    
    // Validate ticket
    const result = validateTicket(ticket.qrCode);
    
    if (result.valid) {
      setScanState('success');
    } else {
      setScanState('error');
      setErrorMessage(result.error || 'Validation failed');
    }
  };

  const enterStadium = () => {
    if (event) {
      // Store entry info for stadium experience
      localStorage.setItem('stadium_entry', JSON.stringify({
        ticketId: ticket?.id,
        eventId: event.id,
        gate: ticket?.gate,
        section: ticket?.section,
        entryTime: new Date().toISOString(),
      }));
      router.push('/stadium-live');
    }
  };

  if (!ticket || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <h2 className="text-xl font-bold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-4">Unable to load ticket for entry validation.</p>
          <Link href="/my-tickets">
            <Button>View My Tickets</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <DoorOpen className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">Smart Entry System</span>
          </div>
          <h1 className="text-2xl font-bold">{ticket.gate}</h1>
          <p className="text-muted-foreground">{event.venue}</p>
        </div>

        {/* Scan Card */}
        <Card className="overflow-hidden shadow-xl">
          <CardContent className="p-0">
            {/* Status Header */}
            <div className={`p-4 ${
              scanState === 'success' ? 'bg-green-500' :
              scanState === 'error' ? 'bg-destructive' :
              'bg-primary'
            } text-white`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {scanState === 'idle' && 'Ready to Scan'}
                  {scanState === 'scanning' && 'Scanning QR Code...'}
                  {scanState === 'validating' && 'Validating Ticket...'}
                  {scanState === 'success' && 'Access Granted!'}
                  {scanState === 'error' && 'Access Denied'}
                </span>
                {scanState === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {scanState === 'error' && <XCircle className="w-5 h-5" />}
                {(scanState === 'scanning' || scanState === 'validating') && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              
              {(scanState === 'scanning' || scanState === 'validating') && (
                <Progress value={scanProgress} className="mt-3 h-1 bg-white/30" />
              )}
            </div>

            {/* Main Content */}
            <div className="p-6">
              {scanState === 'idle' && (
                <>
                  {/* QR Code Display */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <QRCode value={ticket.qrCode} size={180} />
                      <div className="absolute inset-0 border-4 border-primary rounded-lg animate-pulse opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 font-mono">{ticket.qrCode}</p>
                  </div>

                  {/* Ticket Info */}
                  <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Section</p>
                      <p className="font-semibold">{ticket.section}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Seat</p>
                      <p className="font-semibold">{ticket.seat}</p>
                    </div>
                  </div>

                  <Button onClick={startScan} className="w-full" size="lg">
                    <Scan className="w-5 h-5 mr-2" />
                    Scan Ticket
                  </Button>
                </>
              )}

              {scanState === 'scanning' && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <div className="absolute inset-0 border-4 border-primary rounded-lg" />
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 bg-primary"
                      style={{ 
                        animation: 'scan 1s ease-in-out infinite',
                        transform: `translateY(${(scanProgress / 100) * 96}px)`
                      }}
                    />
                    <Scan className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Reading QR code...</p>
                </div>
              )}

              {scanState === 'validating' && (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                  <p className="font-medium">Verifying ticket authenticity...</p>
                  <p className="text-sm text-muted-foreground">Checking against event database</p>
                </div>
              )}

              {scanState === 'success' && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-green-600 mb-2">Welcome to the Stadium!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your ticket has been validated successfully.
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Your Section</p>
                        <p className="font-semibold">{ticket.section} - Seat {ticket.seat}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Event Starts</p>
                        <p className="font-semibold">{formatEventTime(event.time)}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={enterStadium} className="w-full" size="lg">
                    Enter Stadium Experience
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}

              {scanState === 'error' && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold text-destructive mb-2">Entry Denied</h2>
                  <p className="text-muted-foreground mb-6">{errorMessage}</p>
                  
                  <div className="space-y-3">
                    <Button onClick={() => setScanState('idle')} variant="outline" className="w-full">
                      Try Again
                    </Button>
                    <Link href="/my-tickets" className="block">
                      <Button variant="ghost" className="w-full">
                        View My Tickets
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Having trouble? <Link href="#" className="text-primary hover:underline">Contact support</Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
