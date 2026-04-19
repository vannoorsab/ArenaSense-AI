'use client';

import { UserAccount, Ticket, SportEvent } from '../types';

// Simple client-side auth store using localStorage for persistence
const STORAGE_KEY = 'stadium_auth';
const TICKETS_KEY = 'stadium_tickets';

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}

// Get stored auth state
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored) as UserAccount;
      return { user, isAuthenticated: true };
    }
  } catch {
    // Invalid data, clear it
    localStorage.removeItem(STORAGE_KEY);
  }
  
  return { user: null, isAuthenticated: false };
}

// Login user
export function loginUser(email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  // In a real app, this would validate against a backend
  // For demo, we accept any valid email format with password length >= 6
  
  if (!email.includes('@') || password.length < 6) {
    return { success: false, error: 'Invalid email or password (min 6 characters)' };
  }
  
  // Check if user exists in localStorage (simulated database)
  const usersData = localStorage.getItem('stadium_users');
  const users: Record<string, { password: string; user: UserAccount }> = usersData ? JSON.parse(usersData) : {};
  
  if (users[email]) {
    if (users[email].password === password) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users[email].user));
      return { success: true, user: users[email].user };
    }
    return { success: false, error: 'Incorrect password' };
  }
  
  return { success: false, error: 'No account found with this email. Please sign up.' };
}

// Sign up user
export function signupUser(name: string, email: string, password: string, phone?: string): { success: boolean; user?: UserAccount; error?: string } {
  if (!name || name.length < 2) {
    return { success: false, error: 'Name must be at least 2 characters' };
  }
  
  if (!email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  // Check if user already exists
  const usersData = localStorage.getItem('stadium_users');
  const users: Record<string, { password: string; user: UserAccount }> = usersData ? JSON.parse(usersData) : {};
  
  if (users[email]) {
    return { success: false, error: 'An account with this email already exists' };
  }
  
  // Create new user
  const newUser: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    name,
    phone,
    createdAt: new Date().toISOString(),
    registeredEvents: [],
  };
  
  // Store user
  users[email] = { password, user: newUser };
  localStorage.setItem('stadium_users', JSON.stringify(users));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  
  return { success: true, user: newUser };
}

// Logout user
export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Update user
export function updateUser(updates: Partial<UserAccount>): UserAccount | null {
  const state = getAuthState();
  if (!state.user) return null;
  
  const updatedUser = { ...state.user, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  
  // Also update in users database
  const usersData = localStorage.getItem('stadium_users');
  if (usersData) {
    const users = JSON.parse(usersData);
    if (users[state.user.email]) {
      users[state.user.email].user = updatedUser;
      localStorage.setItem('stadium_users', JSON.stringify(users));
    }
  }
  
  return updatedUser;
}

// Get user tickets
export function getUserTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const state = getAuthState();
    if (!state.user) return [];
    
    const ticketsData = localStorage.getItem(TICKETS_KEY);
    if (!ticketsData) return [];
    
    const allTickets: Ticket[] = JSON.parse(ticketsData);
    return allTickets.filter(t => t.userId === state.user?.id);
  } catch {
    return [];
  }
}

// Register for event and generate ticket
export function registerForEvent(event: SportEvent, ticketTypeId: string): { success: boolean; ticket?: Ticket; error?: string } {
  const state = getAuthState();
  if (!state.user) {
    return { success: false, error: 'Please login to register for events' };
  }
  
  // Check if already registered
  const existingTickets = getUserTickets();
  if (existingTickets.some(t => t.eventId === event.id)) {
    return { success: false, error: 'You are already registered for this event' };
  }
  
  const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
  if (!ticketType) {
    return { success: false, error: 'Invalid ticket type selected' };
  }
  
  // Generate unique ticket
  const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  const qrCode = `STADIUM-${event.id}-${state.user.id}-${ticketId}`;
  
  const ticket: Ticket = {
    id: ticketId,
    eventId: event.id,
    userId: state.user.id,
    ticketType: ticketType.name,
    section: ticketType.section,
    seat: `${ticketType.section}-${Math.floor(Math.random() * 50) + 1}`,
    gate: event.gates[Math.floor(Math.random() * event.gates.length)],
    qrCode,
    purchaseDate: new Date().toISOString(),
    status: 'valid',
  };
  
  // Store ticket
  const ticketsData = localStorage.getItem(TICKETS_KEY);
  const allTickets: Ticket[] = ticketsData ? JSON.parse(ticketsData) : [];
  allTickets.push(ticket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(allTickets));
  
  // Update user's registered events
  updateUser({
    registeredEvents: [...state.user.registeredEvents, event.id],
  });
  
  return { success: true, ticket };
}

// Validate ticket for entry
export function validateTicket(qrCode: string): { valid: boolean; ticket?: Ticket; error?: string } {
  const ticketsData = localStorage.getItem(TICKETS_KEY);
  if (!ticketsData) {
    return { valid: false, error: 'No tickets found' };
  }
  
  const allTickets: Ticket[] = JSON.parse(ticketsData);
  const ticket = allTickets.find(t => t.qrCode === qrCode);
  
  if (!ticket) {
    return { valid: false, error: 'Invalid ticket QR code' };
  }
  
  if (ticket.status === 'used') {
    return { valid: false, error: 'This ticket has already been used' };
  }
  
  if (ticket.status === 'expired' || ticket.status === 'cancelled') {
    return { valid: false, error: 'This ticket is no longer valid' };
  }
  
  // Mark as used
  const updatedTickets = allTickets.map(t => 
    t.id === ticket.id ? { ...t, status: 'used' as const } : t
  );
  localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
  
  return { valid: true, ticket: { ...ticket, status: 'used' } };
}

// Get ticket by ID
export function getTicketById(ticketId: string): Ticket | null {
  const ticketsData = localStorage.getItem(TICKETS_KEY);
  if (!ticketsData) return null;
  
  const allTickets: Ticket[] = JSON.parse(ticketsData);
  return allTickets.find(t => t.id === ticketId) || null;
}
