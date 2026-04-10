'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Navigation,
  AlertTriangle,
  BarChart3,
  Activity,
  Zap,
  MapPin,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const interfaces = [
    {
      name: 'Attendee Navigator',
      description: 'Real-time crowd heatmap, AI-powered navigation recommendations, and personalized alerts',
      icon: Users,
      href: '/',
      color: 'bg-blue-50 border-blue-200',
      button: 'Access as Attendee',
    },
    {
      name: 'Admin Command Center',
      description: 'Real-time crowd monitoring, predictive analytics, emergency controls, and broadcast system',
      icon: BarChart3,
      href: '/admin',
      color: 'bg-purple-50 border-purple-200',
      button: 'Access Admin Panel',
    },
    {
      name: 'Emergency Response',
      description: 'Emergency evacuation routes, panic detection, safety-optimized pathways, and real-time guidance',
      icon: AlertTriangle,
      href: '/emergency',
      color: 'bg-red-50 border-red-200',
      button: 'Open Emergency',
    },
    {
      name: 'Scenario Testing',
      description: 'Test system behavior under entry rush, halftime, and exit scenarios with full metrics',
      icon: Activity,
      href: '/scenario-testing',
      color: 'bg-green-50 border-green-200',
      button: 'Run Scenarios',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Central AI Decision Engine',
      description: 'Unified AI layer combining crowd data, predictions, and user context for intelligent recommendations',
    },
    {
      icon: AlertTriangle,
      title: 'Emergency Intelligence System',
      description: 'Detects abnormal behavior, triggers dynamic evacuation routes, and escalates alerts intelligently',
    },
    {
      icon: MapPin,
      title: 'Predictive Intelligence',
      description: 'Forecasts crowd buildup 30+ minutes ahead with proactive alerts before issues occur',
    },
    {
      icon: Navigation,
      title: 'Proactive Alert System',
      description: 'Context-aware notifications that prevent issues before they happen based on location and density',
    },
    {
      icon: Users,
      title: 'Real-Time Crowd Analytics',
      description: 'Live heatmaps, density tracking, and trend analysis across all venue zones',
    },
    {
      icon: Activity,
      title: 'Scenario Simulation Mode',
      description: 'Test entry rush, halftime congestion, and exit surges with comprehensive decision logging',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">MetroStadium AI Intelligence System</h1>
          <p className="text-lg text-muted-foreground">
            Diamond-Grade Smart Stadium Platform with Advanced AI-Driven Decision Making
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Interfaces */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">System Interfaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interfaces.map((iface) => {
              const Icon = iface.icon;
              return (
                <Card key={iface.name} className={`${iface.color} border`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          {iface.name}
                        </CardTitle>
                        <CardDescription className="mt-2">{iface.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={iface.href}>
                      <Button className="w-full">{iface.button}</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Features Showcase */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Advanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* System Capabilities */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>System Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Attendee Experience</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Real-time interactive heatmap with live density visualization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>AI-powered navigation with crowd-aware routing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Proactive alerts before crowds form</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Queue recommendations and wait time estimates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Emergency evacuation guidance</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Admin Control</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Live crowd density monitoring across all zones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Predictive analytics with 30+ minute forecasts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Real-time anomaly detection and escalation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Emergency response protocols and evacuation routes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>System-wide broadcast announcements</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Safety Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Panic movement detection across multiple zones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Safety-optimized evacuation route calculation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Dynamic route updates based on real-time conditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Assembly point recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Evacuation time estimation by zone</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">AI Intelligence</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Context-aware recommendation engine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>User preference learning and personalization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Crowd behavior analysis and trend detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Predictive crowd buildup detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Intelligent decision escalation protocols</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Getting Started */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The MetroStadium AI Intelligence System provides three main interfaces for different use cases:
                </p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">1</span>
                    <span>
                      <strong>Attendees:</strong> Use the Navigator to view real-time crowd data, get personalized
                      recommendations, and navigate safely during events.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">2</span>
                    <span>
                      <strong>Administrators:</strong> Monitor the entire venue in real-time, receive predictive alerts,
                      and manage emergency situations from the Admin Command Center.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">3</span>
                    <span>
                      <strong>Testing:</strong> Run scenario simulations to validate system behavior under various crowd
                      conditions before live events.
                    </span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MetroStadium AI Intelligence System • Diamond-Grade Implementation with Advanced Safety Features</p>
        </div>
      </footer>
    </div>
  );
}
