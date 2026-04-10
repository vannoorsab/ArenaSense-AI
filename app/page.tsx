'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Navigation, 
  Users,
  QrCode,
  Brain,
  MapPin,
  Clock,
  ChevronRight,
  Play,
  DoorOpen,
  Activity,
  Wifi,
} from 'lucide-react';
import LiveAlertBanner from '@/components/live-alert-banner';
import { EVENTS, formatEventDate } from '@/lib/events-data';
import { CSK_MATCHES, formatMatchDate, formatMatchTime } from '@/lib/csk-matches';

export default function Home() {
  const featuredEvents = EVENTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Live Alert Banner (admin broadcasts appear here) */}
      <LiveAlertBanner />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AS</span>
            </div>
            <span className="font-bold text-lg">ArenaSense AI</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link href="/csk" className="text-sm font-medium text-yellow-600 hover:text-yellow-500 transition-colors flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-black text-blue-900">CSK</span>
              IPL 2026
            </Link>
            <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Events
            </Link>
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            <Link href="/stadium-live">
              <Button size="sm" className="gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Live Stadium
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* CSK Featured Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#003B7B] via-[#002855] to-[#003B7B]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGREI5MTMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 py-6 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FDB913] flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <span className="text-[#003B7B] font-black text-sm">CSK</span>
              </div>
              <div>
                <p className="text-[#FDB913] text-xs font-semibold">IPL 2026 LIVE</p>
                <h2 className="text-white font-bold text-lg">Chennai Super Kings Matches</h2>
                <p className="text-blue-200 text-sm">{CSK_MATCHES.length} matches with AI-powered stadium experience</p>
              </div>
            </div>
            <Link href="/csk">
              <Button className="bg-[#FDB913] hover:bg-yellow-400 text-[#003B7B] font-bold gap-2">
                View CSK Matches
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4">
              <Brain className="w-3 h-3 mr-1" />
              AI-Powered Stadium Intelligence
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              The Smartest Way to Experience Live Events
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl">
              Navigate stadiums with AI-powered crowd intelligence, real-time heatmaps, 
              predictive alerts, and personalized recommendations. Never miss a moment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/stadium-live">
                <Button size="lg" className="gap-2">
                  <Activity className="w-4 h-4" />
                  View Live Stadium
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/csk">
                <Button size="lg" className="gap-2 bg-[#FDB913] hover:bg-yellow-400 text-[#003B7B]">
                  CSK IPL 2026
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="gap-2">
                  Browse Events
                </Button>
              </Link>
              <Link href="/scenario-testing">
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="w-4 h-4" />
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Intelligent Stadium Experience</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered system transforms how you experience live events with cutting-edge technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Navigation,
                title: 'Smart Navigation',
                description: 'AI-optimized routes that avoid crowds and get you where you need to go faster.',
              },
              {
                icon: DoorOpen,
                title: 'Gate Management',
                description: 'Real-time gate density tracking with Green/Yellow/Red status and smart redirect suggestions.',
              },
              {
                icon: Wifi,
                title: 'Instant Alerts',
                description: 'Admin broadcasts reach you instantly — gate congestion, emergencies, and guidance.',
              },
              {
                icon: Brain,
                title: 'Cloud AI Vision',
                description: 'Google Cloud Vision AI analyzes crowd feeds and detects anomalies automatically.',
              },
            ].map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Flow Section */}
      <section className="py-20 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From discovering events to experiencing the stadium - your complete journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Browse Events',
                description: 'Discover upcoming sports and entertainment events at ArenaSense AI.',
                href: '/events',
              },
              {
                step: '02',
                title: 'Direct Entry — No Sign-up',
                description: 'Access the stadium system instantly. No login required — fast and frictionless.',
                href: '/stadium-live',
              },
              {
                step: '03',
                title: 'Gate Guidance',
                description: 'AI tells you which gate has the lowest crowd. Save time, avoid queues.',
                href: '/admin',
              },
              {
                step: '04',
                title: 'Live Experience',
                description: 'Navigate with AI, avoid crowds, get instant admin alerts, and enjoy your event.',
                href: '/scenario-testing',
              },
            ].map((item, index) => (
              <Link href={item.href} key={index}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary/20 mb-4">{item.step}</div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Learn more <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Don&apos;t miss these exciting events</p>
            </div>
            <Link href="/events">
              <Button variant="outline">
                View All Events
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Badge variant="outline" className="bg-background/80">{event.sport}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="font-bold">From ${Math.min(...event.ticketTypes.map(t => t.price))}</span>
                      <Button size="sm">Register</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* QR Entry Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <QrCode className="w-3 h-3 mr-1" />
                Secure Entry System
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Seamless QR Code Entry
              </h2>
              <p className="text-muted-foreground mb-6">
                Your digital ticket includes a unique QR code that grants you instant access 
                at your assigned gate. No paper tickets, no waiting in line for validation.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Unique QR code for each ticket',
                  'Instant validation at entry gates',
                  'Assigned gate and seating information',
                  'Digital ticket download option',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/events">
                <Button>Get Your Ticket</Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <Card className="w-72 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-40 h-40 mx-auto mb-4 bg-gradient-to-br from-foreground to-foreground/80 rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-background" />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mb-4">
                    STADIUM-EVT001-USR-TKT123
                  </p>
                  <Badge>Valid Ticket</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Smarter Events?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            No account required. Jump straight into the stadium experience — real-time gates, AI alerts, and live crowd data.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/stadium-live">
              <Button size="lg" className="gap-2">
                <Activity className="w-4 h-4" />
                View Live Stadium
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline">Admin Dashboard</Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline">Browse Events</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AS</span>
              </div>
              <span className="text-sm text-muted-foreground">ArenaSense AI - Smart Stadium Platform</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
              <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
              <Link href="/scenario-testing" className="hover:text-foreground transition-colors">Demo</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
