/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Data Storage & Concurrency Control Layer
 * Manages reactive data state, persistence, and double-booking atomic locks
 */

import { 
  User, 
  TherapistProfile, 
  WellnessContent, 
  Appointment, 
  Review, 
  GamificationRule, 
  IncidentAlert, 
  SensitiveHealthAssessment,
  ConsultationNote,
  HabitLog,
  ZenPointTransaction
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_THERAPISTS, 
  INITIAL_CONTENT, 
  INITIAL_APPOINTMENTS, 
  INITIAL_REVIEWS, 
  INITIAL_GAMIFICATION_RULES, 
  INITIAL_INCIDENT_ALERTS 
} from './initialData';

const STORAGE_KEYS = {
  USERS: 'khanhan_users_v1',
  CURRENT_USER_ID: 'khanhan_current_user_id_v1',
  THERAPISTS: 'khanhan_therapists_v1',
  CONTENT: 'khanhan_content_v1',
  APPOINTMENTS: 'khanhan_appointments_v1',
  REVIEWS: 'khanhan_reviews_v1',
  GAMIFICATION_RULES: 'khanhan_gamification_rules_v1',
  INCIDENTS: 'khanhan_incidents_v1',
  HEALTH_ASSESSMENTS: 'khanhan_health_assessments_v1',
  CONSULTATION_NOTES: 'khanhan_consultation_notes_v1',
  HABIT_LOGS: 'khanhan_habit_logs_v1',
  ZEN_TRANSACTIONS: 'khanhan_zen_txs_v1',
  BOOKMARKS: 'khanhan_bookmarks_v1',
  SPECIALTIES: 'khanhan_specialties_v1'
};

// In-memory active booking locks for high-concurrency simulation (prevents double booking)
const ACTIVE_BOOKING_MUTEX = new Map<string, number>(); // key: `${therapistId}_${date}_${startTime}` => timestamp

export class DataStore {
  private static instance: DataStore;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.initStorage();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  private initStorage(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id); // Default to Client
    }
    if (!localStorage.getItem(STORAGE_KEYS.THERAPISTS)) {
      this.setItem(STORAGE_KEYS.THERAPISTS, INITIAL_THERAPISTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTENT)) {
      this.setItem(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.setItem(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      this.setItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GAMIFICATION_RULES)) {
      this.setItem(STORAGE_KEYS.GAMIFICATION_RULES, INITIAL_GAMIFICATION_RULES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      this.setItem(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENT_ALERTS);
    }
  }

  // --- User Operations ---
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public saveUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
    const user = users.find(u => u.id === currentId);
    return user || users[0];
  }

  public setCurrentUserId(id: string): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  public updateUser(updatedUser: User): void {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this.saveUsers(users);
  }

  // --- Concurrency Atomic Lock (Business Rule 1: Double-Booking Prevention) ---
  public acquireBookingSlotLock(therapistId: string, date: string, startTime: string): boolean {
    const slotKey = `${therapistId}_${date}_${startTime}`;
    const now = Date.now();
    const existingLockTime = ACTIVE_BOOKING_MUTEX.get(slotKey);

    // If locked in last 10 seconds, reject concurrent booking attempt
    if (existingLockTime && now - existingLockTime < 10000) {
      return false; // Concurrency conflict
    }

    // Check confirmed appointments
    const appointments = this.getAppointments();
    const isAlreadyBooked = appointments.some(
      a => a.therapistId === therapistId && a.date === date && a.startTime === startTime && a.status === 'CONFIRMED'
    );
    if (isAlreadyBooked) {
      return false;
    }

    // Acquire lock
    ACTIVE_BOOKING_MUTEX.set(slotKey, now);
    return true;
  }

  public releaseBookingSlotLock(therapistId: string, date: string, startTime: string): void {
    const slotKey = `${therapistId}_${date}_${startTime}`;
    ACTIVE_BOOKING_MUTEX.delete(slotKey);
  }

  // --- Appointments ---
  public getAppointments(): Appointment[] {
    return this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  public saveAppointments(appointments: Appointment[]): void {
    this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  public addAppointment(apt: Appointment): void {
    const list = this.getAppointments();
    this.saveAppointments([apt, ...list]);
  }

  public updateAppointment(updated: Appointment): void {
    const list = this.getAppointments().map(a => a.id === updated.id ? updated : a);
    this.saveAppointments(list);
  }

  // --- Therapists ---
  public getTherapists(): TherapistProfile[] {
    return this.getItem<TherapistProfile[]>(STORAGE_KEYS.THERAPISTS, INITIAL_THERAPISTS);
  }

  public saveTherapists(therapists: TherapistProfile[]): void {
    this.setItem(STORAGE_KEYS.THERAPISTS, therapists);
  }

  // --- Content ---
  public getContent(): WellnessContent[] {
    return this.getItem<WellnessContent[]>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
  }

  public saveContent(content: WellnessContent[]): void {
    this.setItem(STORAGE_KEYS.CONTENT, content);
  }

  // --- Bookmarks ---
  public getBookmarks(userId: string): string[] {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.BOOKMARKS, {});
    return all[userId] || [];
  }

  public toggleBookmark(userId: string, contentId: string): boolean {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.BOOKMARKS, {});
    const userBookmarks = new Set(all[userId] || []);
    let isBookmarked = false;
    if (userBookmarks.has(contentId)) {
      userBookmarks.delete(contentId);
      isBookmarked = false;
    } else {
      userBookmarks.add(contentId);
      isBookmarked = true;
    }
    all[userId] = Array.from(userBookmarks);
    this.setItem(STORAGE_KEYS.BOOKMARKS, all);
    return isBookmarked;
  }

  // --- Reviews ---
  public getReviews(): Review[] {
    return this.getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  public saveReviews(reviews: Review[]): void {
    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
  }

  // --- Health Assessments (Encrypted ePHI) ---
  public getHealthAssessments(): Record<string, SensitiveHealthAssessment> {
    return this.getItem<Record<string, SensitiveHealthAssessment>>(STORAGE_KEYS.HEALTH_ASSESSMENTS, {});
  }

  public saveHealthAssessment(assessment: SensitiveHealthAssessment): void {
    const map = this.getHealthAssessments();
    map[assessment.userId] = assessment;
    this.setItem(STORAGE_KEYS.HEALTH_ASSESSMENTS, map);
  }

  public removeHealthAssessment(userId: string): void {
    const map = this.getHealthAssessments();
    delete map[userId];
    this.setItem(STORAGE_KEYS.HEALTH_ASSESSMENTS, map);
  }

  // --- Consultation Notes (Encrypted ePHI) ---
  public getConsultationNotes(): ConsultationNote[] {
    return this.getItem<ConsultationNote[]>(STORAGE_KEYS.CONSULTATION_NOTES, []);
  }

  public saveConsultationNote(note: ConsultationNote): void {
    const list = this.getConsultationNotes().filter(n => n.id !== note.id);
    this.setItem(STORAGE_KEYS.CONSULTATION_NOTES, [note, ...list]);
  }

  // --- Habit Logs & Gamification ---
  public getHabitLogs(userId: string): HabitLog[] {
    const all = this.getItem<Record<string, HabitLog[]>>(STORAGE_KEYS.HABIT_LOGS, {});
    return all[userId] || [];
  }

  public saveHabitLog(userId: string, log: HabitLog): void {
    const all = this.getItem<Record<string, HabitLog[]>>(STORAGE_KEYS.HABIT_LOGS, {});
    const userLogs = (all[userId] || []).filter(l => l.date !== log.date);
    all[userId] = [log, ...userLogs];
    this.setItem(STORAGE_KEYS.HABIT_LOGS, all);
  }

  public getGamificationRules(): GamificationRule[] {
    return this.getItem<GamificationRule[]>(STORAGE_KEYS.GAMIFICATION_RULES, INITIAL_GAMIFICATION_RULES);
  }

  public saveGamificationRules(rules: GamificationRule[]): void {
    this.setItem(STORAGE_KEYS.GAMIFICATION_RULES, rules);
  }

  public getZenTransactions(userId: string): ZenPointTransaction[] {
    const all = this.getItem<Record<string, ZenPointTransaction[]>>(STORAGE_KEYS.ZEN_TRANSACTIONS, {});
    return all[userId] || [];
  }

  public addZenTransaction(tx: ZenPointTransaction): void {
    const all = this.getItem<Record<string, ZenPointTransaction[]>>(STORAGE_KEYS.ZEN_TRANSACTIONS, {});
    const userTxs = all[tx.userId] || [];
    all[tx.userId] = [tx, ...userTxs];
    this.setItem(STORAGE_KEYS.ZEN_TRANSACTIONS, all);
  }

  // --- Incident Alerts (Decree 356 72-Hour Notification) ---
  public getIncidents(): IncidentAlert[] {
    return this.getItem<IncidentAlert[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENT_ALERTS);
  }

  public saveIncidents(incidents: IncidentAlert[]): void {
    this.setItem(STORAGE_KEYS.INCIDENTS, incidents);
  }

  // Reset to default seeds
  public resetToFactorySeeds(): void {
    localStorage.clear();
    this.initStorage();
    this.notify();
  }
}

export const dataStore = DataStore.getInstance();
