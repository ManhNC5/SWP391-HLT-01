/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Holistic Wellness & Tele-Therapy Hub
 * MVC Architecture - Domain Models & Data Contracts
 */

export type UserRole = 'CLIENT' | 'THERAPIST' | 'CONTENT_CREATOR' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'ANONYMIZED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: AccountStatus;
  walletBalance: number; // in VND
  zenPoints: number;
  isVip: boolean;
  vipExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  authProvider: 'google' | 'otp' | 'password';
  phoneNumber?: string;
  isHealthProfileConsentGiven?: boolean;
  healthProfileConsentTimestamp?: string;
}

export interface TherapistProfile {
  userId: string;
  title: string; // e.g. "Tiến sĩ Tâm lý học", "Chuyên gia Dinh dưỡng lâm sàng"
  licenseNumber: string; // Số chứng chỉ hành nghề y tế theo Luật 15/2023/QH15
  licenseIssuingAuthority: string;
  certificates: {
    id: string;
    name: string;
    issuedBy: string;
    year: number;
    fileUrl: string;
    verified: boolean;
  }[];
  specialties: string[]; // e.g. ["Anxiety & Stress", "Somatics", "Mindfulness", "Dietetics"]
  biography: string;
  consultationFee: number; // VND per 50-minute slot
  ratingAverage: number;
  ratingCount: number;
  isVerifiedByAdmin: boolean;
  verificationDate?: string;
  weeklyAvailability: {
    dayOfWeek: number; // 1: Mon, 2: Tue, ..., 7: Sun
    slots: {
      startTime: string; // "09:00"
      endTime: string;   // "10:00"
      isActive: boolean;
    }[];
  }[];
}

export interface SensitiveHealthAssessment {
  userId: string;
  isEncrypted: boolean;
  // Encrypted ciphertext payload adhering to HIPAA ePHI & Decree 356/2025
  encryptedPayload: string; 
  iv: string;
  encryptionAlgorithm: 'AES-GCM-256';
  lastUpdated: string;
  consentRecorded: {
    explicitAgreement: boolean;
    decree356ConsentText: string;
    ipAddressRecorded: string;
    timestamp: string;
  };
  // Only accessible after client-side decryption:
  decryptedData?: {
    stressLevel: number; // 1-10
    sleepQuality: 'POOR' | 'MODERATE' | 'GOOD' | 'EXCELLENT';
    primaryConcerns: string[];
    medicalHistoryNotes: string;
    lifestyleFactors: string[];
  };
}

export type AppointmentStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  therapistId: string;
  therapistName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  fee: number;
  status: AppointmentStatus;
  videoMeetingUrl: string; // Google Meet / Zoom link
  medicalDisclaimerAcknowledged: boolean;
  createdAt: string;
  cancelledAt?: string;
  refundPercentage?: number; // 100% if >24h, 0% if <24h
  refundAmount?: number;
  hasClientReviewed?: boolean;
}

export interface ConsultationNote {
  id: string;
  appointmentId: string;
  therapistId: string;
  clientId: string;
  sessionDate: string;
  encryptedContent: string; // AES-GCM-256 encrypted
  iv: string;
  createdAt: string;
  updatedAt: string;
  // Plaintext available only when decrypted by therapist or authorized client
  plaintextNote?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  therapistId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  isModerated: boolean; // Hidden by admin if violates guidelines
  moderationReason?: string;
}

export interface WellnessContent {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Mindfulness' | 'Nutrition' | 'Somatic Therapy' | 'Sleep Health' | 'Physical Recovery';
  mediaType: 'ARTICLE' | 'VIDEO' | 'AUDIO_GUIDE';
  mediaUrl?: string;
  readTimeMinutes: number;
  authorId: string;
  authorName: string;
  authorRole: string;
  isVipOnly: boolean;
  coverImage: string;
  likesCount: number;
  createdAt: string;
  tags: string[];
}

export interface HabitLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  waterGlasses: number; // Goal: 8
  sleepHours: number; // Goal: 7-9
  mood: 'PEACEFUL' | 'GOOD' | 'NEUTRAL' | 'STRESSED' | 'ANXIOUS';
  mindfulnessMinutes: number; // Goal: 15
  completedHabitsCount: number;
  zenPointsEarned: number;
}

export interface ZenPointTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  type: 'EARN' | 'REDEEM';
  createdAt: string;
}

export interface GamificationRule {
  id: string;
  actionCode: string;
  description: string;
  points: number;
  isActive: boolean;
}

export interface IncidentAlert {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedScope: string;
  remedialActions: string;
  reportedAt: string;
  decree356Deadline: string; // 72 hours from incident
  status: 'INVESTIGATING' | 'NOTIFIED_AUTHORITY' | 'NOTIFIED_USERS' | 'RESOLVED';
  broadcastedToUsers: boolean;
}

export interface FinancialMetric {
  totalGrossRevenue: number;
  subscriptionRevenue: number;
  bookingCommissionRevenue: number; // 15% platform fee
  therapistPayoutTotal: number;
  totalRefundsIssued: number;
  totalTransactionsCount: number;
}
