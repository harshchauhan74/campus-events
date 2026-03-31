import type { CampusEvent, User, RSVP, Review } from "./types";
import { seedEvents, seedUsers, seedRsvps, seedReviews } from "./seed-data";

// In-memory store — will be replaced with Supabase when connected
class DataStore {
  events: CampusEvent[];
  users: User[];
  rsvps: RSVP[];
  reviews: Review[];

  constructor() {
    this.events = [...seedEvents];
    this.users = [...seedUsers];
    this.rsvps = [...seedRsvps];
    this.reviews = [...seedReviews];
  }

  // Events
  getApprovedEvents() {
    return this.events.filter((e) => e.status === "approved");
  }

  getFeaturedEvents() {
    return this.events.filter((e) => e.status === "approved" && e.isFeatured);
  }

  getEventById(id: string) {
    return this.events.find((e) => e.id === id) || null;
  }

  getEventsByCategory(category: string) {
    return this.events.filter(
      (e) => e.status === "approved" && e.category === category
    );
  }

  getEventsByOrganizer(organizerId: string) {
    return this.events.filter((e) => e.organizerId === organizerId);
  }

  getPendingEvents() {
    return this.events.filter((e) => e.status === "pending");
  }

  getAllEvents() {
    return this.events;
  }

  addEvent(event: CampusEvent) {
    this.events.push(event);
    return event;
  }

  updateEvent(id: string, updates: Partial<CampusEvent>) {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.events[idx] = { ...this.events[idx], ...updates };
    return this.events[idx];
  }

  deleteEvent(id: string) {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.events.splice(idx, 1);
    this.rsvps = this.rsvps.filter((r) => r.eventId !== id);
    this.reviews = this.reviews.filter((r) => r.eventId !== id);
    return true;
  }

  // Users
  getUserById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  getUserByEmail(email: string) {
    return this.users.find((u) => u.email === email) || null;
  }

  getAllUsers() {
    return this.users;
  }

  addUser(user: User) {
    // Prevent duplicates
    if (this.getUserByEmail(user.email)) return null;
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  // RSVPs
  getRsvpsByUser(userId: string) {
    return this.rsvps.filter((r) => r.userId === userId);
  }

  getRsvpsByEvent(eventId: string) {
    return this.rsvps.filter((r) => r.eventId === eventId);
  }

  hasUserRsvped(userId: string, eventId: string) {
    return this.rsvps.some(
      (r) => r.userId === userId && r.eventId === eventId
    );
  }

  addRsvp(rsvp: RSVP) {
    this.rsvps.push(rsvp);
    const event = this.getEventById(rsvp.eventId);
    if (event) event.rsvpCount += 1;
    return rsvp;
  }

  removeRsvp(userId: string, eventId: string) {
    const idx = this.rsvps.findIndex(
      (r) => r.userId === userId && r.eventId === eventId
    );
    if (idx === -1) return false;
    this.rsvps.splice(idx, 1);
    const event = this.getEventById(eventId);
    if (event) event.rsvpCount = Math.max(0, event.rsvpCount - 1);
    return true;
  }

  // Reviews
  getReviewsByEvent(eventId: string) {
    return this.reviews.filter((r) => r.eventId === eventId);
  }

  addReview(review: Review) {
    this.reviews.push(review);
    return review;
  }

  // Analytics
  getAnalytics() {
    const approved = this.getApprovedEvents();
    const categoryCount: Record<string, number> = {};
    approved.forEach((e) => {
      categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    });

    const totalRsvps = approved.reduce((sum, e) => sum + e.rsvpCount, 0);
    const topEvents = [...approved]
      .sort((a, b) => b.rsvpCount - a.rsvpCount)
      .slice(0, 5);

    // Monthly RSVPs (mock data for analytics chart)
    const monthlyRsvps = [
      { month: "Sep", count: 145 },
      { month: "Oct", count: 234 },
      { month: "Nov", count: 312 },
      { month: "Dec", count: 178 },
      { month: "Jan", count: 267 },
      { month: "Feb", count: 389 },
      { month: "Mar", count: 456 },
    ];

    return {
      totalEvents: approved.length,
      pendingEvents: this.getPendingEvents().length,
      totalUsers: this.users.length,
      totalRsvps,
      categoryDistribution: categoryCount,
      topEvents,
      monthlyRsvps,
    };
  }
}

// Singleton
const globalStore = globalThis as unknown as { __store?: DataStore };
if (!globalStore.__store) {
  globalStore.__store = new DataStore();
}
export const store = globalStore.__store;
