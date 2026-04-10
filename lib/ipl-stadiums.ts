import { VenueLayout } from './types';

// IPL Stadium Layouts for CSK matches
export type MatchPhase = 'pre-match' | 'live' | 'innings-break' | 'post-match';

export interface IPLStadium {
  id: string;
  name: string;
  city: string;
  capacity: number;
  layout: VenueLayout;
  imageGradient: string;
  gates: string[];
  facilities: string[];
}

// M.A. Chidambaram Stadium (Chepauk) - CSK Home Ground
export const CHEPAUK_STADIUM: IPLStadium = {
  id: 'chepauk',
  name: 'M.A. Chidambaram Stadium',
  city: 'Chennai',
  capacity: 50000,
  imageGradient: 'from-yellow-500 via-yellow-600 to-yellow-700',
  gates: ['Anna Pavilion Gate', 'V. Pattabhiraman Gate', 'I Stand Gate', 'J Stand Gate', 'North Gate'],
  facilities: ['Food Courts', 'Restrooms', 'First Aid', 'Fan Merchandise', 'Water Stations'],
  layout: {
    name: 'M.A. Chidambaram Stadium',
    totalCapacity: 50000,
    exitCount: 8,
    emergencyMeetingPoints: [
      { x: 10, y: 10, zone: 'Marina Beach Side' },
      { x: 90, y: 10, zone: 'Wallajah Road' },
      { x: 10, y: 90, zone: 'Victoria Hostel' },
      { x: 90, y: 90, zone: 'Island Ground' },
    ],
    zones: [
      // Stands
      { id: 'anna-pavilion', name: 'Anna Pavilion', type: 'seating', capacity: 8000, x1: 35, y1: 5, x2: 65, y2: 20, connectedZones: ['north-concourse', 'i-stand'], facilities: [] },
      { id: 'i-stand', name: 'I Stand', type: 'seating', capacity: 6000, x1: 70, y1: 15, x2: 90, y2: 40, connectedZones: ['anna-pavilion', 'j-stand', 'east-concourse'], facilities: [] },
      { id: 'j-stand', name: 'J Stand', type: 'seating', capacity: 6000, x1: 70, y1: 45, x2: 90, y2: 70, connectedZones: ['i-stand', 'k-stand', 'east-concourse'], facilities: [] },
      { id: 'k-stand', name: 'K Stand', type: 'seating', capacity: 5000, x1: 70, y1: 75, x2: 90, y2: 95, connectedZones: ['j-stand', 'south-concourse'], facilities: [] },
      { id: 'l-stand', name: 'L Stand', type: 'seating', capacity: 5000, x1: 35, y1: 80, x2: 65, y2: 95, connectedZones: ['k-stand', 'm-stand', 'south-concourse'], facilities: [] },
      { id: 'm-stand', name: 'M Stand', type: 'seating', capacity: 5000, x1: 10, y1: 75, x2: 30, y2: 95, connectedZones: ['l-stand', 'n-stand', 'west-concourse'], facilities: [] },
      { id: 'n-stand', name: 'N Stand', type: 'seating', capacity: 5000, x1: 10, y1: 45, x2: 30, y2: 70, connectedZones: ['m-stand', 'o-stand', 'west-concourse'], facilities: [] },
      { id: 'o-stand', name: 'O Stand', type: 'seating', capacity: 5000, x1: 10, y1: 15, x2: 30, y2: 40, connectedZones: ['n-stand', 'anna-pavilion', 'north-concourse'], facilities: [] },
      // VIP
      { id: 'vip-box', name: 'Corporate Box', type: 'vip', capacity: 500, x1: 40, y1: 40, x2: 60, y2: 60, connectedZones: ['north-concourse'], facilities: ['vip-lounge', 'premium-dining'] },
      // Concourses
      { id: 'north-concourse', name: 'North Concourse', type: 'concourse', capacity: 8000, x1: 30, y1: 0, x2: 70, y2: 8, connectedZones: ['anna-pavilion', 'o-stand', 'east-concourse', 'west-concourse'], facilities: ['food-north', 'restrooms-north'] },
      { id: 'east-concourse', name: 'East Concourse', type: 'concourse', capacity: 6000, x1: 88, y1: 20, x2: 100, y2: 80, connectedZones: ['i-stand', 'j-stand', 'north-concourse', 'south-concourse'], facilities: ['food-east', 'restrooms-east', 'merch-east'] },
      { id: 'south-concourse', name: 'South Concourse', type: 'concourse', capacity: 8000, x1: 30, y1: 92, x2: 70, y2: 100, connectedZones: ['k-stand', 'l-stand', 'm-stand', 'east-concourse', 'west-concourse'], facilities: ['food-south', 'restrooms-south'] },
      { id: 'west-concourse', name: 'West Concourse', type: 'concourse', capacity: 6000, x1: 0, y1: 20, x2: 12, y2: 80, connectedZones: ['m-stand', 'n-stand', 'o-stand', 'north-concourse', 'south-concourse'], facilities: ['food-west', 'restrooms-west', 'first-aid'] },
      // Entrances
      { id: 'entrance-anna', name: 'Anna Pavilion Gate', type: 'entrance', capacity: 3000, x1: 45, y1: 0, x2: 55, y2: 5, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'entrance-east', name: 'V. Pattabhiraman Gate', type: 'entrance', capacity: 2500, x1: 95, y1: 45, x2: 100, y2: 55, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'entrance-south', name: 'South Gate', type: 'entrance', capacity: 2500, x1: 45, y1: 95, x2: 55, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
      { id: 'entrance-west', name: 'West Gate', type: 'entrance', capacity: 2000, x1: 0, y1: 45, x2: 5, y2: 55, connectedZones: ['west-concourse'], facilities: [] },
      // Exits
      { id: 'exit-north', name: 'North Exit', type: 'exit', capacity: 4000, x1: 48, y1: 0, x2: 52, y2: 3, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'exit-east', name: 'East Exit', type: 'exit', capacity: 3000, x1: 97, y1: 48, x2: 100, y2: 52, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'exit-south', name: 'South Exit', type: 'exit', capacity: 4000, x1: 48, y1: 97, x2: 52, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
      { id: 'exit-west', name: 'West Exit', type: 'exit', capacity: 3000, x1: 0, y1: 48, x2: 3, y2: 52, connectedZones: ['west-concourse'], facilities: [] },
    ],
  },
};

// Wankhede Stadium - Mumbai Indians Home
export const WANKHEDE_STADIUM: IPLStadium = {
  id: 'wankhede',
  name: 'Wankhede Stadium',
  city: 'Mumbai',
  capacity: 33000,
  imageGradient: 'from-blue-500 via-blue-600 to-blue-700',
  gates: ['Sachin Gate', 'Sunil Gavaskar Gate', 'North Stand Gate', 'MCA Pavilion Gate'],
  facilities: ['Food Plaza', 'Restrooms', 'Medical Center', 'Fan Store', 'Water Points'],
  layout: {
    name: 'Wankhede Stadium',
    totalCapacity: 33000,
    exitCount: 6,
    emergencyMeetingPoints: [
      { x: 50, y: 5, zone: 'D Road' },
      { x: 95, y: 50, zone: 'Marine Drive' },
      { x: 50, y: 95, zone: 'Churchgate' },
    ],
    zones: [
      { id: 'north-stand', name: 'North Stand', type: 'seating', capacity: 5000, x1: 30, y1: 5, x2: 70, y2: 25, connectedZones: ['north-concourse', 'east-stand'], facilities: [] },
      { id: 'east-stand', name: 'East Stand', type: 'seating', capacity: 6000, x1: 70, y1: 20, x2: 95, y2: 50, connectedZones: ['north-stand', 'south-stand', 'east-concourse'], facilities: [] },
      { id: 'south-stand', name: 'South Stand', type: 'seating', capacity: 5000, x1: 30, y1: 75, x2: 70, y2: 95, connectedZones: ['east-stand', 'west-stand', 'south-concourse'], facilities: [] },
      { id: 'west-stand', name: 'West Stand', type: 'seating', capacity: 6000, x1: 5, y1: 50, x2: 30, y2: 80, connectedZones: ['south-stand', 'north-stand', 'west-concourse'], facilities: [] },
      { id: 'mca-pavilion', name: 'MCA Pavilion', type: 'vip', capacity: 800, x1: 5, y1: 20, x2: 30, y2: 45, connectedZones: ['north-concourse', 'west-concourse'], facilities: ['vip-lounge'] },
      { id: 'garware-pavilion', name: 'Garware Pavilion', type: 'vip', capacity: 500, x1: 40, y1: 40, x2: 60, y2: 60, connectedZones: ['north-concourse'], facilities: ['corporate-boxes'] },
      { id: 'north-concourse', name: 'North Concourse', type: 'concourse', capacity: 4000, x1: 25, y1: 0, x2: 75, y2: 8, connectedZones: ['north-stand', 'mca-pavilion', 'east-concourse', 'west-concourse'], facilities: ['food-north', 'restrooms-north'] },
      { id: 'east-concourse', name: 'East Concourse', type: 'concourse', capacity: 3000, x1: 92, y1: 15, x2: 100, y2: 85, connectedZones: ['east-stand', 'north-concourse', 'south-concourse'], facilities: ['food-east', 'restrooms-east'] },
      { id: 'south-concourse', name: 'South Concourse', type: 'concourse', capacity: 4000, x1: 25, y1: 92, x2: 75, y2: 100, connectedZones: ['south-stand', 'east-concourse', 'west-concourse'], facilities: ['food-south', 'restrooms-south'] },
      { id: 'west-concourse', name: 'West Concourse', type: 'concourse', capacity: 3000, x1: 0, y1: 15, x2: 8, y2: 85, connectedZones: ['west-stand', 'mca-pavilion', 'north-concourse', 'south-concourse'], facilities: ['food-west', 'first-aid'] },
      { id: 'entrance-sachin', name: 'Sachin Gate', type: 'entrance', capacity: 3000, x1: 45, y1: 0, x2: 55, y2: 5, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'entrance-east', name: 'East Gate', type: 'entrance', capacity: 2000, x1: 95, y1: 45, x2: 100, y2: 55, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'entrance-south', name: 'South Gate', type: 'entrance', capacity: 2500, x1: 45, y1: 95, x2: 55, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
      { id: 'exit-north', name: 'North Exit', type: 'exit', capacity: 3000, x1: 48, y1: 0, x2: 52, y2: 3, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'exit-east', name: 'East Exit', type: 'exit', capacity: 2500, x1: 97, y1: 48, x2: 100, y2: 52, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'exit-south', name: 'South Exit', type: 'exit', capacity: 3000, x1: 48, y1: 97, x2: 52, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
    ],
  },
};

// M. Chinnaswamy Stadium - RCB Home
export const CHINNASWAMY_STADIUM: IPLStadium = {
  id: 'chinnaswamy',
  name: 'M. Chinnaswamy Stadium',
  city: 'Bengaluru',
  capacity: 40000,
  imageGradient: 'from-red-500 via-red-600 to-red-700',
  gates: ['KSCA Gate', 'MG Road Gate', 'Cubbon Park Gate', 'Queens Road Gate'],
  facilities: ['Food Zone', 'Restrooms', 'First Aid', 'RCB Fan Shop', 'Hydration Stations'],
  layout: {
    name: 'M. Chinnaswamy Stadium',
    totalCapacity: 40000,
    exitCount: 6,
    emergencyMeetingPoints: [
      { x: 50, y: 5, zone: 'MG Road' },
      { x: 95, y: 50, zone: 'Cubbon Park' },
      { x: 50, y: 95, zone: 'Queens Road' },
    ],
    zones: [
      { id: 'p-stand', name: 'P Stand', type: 'seating', capacity: 6000, x1: 30, y1: 5, x2: 70, y2: 22, connectedZones: ['north-concourse', 'q-stand'], facilities: [] },
      { id: 'q-stand', name: 'Q Stand', type: 'seating', capacity: 5500, x1: 70, y1: 18, x2: 92, y2: 45, connectedZones: ['p-stand', 'r-stand', 'east-concourse'], facilities: [] },
      { id: 'r-stand', name: 'R Stand', type: 'seating', capacity: 5500, x1: 70, y1: 55, x2: 92, y2: 82, connectedZones: ['q-stand', 's-stand', 'east-concourse'], facilities: [] },
      { id: 's-stand', name: 'S Stand', type: 'seating', capacity: 6000, x1: 30, y1: 78, x2: 70, y2: 95, connectedZones: ['r-stand', 't-stand', 'south-concourse'], facilities: [] },
      { id: 't-stand', name: 'T Stand', type: 'seating', capacity: 5000, x1: 8, y1: 55, x2: 30, y2: 82, connectedZones: ['s-stand', 'u-stand', 'west-concourse'], facilities: [] },
      { id: 'u-stand', name: 'U Stand', type: 'seating', capacity: 5000, x1: 8, y1: 18, x2: 30, y2: 45, connectedZones: ['t-stand', 'p-stand', 'west-concourse'], facilities: [] },
      { id: 'ksca-pavilion', name: 'KSCA Pavilion', type: 'vip', capacity: 700, x1: 38, y1: 38, x2: 62, y2: 62, connectedZones: ['north-concourse'], facilities: ['vip-lounge', 'premium-dining'] },
      { id: 'north-concourse', name: 'North Concourse', type: 'concourse', capacity: 5000, x1: 25, y1: 0, x2: 75, y2: 8, connectedZones: ['p-stand', 'u-stand', 'east-concourse', 'west-concourse'], facilities: ['food-north', 'restrooms-north'] },
      { id: 'east-concourse', name: 'East Concourse', type: 'concourse', capacity: 4000, x1: 90, y1: 15, x2: 100, y2: 85, connectedZones: ['q-stand', 'r-stand', 'north-concourse', 'south-concourse'], facilities: ['food-east', 'restrooms-east', 'merch'] },
      { id: 'south-concourse', name: 'South Concourse', type: 'concourse', capacity: 5000, x1: 25, y1: 92, x2: 75, y2: 100, connectedZones: ['s-stand', 'east-concourse', 'west-concourse'], facilities: ['food-south', 'restrooms-south'] },
      { id: 'west-concourse', name: 'West Concourse', type: 'concourse', capacity: 4000, x1: 0, y1: 15, x2: 10, y2: 85, connectedZones: ['t-stand', 'u-stand', 'north-concourse', 'south-concourse'], facilities: ['food-west', 'first-aid'] },
      { id: 'entrance-ksca', name: 'KSCA Gate', type: 'entrance', capacity: 3000, x1: 45, y1: 0, x2: 55, y2: 5, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'entrance-mg', name: 'MG Road Gate', type: 'entrance', capacity: 2500, x1: 95, y1: 45, x2: 100, y2: 55, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'entrance-south', name: 'South Gate', type: 'entrance', capacity: 2500, x1: 45, y1: 95, x2: 55, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
      { id: 'exit-north', name: 'North Exit', type: 'exit', capacity: 3500, x1: 48, y1: 0, x2: 52, y2: 3, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'exit-east', name: 'East Exit', type: 'exit', capacity: 3000, x1: 97, y1: 48, x2: 100, y2: 52, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'exit-south', name: 'South Exit', type: 'exit', capacity: 3500, x1: 48, y1: 97, x2: 52, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
    ],
  },
};

// Eden Gardens - KKR Home
export const EDEN_GARDENS: IPLStadium = {
  id: 'eden-gardens',
  name: 'Eden Gardens',
  city: 'Kolkata',
  capacity: 66000,
  imageGradient: 'from-purple-500 via-purple-600 to-purple-700',
  gates: ['BC Roy Gate', 'Ranji Gate', 'CAB Gate', 'Club House Gate', 'B.C. Roy Club Gate'],
  facilities: ['Food Courts', 'Restrooms', 'Medical Room', 'KKR Store', 'Refreshment Zones'],
  layout: {
    name: 'Eden Gardens',
    totalCapacity: 66000,
    exitCount: 10,
    emergencyMeetingPoints: [
      { x: 50, y: 5, zone: 'B.B.D. Bagh' },
      { x: 95, y: 50, zone: 'Maidan' },
      { x: 50, y: 95, zone: 'Fort William' },
      { x: 5, y: 50, zone: 'Strand Road' },
    ],
    zones: [
      { id: 'bc-roy-gallery', name: 'B.C. Roy Gallery', type: 'seating', capacity: 10000, x1: 25, y1: 5, x2: 75, y2: 22, connectedZones: ['north-concourse', 'ranji-stand'], facilities: [] },
      { id: 'ranji-stand', name: 'Ranji Stand', type: 'seating', capacity: 8000, x1: 72, y1: 18, x2: 95, y2: 45, connectedZones: ['bc-roy-gallery', 'club-house', 'east-concourse'], facilities: [] },
      { id: 'club-house', name: 'Club House Stand', type: 'seating', capacity: 8000, x1: 72, y1: 55, x2: 95, y2: 82, connectedZones: ['ranji-stand', 'south-gallery', 'east-concourse'], facilities: [] },
      { id: 'south-gallery', name: 'South Gallery', type: 'seating', capacity: 10000, x1: 25, y1: 78, x2: 75, y2: 95, connectedZones: ['club-house', 'north-gallery', 'south-concourse'], facilities: [] },
      { id: 'north-gallery', name: 'North Gallery', type: 'seating', capacity: 8000, x1: 5, y1: 55, x2: 28, y2: 82, connectedZones: ['south-gallery', 'cab-stand', 'west-concourse'], facilities: [] },
      { id: 'cab-stand', name: 'CAB Stand', type: 'seating', capacity: 8000, x1: 5, y1: 18, x2: 28, y2: 45, connectedZones: ['north-gallery', 'bc-roy-gallery', 'west-concourse'], facilities: [] },
      { id: 'president-box', name: 'President Box', type: 'vip', capacity: 1000, x1: 35, y1: 35, x2: 65, y2: 65, connectedZones: ['north-concourse'], facilities: ['vip-lounge', 'executive-dining'] },
      { id: 'north-concourse', name: 'North Concourse', type: 'concourse', capacity: 8000, x1: 20, y1: 0, x2: 80, y2: 8, connectedZones: ['bc-roy-gallery', 'cab-stand', 'east-concourse', 'west-concourse'], facilities: ['food-north', 'restrooms-north'] },
      { id: 'east-concourse', name: 'East Concourse', type: 'concourse', capacity: 6000, x1: 92, y1: 12, x2: 100, y2: 88, connectedZones: ['ranji-stand', 'club-house', 'north-concourse', 'south-concourse'], facilities: ['food-east', 'restrooms-east', 'merch'] },
      { id: 'south-concourse', name: 'South Concourse', type: 'concourse', capacity: 8000, x1: 20, y1: 92, x2: 80, y2: 100, connectedZones: ['south-gallery', 'east-concourse', 'west-concourse'], facilities: ['food-south', 'restrooms-south'] },
      { id: 'west-concourse', name: 'West Concourse', type: 'concourse', capacity: 6000, x1: 0, y1: 12, x2: 8, y2: 88, connectedZones: ['north-gallery', 'cab-stand', 'north-concourse', 'south-concourse'], facilities: ['food-west', 'first-aid'] },
      { id: 'entrance-bcroy', name: 'BC Roy Gate', type: 'entrance', capacity: 4000, x1: 45, y1: 0, x2: 55, y2: 5, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'entrance-ranji', name: 'Ranji Gate', type: 'entrance', capacity: 3000, x1: 95, y1: 45, x2: 100, y2: 55, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'entrance-south', name: 'South Gate', type: 'entrance', capacity: 3500, x1: 45, y1: 95, x2: 55, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
      { id: 'entrance-west', name: 'West Gate', type: 'entrance', capacity: 3000, x1: 0, y1: 45, x2: 5, y2: 55, connectedZones: ['west-concourse'], facilities: [] },
      { id: 'exit-north', name: 'North Exit', type: 'exit', capacity: 5000, x1: 48, y1: 0, x2: 52, y2: 3, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'exit-east', name: 'East Exit', type: 'exit', capacity: 4000, x1: 97, y1: 48, x2: 100, y2: 52, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'exit-south', name: 'South Exit', type: 'exit', capacity: 5000, x1: 48, y1: 97, x2: 52, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
      { id: 'exit-west', name: 'West Exit', type: 'exit', capacity: 4000, x1: 0, y1: 48, x2: 3, y2: 52, connectedZones: ['west-concourse'], facilities: [] },
    ],
  },
};

// Rajiv Gandhi Intl. Stadium - SRH Home
export const RAJIV_GANDHI_STADIUM: IPLStadium = {
  id: 'rajiv-gandhi',
  name: 'Rajiv Gandhi Intl. Cricket Stadium',
  city: 'Hyderabad',
  capacity: 55000,
  imageGradient: 'from-orange-500 via-orange-600 to-orange-700',
  gates: ['Main Gate', 'South Gate', 'North Gate', 'East Gate', 'VIP Gate'],
  facilities: ['Food Stalls', 'Restrooms', 'Medical Center', 'SRH Store', 'Water Stations'],
  layout: {
    name: 'Rajiv Gandhi Stadium',
    totalCapacity: 55000,
    exitCount: 8,
    emergencyMeetingPoints: [
      { x: 50, y: 5, zone: 'Uppal Junction' },
      { x: 95, y: 50, zone: 'Parking Area A' },
      { x: 50, y: 95, zone: 'Metro Station' },
    ],
    zones: [
      { id: 'north-pavilion', name: 'North Pavilion', type: 'seating', capacity: 8000, x1: 28, y1: 5, x2: 72, y2: 22, connectedZones: ['north-concourse', 'east-pavilion'], facilities: [] },
      { id: 'east-pavilion', name: 'East Pavilion', type: 'seating', capacity: 7000, x1: 70, y1: 18, x2: 92, y2: 50, connectedZones: ['north-pavilion', 'south-stand', 'east-concourse'], facilities: [] },
      { id: 'south-stand', name: 'South Stand', type: 'seating', capacity: 8000, x1: 28, y1: 78, x2: 72, y2: 95, connectedZones: ['east-pavilion', 'west-stand', 'south-concourse'], facilities: [] },
      { id: 'west-stand', name: 'West Stand', type: 'seating', capacity: 7000, x1: 8, y1: 50, x2: 30, y2: 82, connectedZones: ['south-stand', 'north-pavilion', 'west-concourse'], facilities: [] },
      { id: 'hca-pavilion', name: 'HCA Pavilion', type: 'vip', capacity: 800, x1: 35, y1: 35, x2: 65, y2: 65, connectedZones: ['north-concourse'], facilities: ['vip-lounge'] },
      { id: 'north-concourse', name: 'North Concourse', type: 'concourse', capacity: 6000, x1: 22, y1: 0, x2: 78, y2: 8, connectedZones: ['north-pavilion', 'east-concourse', 'west-concourse'], facilities: ['food-north', 'restrooms-north'] },
      { id: 'east-concourse', name: 'East Concourse', type: 'concourse', capacity: 5000, x1: 90, y1: 15, x2: 100, y2: 85, connectedZones: ['east-pavilion', 'north-concourse', 'south-concourse'], facilities: ['food-east', 'restrooms-east'] },
      { id: 'south-concourse', name: 'South Concourse', type: 'concourse', capacity: 6000, x1: 22, y1: 92, x2: 78, y2: 100, connectedZones: ['south-stand', 'east-concourse', 'west-concourse'], facilities: ['food-south', 'restrooms-south'] },
      { id: 'west-concourse', name: 'West Concourse', type: 'concourse', capacity: 5000, x1: 0, y1: 15, x2: 10, y2: 85, connectedZones: ['west-stand', 'north-concourse', 'south-concourse'], facilities: ['food-west', 'first-aid'] },
      { id: 'entrance-main', name: 'Main Gate', type: 'entrance', capacity: 4000, x1: 45, y1: 0, x2: 55, y2: 5, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'entrance-east', name: 'East Gate', type: 'entrance', capacity: 3000, x1: 95, y1: 45, x2: 100, y2: 55, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'entrance-south', name: 'South Gate', type: 'entrance', capacity: 3500, x1: 45, y1: 95, x2: 55, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
      { id: 'exit-north', name: 'North Exit', type: 'exit', capacity: 4000, x1: 48, y1: 0, x2: 52, y2: 3, connectedZones: ['north-concourse'], facilities: [] },
      { id: 'exit-east', name: 'East Exit', type: 'exit', capacity: 3500, x1: 97, y1: 48, x2: 100, y2: 52, connectedZones: ['east-concourse'], facilities: [] },
      { id: 'exit-south', name: 'South Exit', type: 'exit', capacity: 4000, x1: 48, y1: 97, x2: 52, y2: 100, connectedZones: ['south-concourse'], facilities: [] },
    ],
  },
};

// Get stadium by ID
export function getStadiumById(id: string): IPLStadium | undefined {
  const stadiums: IPLStadium[] = [CHEPAUK_STADIUM, WANKHEDE_STADIUM, CHINNASWAMY_STADIUM, EDEN_GARDENS, RAJIV_GANDHI_STADIUM];
  return stadiums.find(s => s.id === id);
}

// Get all stadiums
export const IPL_STADIUMS: IPLStadium[] = [CHEPAUK_STADIUM, WANKHEDE_STADIUM, CHINNASWAMY_STADIUM, EDEN_GARDENS, RAJIV_GANDHI_STADIUM];

export function getAllStadiums(): IPLStadium[] {
  return IPL_STADIUMS;
}

// Match phase crowd multipliers
export function getPhaseMultiplier(phase: MatchPhase): { entrances: number; concourses: number; seating: number; exits: number } {
  switch (phase) {
    case 'pre-match':
      return { entrances: 0.85, concourses: 0.7, seating: 0.3, exits: 0.05 };
    case 'live':
      return { entrances: 0.1, concourses: 0.2, seating: 0.95, exits: 0.05 };
    case 'innings-break':
      return { entrances: 0.05, concourses: 0.75, seating: 0.4, exits: 0.1 };
    case 'post-match':
      return { entrances: 0.02, concourses: 0.6, seating: 0.2, exits: 0.9 };
  }
}
