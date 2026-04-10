'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Users, 
  Clock, 
  Navigation, 
  AlertTriangle,
  Radio,
  ChevronRight,
  Ticket,
  LogOut,
  MessageSquare,
  Volume2,
} from 'lucide-react';
import { getEventById, formatEventTime } from '@/lib/events-data';
import { getAuthState } from '@/lib/auth-store';
import { SportEvent } from '@/lib/types';
import AttendeeInterface from '@/components/attendee-interface';

interface EntryInfo {
  ticketId: string;
  eventId: string;
  gate: string;
  section: string;
  entryTime: string;
}

export default function StadiumLivePage() {
  const router = useRouter();
  const [entryInfo, setEntryInfo] = useState<EntryInfo | null>(null);
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [activeTab, setActiveTab] = useState('navigate');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      router.push('/login');
      return;
    }

    // Get entry info from localStorage
    const storedEntry = localStorage.getItem('stadium_entry');
    if (storedEntry) {
      const info = JSON.parse(storedEntry) as EntryInfo;
      setEntryInfo(info);
      
      const foundEvent = getEventById(info.eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      }
    } else {
      // No entry info - redirect to events
      router.push('/events');
    }
  }, [router]);

  // Update elapsed time
  useEffect(() => {
    if (!entryInfo) return;
    
    const interval = setInterval(() => {
      const entry = new Date(entryInfo.entryTime);
      const now = new Date();
      setElapsedTime(Math.floor((now.getTime() - entry.getTime()) / 1000 / 60));
    }, 60000);

    // Initial calculation
    const entry = new Date(entryInfo.entryTime);
    const now = new Date();
    setElapsedTime(Math.floor((now.getTime() - entry.getTime()) / 1000 / 60));

    return () => clearInterval(interval);
  }, [entryInfo]);

  const handleExit = () => {
    localStorage.removeItem('stadium_entry');
    router.push('/events');
  };

  if (!entryInfo || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading stadium experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Live Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-500">LIVE</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="font-semibold truncate max-w-[200px] sm:max-w-none">{event.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex gap-1">
                <Clock className="w-3 h-3" />
                {elapsedTime}m in venue
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleExit}>
                <LogOut className="w-4 h-4 mr-1" />
                Exit
              </Button>
            </div>
          </div>
          
          {/* Info Bar */}
          <div className="flex items-center gap-4 pb-3 text-sm overflow-x-auto">
            <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
              <Ticket className="w-4 h-4" />
              <span>{entryInfo.section}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
              <MapPin className="w-4 h-4" />
              <span>{entryInfo.gate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
              <Clock className="w-4 h-4" />
              <span>{formatEventTime(event.time)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b bg-background sticky top-[88px] z-40">
            <div className="container mx-auto px-4">
              <TabsList className="h-12 w-full justify-start bg-transparent border-0 p-0 gap-0">
                <TabsTrigger 
                  value="navigate" 
                  className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate
                </TabsTrigger>
                <TabsTrigger 
                  value="facilities" 
                  className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Facilities
                </TabsTrigger>
                <TabsTrigger 
                  value="alerts" 
                  className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Alerts
                </TabsTrigger>
                <TabsTrigger 
                  value="info" 
                  className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Event
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="navigate" className="m-0">
            <AttendeeInterface />
          </TabsContent>

          <TabsContent value="facilities" className="m-0">
            <FacilitiesTab section={entryInfo.section} />
          </TabsContent>

          <TabsContent value="alerts" className="m-0">
            <AlertsTab />
          </TabsContent>

          <TabsContent value="info" className="m-0">
            <EventInfoTab event={event} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function FacilitiesTab({ section }: { section: string }) {
  const facilities = [
    { name: 'Restrooms', distance: '45m', waitTime: '2 min', crowded: false },
    { name: 'Food Court', distance: '120m', waitTime: '8 min', crowded: true },
    { name: 'Beverage Stand', distance: '30m', waitTime: '3 min', crowded: false },
    { name: 'Merchandise Shop', distance: '200m', waitTime: '5 min', crowded: false },
    { name: 'First Aid', distance: '150m', waitTime: 'No wait', crowded: false },
    { name: 'Information Desk', distance: '180m', waitTime: '1 min', crowded: false },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Nearby Facilities</h2>
        <p className="text-muted-foreground text-sm">From your section: {section}</p>
      </div>
      
      <div className="grid gap-3">
        {facilities.map((facility, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{facility.name}</p>
                    <p className="text-sm text-muted-foreground">{facility.distance} away</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={facility.crowded ? 'destructive' : 'secondary'}>
                    {facility.crowded ? 'Busy' : facility.waitTime}
                  </Badge>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AlertsTab() {
  const alerts = [
    { 
      type: 'info',
      title: 'Halftime in 15 minutes',
      message: 'Expect increased crowd at concessions. Plan ahead!',
      time: '2 min ago'
    },
    { 
      type: 'warning',
      title: 'Gate C Crowded',
      message: 'Consider using Gate D for exit after the event.',
      time: '5 min ago'
    },
    { 
      type: 'info',
      title: 'Weather Update',
      message: 'Clear skies expected throughout the event.',
      time: '20 min ago'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Live Alerts</h2>
        <p className="text-muted-foreground text-sm">Stay informed during the event</p>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <Card key={index} className={`border-l-4 ${
            alert.type === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Announcements Enabled</p>
              <p className="text-sm text-muted-foreground">You will receive important alerts during the event</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EventInfoTab({ event }: { event: SportEvent }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" />
            Live Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">{event.name}</h2>
          <p className="text-muted-foreground mb-4">{event.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Venue</p>
              <p className="font-medium">{event.venue}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Capacity</p>
              <p className="font-medium">{event.capacity.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat with AI Assistant
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="w-4 h-4 mr-2" />
            Find Staff Member
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Emergency
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
