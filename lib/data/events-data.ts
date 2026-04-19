import { SportEvent } from '../types';
export type { SportEvent };

// Sample events data for the smart stadium system
export const EVENTS: SportEvent[] = [
  // LIVE EVENT
  {
    id: 'evt-live-001',
    name: 'El Clasico: Barcelona vs Real Madrid',
    sport: 'football',
    date: '2026-04-10',
    time: '21:00',
    venue: 'Camp Nou',
    venueLayoutId: 'camp-nou',
    description: 'The greatest rivalry in football. Watch the titans clash in this epic La Liga showdown. AI-powered navigation ensures you never miss a moment of action.',
    imageUrl: '/events/el-clasico.jpg',
    capacity: 99354,
    registeredCount: 98200,
    status: 'live',
    gates: ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4', 'Gate 5', 'Gate 6', 'VIP Gate'],
    ticketTypes: [
      { id: 'gen', name: 'General', price: 120, section: 'Upper Tier', available: 0 },
      { id: 'prem', name: 'Premium', price: 280, section: 'Lower Tier', available: 0 },
      { id: 'vip', name: 'VIP Hospitality', price: 750, section: 'VIP', available: 0 },
    ],
  },
  {
    id: 'evt-live-002',
    name: 'ATP Masters 1000: Nadal vs Sinner',
    sport: 'tennis',
    date: '2026-04-10',
    time: '18:30',
    venue: 'Indian Wells Tennis Garden',
    venueLayoutId: 'indian-wells',
    description: 'Witness the passing of the torch as the King of Clay faces the rising star. A historic moment in tennis history.',
    imageUrl: '/events/tennis-masters.jpg',
    capacity: 16100,
    registeredCount: 16100,
    status: 'live',
    gates: ['Main Gate', 'East Gate', 'VIP Entrance'],
    ticketTypes: [
      { id: 'lawn', name: 'Lawn Seating', price: 95, section: 'Lawn', available: 0 },
      { id: 'stadium', name: 'Stadium Seats', price: 195, section: 'Stadium', available: 0 },
      { id: 'box', name: 'Box Seats', price: 450, section: 'Box', available: 0 },
    ],
  },

  // UPCOMING FOOTBALL
  {
    id: 'evt-001',
    name: 'Premier League: Manchester City vs Arsenal',
    sport: 'football',
    date: '2026-04-15',
    time: '20:00',
    venue: 'Etihad Stadium',
    venueLayoutId: 'etihad-stadium',
    description: 'Title decider! Two teams separated by 2 points clash in what could be the match of the season. Experience world-class football with AI-powered navigation.',
    imageUrl: '/events/football-match.jpg',
    capacity: 53400,
    registeredCount: 45230,
    status: 'upcoming',
    gates: ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E', 'Gate F'],
    ticketTypes: [
      { id: 'gen', name: 'General Admission', price: 75, section: 'General', available: 3500 },
      { id: 'prem', name: 'Premium Seating', price: 150, section: 'Premium', available: 2100 },
      { id: 'vip', name: 'VIP Box', price: 350, section: 'VIP', available: 120 },
    ],
  },
  {
    id: 'evt-006',
    name: 'Champions League Final: Real Madrid vs Bayern Munich',
    sport: 'football',
    date: '2026-05-02',
    time: '21:00',
    venue: 'Wembley Stadium',
    venueLayoutId: 'wembley-stadium',
    description: 'The pinnacle of European club football. Two European giants battle for continental glory under the iconic Wembley arch.',
    imageUrl: '/events/champions-league.jpg',
    capacity: 90000,
    registeredCount: 72100,
    status: 'upcoming',
    gates: ['Olympic Way', 'Engineers Way', 'South Way', 'VIP Entrance'],
    ticketTypes: [
      { id: 'cat3', name: 'Category 3', price: 180, section: 'Upper Tier', available: 12500 },
      { id: 'cat2', name: 'Category 2', price: 350, section: 'Lower Tier', available: 8200 },
      { id: 'cat1', name: 'Category 1', price: 550, section: 'Premium', available: 3100 },
    ],
  },
  {
    id: 'evt-007',
    name: 'Serie A: AC Milan vs Inter Milan - Derby della Madonnina',
    sport: 'football',
    date: '2026-04-20',
    time: '20:45',
    venue: 'San Siro',
    venueLayoutId: 'san-siro',
    description: 'The Milan derby! One city, two clubs, one legendary rivalry. Experience the passion of Italian football at its finest.',
    imageUrl: '/events/milan-derby.jpg',
    capacity: 75923,
    registeredCount: 68400,
    status: 'upcoming',
    gates: ['Torre 1', 'Torre 2', 'Torre 3', 'Torre 4', 'Tribuna VIP'],
    ticketTypes: [
      { id: 'curva', name: 'Curva', price: 55, section: 'Curva', available: 4200 },
      { id: 'lateral', name: 'Lateral', price: 120, section: 'Lateral', available: 3100 },
      { id: 'tribuna', name: 'Tribuna', price: 220, section: 'Tribuna', available: 980 },
    ],
  },
  {
    id: 'evt-008',
    name: 'FIFA World Cup Qualifier: Brazil vs Argentina',
    sport: 'football',
    date: '2026-04-25',
    time: '21:00',
    venue: 'Maracana Stadium',
    venueLayoutId: 'maracana',
    description: 'The Superclasico of the Americas! Messi vs Neymar. The most passionate football rivalry on the planet.',
    imageUrl: '/events/superclasico.jpg',
    capacity: 78838,
    registeredCount: 78000,
    status: 'upcoming',
    gates: ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E'],
    ticketTypes: [
      { id: 'geral', name: 'Geral', price: 45, section: 'General', available: 800 },
      { id: 'arquib', name: 'Arquibancada', price: 95, section: 'Stands', available: 450 },
      { id: 'camar', name: 'Camarote', price: 350, section: 'Hospitality', available: 85 },
    ],
  },

  // BASKETBALL
  {
    id: 'evt-002',
    name: 'NBA Finals Game 5: Lakers vs Celtics',
    sport: 'basketball',
    date: '2026-04-18',
    time: '19:30',
    venue: 'Crypto.com Arena',
    venueLayoutId: 'crypto-arena',
    description: 'The ultimate NBA rivalry! Lakers lead the series 3-1. Will the Celtics force Game 6 or will LA celebrate at home?',
    imageUrl: '/events/basketball-game.jpg',
    capacity: 19068,
    registeredCount: 18750,
    status: 'upcoming',
    gates: ['Gate A', 'Gate B', 'Gate C', 'Gate D'],
    ticketTypes: [
      { id: 'upper', name: 'Upper Deck', price: 220, section: 'Upper', available: 320 },
      { id: 'lower', name: 'Lower Bowl', price: 580, section: 'Lower', available: 150 },
      { id: 'court', name: 'Courtside', price: 2500, section: 'Courtside', available: 8 },
    ],
  },
  {
    id: 'evt-009',
    name: 'EuroLeague Final Four: Barcelona vs Olympiacos',
    sport: 'basketball',
    date: '2026-05-10',
    time: '20:00',
    venue: 'O2 Arena Berlin',
    venueLayoutId: 'o2-berlin',
    description: 'European basketball at its finest. The continent\'s best teams compete for the ultimate prize.',
    imageUrl: '/events/euroleague.jpg',
    capacity: 14500,
    registeredCount: 12800,
    status: 'upcoming',
    gates: ['North Entrance', 'South Entrance', 'VIP Entrance'],
    ticketTypes: [
      { id: 'upper', name: 'Upper Level', price: 85, section: 'Upper', available: 1200 },
      { id: 'lower', name: 'Lower Level', price: 180, section: 'Lower', available: 650 },
      { id: 'floor', name: 'Floor Seats', price: 450, section: 'Floor', available: 45 },
    ],
  },
  {
    id: 'evt-010',
    name: 'NBA All-Star Game 2026',
    sport: 'basketball',
    date: '2026-02-15',
    time: '20:00',
    venue: 'Madison Square Garden',
    venueLayoutId: 'msg',
    description: 'The world\'s greatest basketball players unite at the World\'s Most Famous Arena. Dunks, drama, and entertainment!',
    imageUrl: '/events/allstar.jpg',
    capacity: 19812,
    registeredCount: 19812,
    status: 'completed',
    gates: ['31st Street', '33rd Street', '7th Avenue', '8th Avenue'],
    ticketTypes: [
      { id: 'upper', name: 'Upper Deck', price: 350, section: 'Upper', available: 0 },
      { id: 'lower', name: 'Lower Bowl', price: 850, section: 'Lower', available: 0 },
      { id: 'vip', name: 'VIP Experience', price: 3500, section: 'VIP', available: 0 },
    ],
  },

  // CRICKET
  {
    id: 'evt-003',
    name: 'ICC World Cup Semi-Final: India vs Australia',
    sport: 'cricket',
    date: '2026-04-22',
    time: '14:00',
    venue: 'Melbourne Cricket Ground',
    venueLayoutId: 'mcg',
    description: 'The most anticipated cricket match of the year! India seeks revenge for the 2023 final. Over 90,000 fans expected.',
    imageUrl: '/events/cricket-match.jpg',
    capacity: 100024,
    registeredCount: 98900,
    status: 'upcoming',
    gates: ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4', 'Gate 5', 'Gate 6', 'MCC Members'],
    ticketTypes: [
      { id: 'stands', name: 'General Stands', price: 65, section: 'Stands', available: 1200 },
      { id: 'reserve', name: 'Reserved Seating', price: 145, section: 'Reserved', available: 490 },
      { id: 'corp', name: 'Corporate Suite', price: 850, section: 'Corporate', available: 25 },
    ],
  },
  {
    id: 'evt-011',
    name: 'The Ashes: England vs Australia - Day 1',
    sport: 'cricket',
    date: '2026-06-10',
    time: '11:00',
    venue: 'Lord\'s Cricket Ground',
    venueLayoutId: 'lords',
    description: 'The oldest rivalry in cricket returns to the Home of Cricket. Five days of intense Test cricket awaits.',
    imageUrl: '/events/ashes.jpg',
    capacity: 31000,
    registeredCount: 28500,
    status: 'upcoming',
    gates: ['Grace Gate', 'North Gate', 'Nursery End', 'MCC Members Gate'],
    ticketTypes: [
      { id: 'mound', name: 'Mound Stand', price: 110, section: 'Mound', available: 1800 },
      { id: 'grand', name: 'Grand Stand', price: 185, section: 'Grand', available: 750 },
      { id: 'pav', name: 'Pavilion', price: 350, section: 'Pavilion', available: 120 },
    ],
  },
  {
    id: 'evt-012',
    name: 'T20 World Cup Final',
    sport: 'cricket',
    date: '2026-11-15',
    time: '19:00',
    venue: 'Dubai International Stadium',
    venueLayoutId: 'dubai-stadium',
    description: 'The grand finale of the T20 World Cup! 20 overs to decide the world champion. Electric atmosphere guaranteed.',
    imageUrl: '/events/t20-final.jpg',
    capacity: 25000,
    registeredCount: 18500,
    status: 'upcoming',
    gates: ['Main Gate', 'East Gate', 'West Gate', 'VIP Gate'],
    ticketTypes: [
      { id: 'bronze', name: 'Bronze', price: 55, section: 'Bronze', available: 4500 },
      { id: 'silver', name: 'Silver', price: 120, section: 'Silver', available: 2100 },
      { id: 'gold', name: 'Gold', price: 280, section: 'Gold', available: 650 },
    ],
  },

  // TENNIS
  {
    id: 'evt-004',
    name: 'Wimbledon Gentlemen\'s Final',
    sport: 'tennis',
    date: '2026-07-14',
    time: '14:00',
    venue: 'All England Club - Centre Court',
    venueLayoutId: 'wimbledon-centre',
    description: 'The pinnacle of tennis. Tradition meets excellence at the most prestigious Grand Slam. Strawberries and cream included.',
    imageUrl: '/events/tennis-match.jpg',
    capacity: 14979,
    registeredCount: 14200,
    status: 'upcoming',
    gates: ['Gate 1', 'Gate 3', 'Gate 5', 'Debenture Entrance'],
    ticketTypes: [
      { id: 'debenture', name: 'Debenture', price: 850, section: 'Debenture', available: 120 },
      { id: 'standard', name: 'Centre Court', price: 280, section: 'Standard', available: 580 },
      { id: 'grounds', name: 'Grounds Pass', price: 45, section: 'Grounds', available: 0 },
    ],
  },
  {
    id: 'evt-013',
    name: 'US Open Women\'s Final',
    sport: 'tennis',
    date: '2026-09-07',
    time: '16:00',
    venue: 'Arthur Ashe Stadium',
    venueLayoutId: 'arthur-ashe',
    description: 'The biggest stadium in tennis hosts the biggest names. New York energy meets world-class tennis.',
    imageUrl: '/events/us-open.jpg',
    capacity: 23771,
    registeredCount: 19200,
    status: 'upcoming',
    gates: ['East Gate', 'South Gate', 'West Gate', 'USTA Entrance'],
    ticketTypes: [
      { id: 'prom', name: 'Promenade', price: 125, section: 'Promenade', available: 3200 },
      { id: 'loge', name: 'Loge', price: 295, section: 'Loge', available: 1450 },
      { id: 'court', name: 'Courtside', price: 680, section: 'Courtside', available: 220 },
    ],
  },
  {
    id: 'evt-014',
    name: 'French Open Final: Roland Garros',
    sport: 'tennis',
    date: '2026-06-08',
    time: '15:00',
    venue: 'Court Philippe-Chatrier',
    venueLayoutId: 'roland-garros',
    description: 'The King of Clay\'s domain. Red dust, French passion, and the ultimate test on terre battue.',
    imageUrl: '/events/french-open.jpg',
    capacity: 15225,
    registeredCount: 14800,
    status: 'upcoming',
    gates: ['Porte d\'Auteuil', 'Porte Molitor', 'Porte des Mousquetaires'],
    ticketTypes: [
      { id: 'cat3', name: 'Categorie 3', price: 95, section: 'Upper', available: 425 },
      { id: 'cat2', name: 'Categorie 2', price: 195, section: 'Middle', available: 280 },
      { id: 'cat1', name: 'Categorie 1', price: 380, section: 'Premium', available: 85 },
    ],
  },

  // CONCERTS
  {
    id: 'evt-005',
    name: 'Taylor Swift: The Eras Tour - Final Night',
    sport: 'concert',
    date: '2026-04-28',
    time: '19:00',
    venue: 'SoFi Stadium',
    venueLayoutId: 'sofi-stadium',
    description: 'The tour that broke every record comes to its epic conclusion. A once-in-a-lifetime musical experience. Friendship bracelets required.',
    imageUrl: '/events/concert.jpg',
    capacity: 70000,
    registeredCount: 69500,
    status: 'upcoming',
    gates: ['American Airlines Plaza', 'YouTube Theater', 'Lake Park Gate', 'VIP Entrance'],
    ticketTypes: [
      { id: 'ga', name: 'General Admission', price: 250, section: 'Floor', available: 150 },
      { id: 'seated', name: 'Reserved Seating', price: 380, section: 'Seated', available: 420 },
      { id: 'vip-pkg', name: 'VIP Experience', price: 1200, section: 'VIP', available: 12 },
    ],
  },
  {
    id: 'evt-015',
    name: 'Coldplay: Music of the Spheres World Tour',
    sport: 'concert',
    date: '2026-05-15',
    time: '20:00',
    venue: 'Wembley Stadium',
    venueLayoutId: 'wembley-concert',
    description: 'An otherworldly experience! LED wristbands, confetti, and Chris Martin\'s magic create an unforgettable night.',
    imageUrl: '/events/coldplay.jpg',
    capacity: 90000,
    registeredCount: 85000,
    status: 'upcoming',
    gates: ['Olympic Way', 'Engineers Way', 'South Way', 'VIP Entrance'],
    ticketTypes: [
      { id: 'pitch', name: 'Pitch Standing', price: 145, section: 'Pitch', available: 3500 },
      { id: 'seated', name: 'Seated', price: 195, section: 'Seated', available: 2800 },
      { id: 'hospitality', name: 'Hospitality', price: 550, section: 'Hospitality', available: 180 },
    ],
  },
  {
    id: 'evt-016',
    name: 'Beyonce: Renaissance World Tour',
    sport: 'concert',
    date: '2026-06-20',
    time: '20:30',
    venue: 'MetLife Stadium',
    venueLayoutId: 'metlife',
    description: 'Queen Bey returns! A celebration of music, dance, and pure artistic excellence. Get ready to dance all night.',
    imageUrl: '/events/beyonce.jpg',
    capacity: 82500,
    registeredCount: 79000,
    status: 'upcoming',
    gates: ['Verizon Gate', 'MetLife Gate', 'Pepsi Gate', 'Toyota Gate'],
    ticketTypes: [
      { id: 'floor', name: 'Floor', price: 295, section: 'Floor', available: 1800 },
      { id: 'lower', name: 'Lower Bowl', price: 225, section: 'Lower', available: 2400 },
      { id: 'upper', name: 'Upper Level', price: 125, section: 'Upper', available: 4200 },
    ],
  },
  {
    id: 'evt-017',
    name: 'Ed Sheeran: Mathematics Tour',
    sport: 'concert',
    date: '2026-07-25',
    time: '19:30',
    venue: 'Rose Bowl',
    venueLayoutId: 'rose-bowl',
    description: 'Just Ed and his loop pedal performing to 90,000 fans. Intimate yet massive. The power of one man and his guitar.',
    imageUrl: '/events/ed-sheeran.jpg',
    capacity: 90888,
    registeredCount: 65000,
    status: 'upcoming',
    gates: ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E', 'Gate F', 'Gate G', 'Gate H'],
    ticketTypes: [
      { id: 'lawn', name: 'Lawn', price: 75, section: 'Lawn', available: 18000 },
      { id: 'reserved', name: 'Reserved', price: 145, section: 'Reserved', available: 8500 },
      { id: 'gold', name: 'Gold Circle', price: 295, section: 'Gold', available: 1200 },
    ],
  },

  // MORE SPORTS
  {
    id: 'evt-018',
    name: 'UFC 310: Championship Night',
    sport: 'other',
    date: '2026-08-15',
    time: '22:00',
    venue: 'T-Mobile Arena',
    venueLayoutId: 't-mobile',
    description: 'Three title fights on one explosive card. The biggest night in UFC history. Expect fireworks inside the Octagon.',
    imageUrl: '/events/ufc.jpg',
    capacity: 20000,
    registeredCount: 19500,
    status: 'upcoming',
    gates: ['Main Entrance', 'Toshiba Plaza', 'VIP Entrance'],
    ticketTypes: [
      { id: 'upper', name: 'Upper Bowl', price: 185, section: 'Upper', available: 350 },
      { id: 'lower', name: 'Lower Bowl', price: 450, section: 'Lower', available: 120 },
      { id: 'floor', name: 'Floor Seats', price: 1200, section: 'Floor', available: 25 },
    ],
  },
  {
    id: 'evt-019',
    name: 'Formula 1: Monaco Grand Prix',
    sport: 'other',
    date: '2026-05-24',
    time: '15:00',
    venue: 'Circuit de Monaco',
    venueLayoutId: 'monaco-circuit',
    description: 'The crown jewel of motorsport. Glamour, speed, and the most challenging circuit on the calendar. Pure adrenaline.',
    imageUrl: '/events/f1-monaco.jpg',
    capacity: 37000,
    registeredCount: 36800,
    status: 'upcoming',
    gates: ['Paddock Club', 'Grandstand K', 'Grandstand T', 'General Access'],
    ticketTypes: [
      { id: 'general', name: 'General Admission', price: 180, section: 'General', available: 180 },
      { id: 'grand', name: 'Grandstand', price: 520, section: 'Grandstand', available: 65 },
      { id: 'paddock', name: 'Paddock Club', price: 2800, section: 'Paddock', available: 12 },
    ],
  },
  {
    id: 'evt-020',
    name: 'Super Bowl LX',
    sport: 'other',
    date: '2026-02-08',
    time: '18:30',
    venue: 'Allegiant Stadium',
    venueLayoutId: 'allegiant',
    description: 'The biggest sporting event in America. Football, halftime show, and unforgettable moments await.',
    imageUrl: '/events/superbowl.jpg',
    capacity: 65000,
    registeredCount: 65000,
    status: 'completed',
    gates: ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4', 'VIP Tunnel'],
    ticketTypes: [
      { id: 'upper', name: 'Upper Level', price: 4500, section: 'Upper', available: 0 },
      { id: 'lower', name: 'Lower Level', price: 8500, section: 'Lower', available: 0 },
      { id: 'club', name: 'Club Level', price: 15000, section: 'Club', available: 0 },
    ],
  },
];

// Get event by ID
export function getEventById(id: string): SportEvent | undefined {
  return EVENTS.find(event => event.id === id);
}

// Get events by sport
export function getEventsBySport(sport: SportEvent['sport']): SportEvent[] {
  return EVENTS.filter(event => event.sport === sport);
}

// Get upcoming events
export function getUpcomingEvents(): SportEvent[] {
  return EVENTS.filter(event => event.status === 'upcoming');
}

// Get live events
export function getLiveEvents(): SportEvent[] {
  return EVENTS.filter(event => event.status === 'live');
}

// Format date for display
export function formatEventDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time for display  
export function formatEventTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Get sport icon name
export function getSportIcon(sport: SportEvent['sport']): string {
  const icons: Record<SportEvent['sport'], string> = {
    football: 'goal',
    basketball: 'basketball',
    cricket: 'cricket',
    tennis: 'tennis',
    concert: 'music',
    other: 'calendar',
  };
  return icons[sport] || 'calendar';
}
