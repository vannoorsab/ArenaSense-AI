import { SportEvent } from '../types';
import { MatchPhase } from './ipl-stadiums';

export interface CSKMatch extends SportEvent {
  opponent: string;
  opponentShort: string;
  opponentColor: string;
  isHome: boolean;
  stadiumId: string;
  matchNumber: number;
  phase: MatchPhase;
}

// CSK Yellow theme
export const CSK_COLORS = {
  primary: '#FDB913',
  secondary: '#003B7B',
  accent: '#FFD700',
};

// IPL 2026 CSK Matches
export const CSK_MATCHES: CSKMatch[] = [
  {
    id: 'csk-match-1',
    name: 'CSK vs MI',
    opponent: 'Mumbai Indians',
    opponentShort: 'MI',
    opponentColor: '#004BA0',
    sport: 'cricket',
    date: '2026-04-12',
    time: '19:30',
    venue: 'M.A. Chidambaram Stadium',
    venueLayoutId: 'chepauk',
    stadiumId: 'chepauk',
    description: 'The ultimate IPL rivalry! Watch Chennai Super Kings take on Mumbai Indians in this blockbuster clash at the iconic Chepauk Stadium. Experience the legendary Yellow Army atmosphere.',
    imageUrl: '/events/csk-mi.jpg',
    capacity: 50000,
    registeredCount: 48500,
    status: 'upcoming',
    isHome: true,
    matchNumber: 1,
    phase: 'pre-match',
    gates: ['Anna Pavilion Gate', 'V. Pattabhiraman Gate', 'I Stand Gate', 'J Stand Gate', 'North Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 800, section: 'I/J Stand', available: 1200 },
      { id: 'pavilion', name: 'Anna Pavilion', price: 2500, section: 'Anna Pavilion', available: 350 },
      { id: 'vip', name: 'Corporate Box', price: 8000, section: 'VIP', available: 45 },
    ],
  },
  {
    id: 'csk-match-2',
    name: 'CSK vs RCB',
    opponent: 'Royal Challengers Bengaluru',
    opponentShort: 'RCB',
    opponentColor: '#EC1C24',
    sport: 'cricket',
    date: '2026-04-16',
    time: '19:30',
    venue: 'M. Chinnaswamy Stadium',
    venueLayoutId: 'chinnaswamy',
    stadiumId: 'chinnaswamy',
    description: 'CSK travels to Bengaluru to face RCB at the M. Chinnaswamy Stadium. A high-scoring thriller awaits as two passionate fan bases collide in this Southern derby.',
    imageUrl: '/events/csk-rcb.jpg',
    capacity: 40000,
    registeredCount: 39200,
    status: 'upcoming',
    isHome: false,
    matchNumber: 2,
    phase: 'pre-match',
    gates: ['KSCA Gate', 'MG Road Gate', 'Cubbon Park Gate', 'Queens Road Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 1000, section: 'P/Q Stand', available: 600 },
      { id: 'premium', name: 'Premium Seating', price: 3000, section: 'R/S Stand', available: 180 },
      { id: 'vip', name: 'KSCA Pavilion', price: 10000, section: 'VIP', available: 25 },
    ],
  },
  {
    id: 'csk-match-3',
    name: 'CSK vs KKR',
    opponent: 'Kolkata Knight Riders',
    opponentShort: 'KKR',
    opponentColor: '#3A225D',
    sport: 'cricket',
    date: '2026-04-20',
    time: '15:30',
    venue: 'M.A. Chidambaram Stadium',
    venueLayoutId: 'chepauk',
    stadiumId: 'chepauk',
    description: 'An afternoon delight at Chepauk! CSK hosts KKR in what promises to be a tactical battle between two champions. The Yellow Army is ready to roar!',
    imageUrl: '/events/csk-kkr.jpg',
    capacity: 50000,
    registeredCount: 47800,
    status: 'upcoming',
    isHome: true,
    matchNumber: 3,
    phase: 'pre-match',
    gates: ['Anna Pavilion Gate', 'V. Pattabhiraman Gate', 'I Stand Gate', 'J Stand Gate', 'North Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 700, section: 'K/L Stand', available: 1800 },
      { id: 'pavilion', name: 'Premium Section', price: 2000, section: 'M/N Stand', available: 420 },
      { id: 'vip', name: 'Corporate Box', price: 7500, section: 'VIP', available: 55 },
    ],
  },
  {
    id: 'csk-match-4',
    name: 'CSK vs SRH',
    opponent: 'Sunrisers Hyderabad',
    opponentShort: 'SRH',
    opponentColor: '#F7A721',
    sport: 'cricket',
    date: '2026-04-24',
    time: '19:30',
    venue: 'Rajiv Gandhi Intl. Cricket Stadium',
    venueLayoutId: 'rajiv-gandhi',
    stadiumId: 'rajiv-gandhi',
    description: 'CSK faces SRH in Hyderabad under lights. The Orange Army meets the Yellow Brigade in this exciting encounter at the Rajiv Gandhi Stadium.',
    imageUrl: '/events/csk-srh.jpg',
    capacity: 55000,
    registeredCount: 52100,
    status: 'upcoming',
    isHome: false,
    matchNumber: 4,
    phase: 'pre-match',
    gates: ['Main Gate', 'South Gate', 'North Gate', 'East Gate', 'VIP Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 600, section: 'North Pavilion', available: 2500 },
      { id: 'premium', name: 'East Pavilion', price: 1800, section: 'East Pavilion', available: 680 },
      { id: 'vip', name: 'HCA Pavilion', price: 6000, section: 'VIP', available: 70 },
    ],
  },
  {
    id: 'csk-match-5',
    name: 'CSK vs DC',
    opponent: 'Delhi Capitals',
    opponentShort: 'DC',
    opponentColor: '#004C93',
    sport: 'cricket',
    date: '2026-04-28',
    time: '19:30',
    venue: 'M.A. Chidambaram Stadium',
    venueLayoutId: 'chepauk',
    stadiumId: 'chepauk',
    description: 'The Super Kings host Delhi Capitals in a crucial league stage encounter. Can the Capitals handle the spin-friendly Chepauk conditions?',
    imageUrl: '/events/csk-dc.jpg',
    capacity: 50000,
    registeredCount: 46200,
    status: 'upcoming',
    isHome: true,
    matchNumber: 5,
    phase: 'pre-match',
    gates: ['Anna Pavilion Gate', 'V. Pattabhiraman Gate', 'I Stand Gate', 'J Stand Gate', 'North Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 650, section: 'O Stand', available: 2200 },
      { id: 'pavilion', name: 'Anna Pavilion', price: 2200, section: 'Anna Pavilion', available: 380 },
      { id: 'vip', name: 'Corporate Box', price: 7000, section: 'VIP', available: 60 },
    ],
  },
  {
    id: 'csk-match-6',
    name: 'CSK vs GT',
    opponent: 'Gujarat Titans',
    opponentShort: 'GT',
    opponentColor: '#1C1C1C',
    sport: 'cricket',
    date: '2026-05-02',
    time: '19:30',
    venue: 'M.A. Chidambaram Stadium',
    venueLayoutId: 'chepauk',
    stadiumId: 'chepauk',
    description: 'A clash of champions! CSK takes on GT in a rematch of the 2023 final. The atmosphere at Chepauk will be electric!',
    imageUrl: '/events/csk-gt.jpg',
    capacity: 50000,
    registeredCount: 49500,
    status: 'live',
    isHome: true,
    matchNumber: 6,
    phase: 'live',
    gates: ['Anna Pavilion Gate', 'V. Pattabhiraman Gate', 'I Stand Gate', 'J Stand Gate', 'North Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 900, section: 'I/J Stand', available: 0 },
      { id: 'pavilion', name: 'Anna Pavilion', price: 3000, section: 'Anna Pavilion', available: 0 },
      { id: 'vip', name: 'Corporate Box', price: 9000, section: 'VIP', available: 0 },
    ],
  },
  {
    id: 'csk-match-7',
    name: 'CSK vs PBKS',
    opponent: 'Punjab Kings',
    opponentShort: 'PBKS',
    opponentColor: '#ED1B24',
    sport: 'cricket',
    date: '2026-05-06',
    time: '19:30',
    venue: 'M.A. Chidambaram Stadium',
    venueLayoutId: 'chepauk',
    stadiumId: 'chepauk',
    description: 'CSK continues their home run against Punjab Kings. The Yellow Army is in full voice as CSK looks to consolidate their playoff position.',
    imageUrl: '/events/csk-pbks.jpg',
    capacity: 50000,
    registeredCount: 44800,
    status: 'upcoming',
    isHome: true,
    matchNumber: 7,
    phase: 'pre-match',
    gates: ['Anna Pavilion Gate', 'V. Pattabhiraman Gate', 'I Stand Gate', 'J Stand Gate', 'North Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 600, section: 'L/M Stand', available: 3500 },
      { id: 'pavilion', name: 'Premium Section', price: 1800, section: 'N/O Stand', available: 720 },
      { id: 'vip', name: 'Corporate Box', price: 6500, section: 'VIP', available: 80 },
    ],
  },
  {
    id: 'csk-match-8',
    name: 'CSK vs RR',
    opponent: 'Rajasthan Royals',
    opponentShort: 'RR',
    opponentColor: '#EA1A85',
    sport: 'cricket',
    date: '2026-05-10',
    time: '19:30',
    venue: 'M.A. Chidambaram Stadium',
    venueLayoutId: 'chepauk',
    stadiumId: 'chepauk',
    description: 'The inaugural IPL champions visit Chepauk! Can Rajasthan Royals overcome the fortress that is the M.A. Chidambaram Stadium?',
    imageUrl: '/events/csk-rr.jpg',
    capacity: 50000,
    registeredCount: 47200,
    status: 'upcoming',
    isHome: true,
    matchNumber: 8,
    phase: 'pre-match',
    gates: ['Anna Pavilion Gate', 'V. Pattabhiraman Gate', 'I Stand Gate', 'J Stand Gate', 'North Gate'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 750, section: 'I/J Stand', available: 2100 },
      { id: 'pavilion', name: 'Anna Pavilion', price: 2300, section: 'Anna Pavilion', available: 400 },
      { id: 'vip', name: 'Corporate Box', price: 7500, section: 'VIP', available: 50 },
    ],
  },
];

// Get CSK match by ID
export function getCSKMatchById(id: string): CSKMatch | undefined {
  return CSK_MATCHES.find(match => match.id === id);
}

// Get all upcoming CSK matches
export function getUpcomingCSKMatches(): CSKMatch[] {
  return CSK_MATCHES.filter(match => match.status === 'upcoming');
}

// Get live CSK matches
export function getLiveCSKMatches(): CSKMatch[] {
  return CSK_MATCHES.filter(match => match.status === 'live');
}

// Format match date for display
export function formatMatchDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format match time for display
export function formatMatchTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm} IST`;
}
