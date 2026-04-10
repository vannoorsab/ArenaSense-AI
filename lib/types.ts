// Core types for the Smart Stadium System

export interface Location {
  x: number;
  y: number;
  zone: string;
}

export interface CrowdData {
  zone: string;
  density: number; // 0-100
  capacity: number;
  currentCount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  timestamp: number;
}

export interface Queue {
  id: string;
  zone: string;
  facilityName: string;
  estimatedWaitTime: number; // minutes
  people: number;
  capacity: number;
  trend: 'growing' | 'shrinking' | 'stable';
}

export interface AnomalyAlert {
  id: string;
  type: 'overcrowding' | 'panic_movement' | 'bottleneck' | 'facility_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  message: string;
  timestamp: number;
  affectedPeople: number;
  recommendedAction: string;
  escalated: boolean;
}

export interface PredictionData {
  zone: string;
  timeToImpact: number; // minutes
  predictedDensity: number; // 0-100
  confidence: number; // 0-100
  trend: string;
  timestamp: number;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  zones: string[];
  safetyScore: number; // 0-100, how safe/uncrowded
  estimatedTime: number; // minutes
  capacity: number;
  currentCrowding: number;
}

export interface User {
  id: string;
  currentZone: string;
  location: Location;
  preferences: {
    avoidCrowds: boolean;
    preferQuickestRoute: boolean;
    accessibility: boolean;
  };
  groupId?: string;
}

export interface AIRecommendation {
  type: 'navigation' | 'queue' | 'safety' | 'facility';
  title: string;
  description: string;
  action: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  context: Record<string, any>;
  timestamp: number;
}

export interface AdminAlert {
  id: string;
  type: 'anomaly' | 'prediction' | 'emergency' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  affectedZones: string[];
  affectedPeople: number;
  recommendedActions: string[];
  timestamp: number;
  acknowledged: boolean;
}

export interface SystemMetrics {
  totalAttendees: number;
  averageDensity: number;
  criticalZones: string[];
  activePredictions: number;
  emergencyStatus: 'normal' | 'alert' | 'critical';
  lastUpdate: number;
}

export interface VenueZone {
  id: string;
  name: string;
  type: 'entrance' | 'seating' | 'concourse' | 'facility' | 'exit' | 'vip';
  capacity: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  facilities?: string[];
  connectedZones: string[];
}

export interface VenueLayout {
  name: string;
  totalCapacity: number;
  zones: VenueZone[];
  exitCount: number;
  emergencyMeetingPoints: Location[];
}

// Event & Authentication Types
export interface SportEvent {
  id: string;
  name: string;
  sport: 'football' | 'basketball' | 'cricket' | 'tennis' | 'concert' | 'other';
  date: string;
  time: string;
  venue: string;
  venueLayoutId: string;
  description: string;
  imageUrl: string;
  capacity: number;
  registeredCount: number;
  status: 'upcoming' | 'live' | 'completed';
  gates: string[];
  ticketTypes: TicketType[];
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  section: string;
  available: number;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
  registeredEvents: string[];
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  ticketType: string;
  section: string;
  seat?: string;
  gate: string;
  qrCode: string;
  purchaseDate: string;
  status: 'valid' | 'used' | 'expired' | 'cancelled';
}

export interface RegistrationResult {
  success: boolean;
  ticket?: Ticket;
  message: string;
}
