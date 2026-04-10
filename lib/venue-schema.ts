import { VenueLayout, VenueZone } from './types';

export const DEFAULT_VENUE: VenueLayout = {
  name: 'Metropolitan Stadium',
  totalCapacity: 75000,
  exitCount: 12,
  emergencyMeetingPoints: [
    { x: 10, y: 10, zone: 'North Parking' },
    { x: 90, y: 10, zone: 'East Field' },
    { x: 10, y: 90, zone: 'South Parking' },
    { x: 90, y: 90, zone: 'West Plaza' },
  ],
  zones: [
    // Entrances
    {
      id: 'entrance-main',
      name: 'Main Entrance',
      type: 'entrance',
      capacity: 15000,
      x1: 40,
      y1: 0,
      x2: 60,
      y2: 5,
      connectedZones: ['concourse-north', 'seating-lower-north'],
      facilities: [],
    },
    {
      id: 'entrance-vip',
      name: 'VIP Entrance',
      type: 'entrance',
      capacity: 500,
      x1: 85,
      y1: 45,
      x2: 100,
      y2: 55,
      connectedZones: ['seating-vip'],
      facilities: [],
    },

    // Concourse areas
    {
      id: 'concourse-north',
      name: 'North Concourse',
      type: 'concourse',
      capacity: 12000,
      x1: 30,
      y1: 5,
      x2: 70,
      y2: 20,
      facilities: ['restrooms-north', 'concessions-north', 'info-north'],
      connectedZones: [
        'entrance-main',
        'seating-lower-north',
        'seating-upper-north',
        'concourse-east',
        'concourse-west',
      ],
    },
    {
      id: 'concourse-east',
      name: 'East Concourse',
      type: 'concourse',
      capacity: 10000,
      x1: 70,
      y1: 30,
      x2: 95,
      y2: 70,
      facilities: ['restrooms-east', 'concessions-east', 'merchandise-east'],
      connectedZones: [
        'concourse-north',
        'concourse-south',
        'seating-lower-east',
        'seating-upper-east',
      ],
    },
    {
      id: 'concourse-south',
      name: 'South Concourse',
      type: 'concourse',
      capacity: 12000,
      x1: 30,
      y1: 80,
      x2: 70,
      y2: 95,
      facilities: ['restrooms-south', 'concessions-south', 'info-south'],
      connectedZones: [
        'concourse-east',
        'concourse-west',
        'seating-lower-south',
        'seating-upper-south',
        'exit-south',
      ],
    },
    {
      id: 'concourse-west',
      name: 'West Concourse',
      type: 'concourse',
      capacity: 10000,
      x1: 5,
      y1: 30,
      x2: 30,
      y2: 70,
      facilities: ['restrooms-west', 'concessions-west', 'medical-west'],
      connectedZones: [
        'concourse-north',
        'concourse-south',
        'seating-lower-west',
        'seating-upper-west',
      ],
    },

    // Seating areas (lower level)
    {
      id: 'seating-lower-north',
      name: 'Lower North Seating',
      type: 'seating',
      capacity: 8000,
      x1: 35,
      y1: 20,
      x2: 65,
      y2: 35,
      connectedZones: ['concourse-north', 'seating-upper-north'],
      facilities: [],
    },
    {
      id: 'seating-lower-east',
      name: 'Lower East Seating',
      type: 'seating',
      capacity: 7500,
      x1: 65,
      y1: 25,
      x2: 80,
      y2: 75,
      connectedZones: ['concourse-east', 'seating-upper-east'],
      facilities: [],
    },
    {
      id: 'seating-lower-south',
      name: 'Lower South Seating',
      type: 'seating',
      capacity: 8000,
      x1: 35,
      y1: 65,
      x2: 65,
      y2: 80,
      connectedZones: ['concourse-south', 'seating-upper-south'],
      facilities: [],
    },
    {
      id: 'seating-lower-west',
      name: 'Lower West Seating',
      type: 'seating',
      capacity: 7500,
      x1: 20,
      y1: 25,
      x2: 35,
      y2: 75,
      connectedZones: ['concourse-west', 'seating-upper-west'],
      facilities: [],
    },

    // Seating areas (upper level)
    {
      id: 'seating-upper-north',
      name: 'Upper North Seating',
      type: 'seating',
      capacity: 6000,
      x1: 40,
      y1: 15,
      x2: 60,
      y2: 25,
      connectedZones: ['concourse-north', 'seating-lower-north'],
      facilities: [],
    },
    {
      id: 'seating-upper-east',
      name: 'Upper East Seating',
      type: 'seating',
      capacity: 5500,
      x1: 75,
      y1: 20,
      x2: 88,
      y2: 80,
      connectedZones: ['concourse-east', 'seating-lower-east'],
      facilities: [],
    },
    {
      id: 'seating-upper-south',
      name: 'Upper South Seating',
      type: 'seating',
      capacity: 6000,
      x1: 40,
      y1: 75,
      x2: 60,
      y2: 85,
      connectedZones: ['concourse-south', 'seating-lower-south'],
      facilities: [],
    },
    {
      id: 'seating-upper-west',
      name: 'Upper West Seating',
      type: 'seating',
      capacity: 5500,
      x1: 12,
      y1: 20,
      x2: 25,
      y2: 80,
      connectedZones: ['concourse-west', 'seating-lower-west'],
      facilities: [],
    },

    // VIP area
    {
      id: 'seating-vip',
      name: 'VIP Seating',
      type: 'vip',
      capacity: 500,
      x1: 85,
      y1: 40,
      x2: 100,
      y2: 60,
      facilities: ['vip-lounge', 'premium-concessions'],
      connectedZones: ['entrance-vip', 'concourse-east'],
    },

    // Facilities
    {
      id: 'facility-medical',
      name: 'Medical Center',
      type: 'facility',
      capacity: 100,
      x1: 5,
      y1: 45,
      x2: 15,
      y2: 55,
      connectedZones: ['concourse-west'],
      facilities: [],
    },

    // Exits
    {
      id: 'exit-north',
      name: 'North Exit',
      type: 'exit',
      capacity: 5000,
      x1: 45,
      y1: 0,
      x2: 55,
      y2: 3,
      connectedZones: ['concourse-north'],
      facilities: [],
    },
    {
      id: 'exit-east',
      name: 'East Exit',
      type: 'exit',
      capacity: 5000,
      x1: 97,
      y1: 40,
      x2: 100,
      y2: 60,
      connectedZones: ['concourse-east'],
      facilities: [],
    },
    {
      id: 'exit-south',
      name: 'South Exit',
      type: 'exit',
      capacity: 5000,
      x1: 45,
      y1: 97,
      x2: 55,
      y2: 100,
      connectedZones: ['concourse-south'],
      facilities: [],
    },
    {
      id: 'exit-west',
      name: 'West Exit',
      type: 'exit',
      capacity: 5000,
      x1: 0,
      y1: 40,
      x2: 3,
      y2: 60,
      connectedZones: ['concourse-west'],
      facilities: [],
    },
  ],
};

export function getZoneById(venueId: string, zoneId: string): VenueZone | undefined {
  return DEFAULT_VENUE.zones.find((z) => z.id === zoneId);
}

export function getNearbyZones(venueId: string, zoneId: string, maxDistance: number = 2): VenueZone[] {
  const zone = getZoneById(venueId, zoneId);
  if (!zone) return [];

  const nearbyZones: VenueZone[] = [];
  const visited = new Set<string>();
  const queue = [{ zone, distance: 0 }];

  while (queue.length > 0) {
    const { zone: currentZone, distance } = queue.shift()!;
    if (visited.has(currentZone.id) || distance > maxDistance) continue;

    visited.add(currentZone.id);
    if (distance > 0) nearbyZones.push(currentZone);

    for (const connectedId of currentZone.connectedZones) {
      const connectedZone = getZoneById(venueId, connectedId);
      if (connectedZone && !visited.has(connectedId)) {
        queue.push({ zone: connectedZone, distance: distance + 1 });
      }
    }
  }

  return nearbyZones;
}

export function findShortestRoute(
  venueId: string,
  startZoneId: string,
  endZoneId: string
): string[] {
  if (startZoneId === endZoneId) return [startZoneId];

  const visited = new Set<string>();
  const queue: { zoneId: string; path: string[] }[] = [{ zoneId: startZoneId, path: [startZoneId] }];

  while (queue.length > 0) {
    const { zoneId, path } = queue.shift()!;
    if (visited.has(zoneId)) continue;
    visited.add(zoneId);

    const zone = getZoneById(venueId, zoneId);
    if (!zone) continue;

    for (const connectedId of zone.connectedZones) {
      if (connectedId === endZoneId) {
        return [...path, endZoneId];
      }
      if (!visited.has(connectedId)) {
        queue.push({ zoneId: connectedId, path: [...path, connectedId] });
      }
    }
  }

  return [startZoneId]; // Fallback if no route found
}
