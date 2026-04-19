import { GateData, GateStatus } from '../types';

export const GATES_CONFIG: Omit<GateData, 'currentCount' | 'density' | 'status' | 'trend' | 'waitTimeMinutes' | 'timestamp'>[] = [
  // Entry Gates
  { id: 'entry-north', name: 'Gate A - North Entry', type: 'entry', sector: 'north', capacity: 5000, isOpen: true },
  { id: 'entry-south', name: 'Gate B - South Entry', type: 'entry', sector: 'south', capacity: 5000, isOpen: true },
  { id: 'entry-east',  name: 'Gate C - East Entry',  type: 'entry', sector: 'east',  capacity: 4000, isOpen: true },
  { id: 'entry-west',  name: 'Gate D - West Entry',  type: 'entry', sector: 'west',  capacity: 4000, isOpen: true },
  // Exit Gates
  { id: 'exit-north',  name: 'Gate E - North Exit',  type: 'exit',  sector: 'north', capacity: 6000, isOpen: true },
  { id: 'exit-south',  name: 'Gate F - South Exit',  type: 'exit',  sector: 'south', capacity: 6000, isOpen: true },
  { id: 'exit-east',   name: 'Gate G - East Exit',   type: 'exit',  sector: 'east',  capacity: 5000, isOpen: true },
  { id: 'exit-west',   name: 'Gate H - West Exit',   type: 'exit',  sector: 'west',  capacity: 5000, isOpen: true },
];

export const SUGGESTION_PAIRS: Record<string, string> = {
  'entry-north': 'entry-east',
  'entry-south': 'entry-west',
  'entry-east':  'entry-north',
  'entry-west':  'entry-south',
  'exit-north':  'exit-east',
  'exit-south':  'exit-west',
  'exit-east':   'exit-north',
  'exit-west':   'exit-south',
};
