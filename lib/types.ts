export interface VenueZone {
  id: string;
  name: string;
  type: string;
  capacity: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  connectedZones: string[];
  facilities?: string[];
}

export interface CrowdData {
  zone: string;
  currentCount: number;
  density: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  timestamp: number;
}

export interface PredictionData {
  zone: string;
  predictedDensity: number;
  timeToImpact: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnomalyAlert {
  id: string;
  type: 'overcrowding' | 'bottleneck' | 'panic_movement' | 'equipment_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  message: string;
  timestamp: number;
  affectedPeople: number;
  recommendedAction: string;
  escalated: boolean;
}

export interface AIRecommendation {
  type: 'navigation' | 'facility' | 'safety' | 'queue';
  title: string;
  description: string;
  action: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  context: any;
  timestamp: number;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  zones: string[];
  safetyScore: number;
  estimatedTime: number;
  capacity: number;
  currentCrowding: number;
}

export interface User {
  id: string;
  currentZone: string;
  location: { x: number; y: number; zone: string };
  preferences: {
    avoidCrowds: boolean;
    preferQuickestRoute: boolean;
    accessibility: boolean;
  };
}

export interface SportEvent {
  id: string;
  name: string;
  sport: 'football' | 'basketball' | 'cricket' | 'tennis' | 'concert' | 'other';
  date: string;
  time: string;
  venue: string;
  registeredCount: number;
  status: 'upcoming' | 'live' | 'completed';
}

export interface AdminAlert {
  id: string;
  type: 'emergency' | 'system' | 'operational';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  affectedZones: string[];
  affectedPeople: number;
  recommendedActions: string[];
  timestamp: number;
  acknowledged: boolean;
}

export interface Queue {
  id: string;
  facilityName: string;
  zone: string;
  people: number;
  estimatedWaitTime: number; // minutes
  status: 'low' | 'medium' | 'high';
}

export interface SystemMetrics {
  totalAttendees: number;
  averageDensity: number;
  criticalZones: string[];
  activePredictions: number;
  emergencyStatus: 'normal' | 'alert' | 'critical';
  lastUpdate: number;
}
