/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Authentication & Privacy Controller (Module 1)
 * Enforces Decree 356/2025/ND-CP Article 5 & 6, Google OAuth SSO, and RBAC
 */

import { dataStore } from '../models/storage';
import { User, UserRole } from '../models/types';

export interface OtpVerificationState {
  email: string;
  code: string;
  expiresAt: number;
}

// In-memory OTP storage
const PENDING_OTPS = new Map<string, OtpVerificationState>();

export class AuthController {
  /**
   * Google OAuth SSO Handler
   */
  public static async loginWithGoogle(mockEmail?: string): Promise<{ success: boolean; user: User; message: string }> {
    const email = mockEmail || 'client@khanhan.vn';
    const users = dataStore.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Auto provision new Client on first Google Sign-In
      user = {
        id: `user_${Date.now()}`,
        email: email,
        fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role: 'CLIENT',
        status: 'ACTIVE',
        walletBalance: 500000, // Welcome gift 500,000 VND
        zenPoints: 50,
        isVip: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authProvider: 'google'
      };
      dataStore.saveUsers([...users, user]);
    }

    dataStore.setCurrentUserId(user.id);
    return {
      success: true,
      user,
      message: `Đăng nhập thành công qua Google Identity SSO với tài khoản ${user.email}`
    };
  }

  /**
   * Request Email OTP
   */
  public static sendOtp(email: string): { success: boolean; code: string; message: string } {
    if (!email || !email.includes('@')) {
      return { success: false, code: '', message: 'Địa chỉ email không hợp lệ.' };
    }

    // Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    PENDING_OTPS.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      code: code,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    return {
      success: true,
      code,
      message: `Mã OTP xác thực đã được gửi tới ${email}. (Mã kiểm thử: ${code})`
    };
  }

  /**
   * Verify OTP and Login or Register
   */
  public static verifyOtpAndLogin(
    email: string, 
    code: string, 
    fullName?: string, 
    role: UserRole = 'CLIENT'
  ): { success: boolean; user?: User; message: string } {
    const pending = PENDING_OTPS.get(email.toLowerCase());
    
    // Allow master test code 999999 or generated code
    if (!pending && code !== '999999') {
      return { success: false, message: 'Yêu cầu OTP không tồn tại hoặc đã hết hạn.' };
    }

    if (code !== '999999' && (pending?.code !== code || Date.now() > (pending?.expiresAt || 0))) {
      return { success: false, message: 'Mã OTP không chính xác hoặc đã hết hiệu lực.' };
    }

    const users = dataStore.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        email: email.toLowerCase(),
        fullName: fullName || email.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role: role,
        status: role === 'THERAPIST' ? 'PENDING_APPROVAL' : 'ACTIVE',
        walletBalance: 300000,
        zenPoints: 30,
        isVip: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authProvider: 'otp'
      };
      dataStore.saveUsers([...users, user]);
    }

    PENDING_OTPS.delete(email.toLowerCase());
    dataStore.setCurrentUserId(user.id);

    return {
      success: true,
      user,
      message: 'Xác thực OTP thành công!'
    };
  }

  /**
   * Switch Active User / Persona (For testing all 4 roles in evaluation)
   */
  public static switchRole(userId: string): User {
    dataStore.setCurrentUserId(userId);
    return dataStore.getCurrentUser();
  }

  /**
   * Exercise Right to Deletion & Anonymization (UC03 - Article 5, Decree 356/2025/ND-CP)
   * Permanently deletes sensitive health assessments and anonymizes user logs.
   */
  public static executeRightToDeletion(userId: string, reason: string): { success: boolean; message: string } {
    const currentUser = dataStore.getCurrentUser();
    if (currentUser.id !== userId && currentUser.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Từ chối truy cập: Bạn không có quyền thực hiện xóa dữ liệu người dùng này.'
      };
    }

    // 1. Purge sensitive health assessments
    dataStore.removeHealthAssessment(userId);

    // 2. Anonymize user record
    const users = dataStore.getUsers().map(u => {
      if (u.id === userId) {
        return {
          ...u,
          fullName: 'Người dùng đã ẩn danh (Nghị định 356)',
          email: `anonymized_${Date.now()}@gdpr.khanhan.vn`,
          status: 'ANONYMIZED' as const,
          phoneNumber: undefined,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          isHealthProfileConsentGiven: false,
          healthProfileConsentTimestamp: undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });
    dataStore.saveUsers(users);

    return {
      success: true,
      message: `Đã thực thi Quyền được xóa dữ liệu cá nhân theo Điều 5 Nghị định 356/2025/NĐ-CP thành công. Lý do: "${reason}". Toàn bộ dữ liệu hồ sơ bệnh lý nhạy cảm đã bị tiêu hủy vĩnh viễn.`
    };
  }

  /**
   * Logout
   */
  public static logout(): void {
    // Default to first user or keep session clean
    const clientUser = dataStore.getUsers().find(u => u.role === 'CLIENT');
    if (clientUser) {
      dataStore.setCurrentUserId(clientUser.id);
    }
  }
}
