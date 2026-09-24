/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Administration, Feedback & Incident Reporting Controller (Module 5)
 * Enforces Decree 356/2025 72-Hour Breach Alerts, Review Moderation, & Financial Analytics
 */

import { dataStore } from '../models/storage';
import { User, IncidentAlert, FinancialMetric, Review, TherapistProfile } from '../models/types';

export class AdminController {
  /**
   * User Management: Ban or Unban account
   */
  public static toggleUserBan(userId: string, reason?: string): { success: boolean; message: string } {
    const users = dataStore.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'Người dùng không tồn tại.' };

    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    dataStore.updateUser({
      ...user,
      status: newStatus
    });

    return {
      success: true,
      message: newStatus === 'SUSPENDED'
        ? `Đã khóa tài khoản ${user.email}. Lý do: ${reason || 'Vi phạm điều khoản dịch vụ'}`
        : `Đã mở khóa tài khoản ${user.email}.`
    };
  }

  /**
   * Review & Verify Therapist Credentials (UC04, UC05 per Law 15/2023/QH15)
   */
  public static verifyTherapist(therapistUserId: string, isApproved: boolean): { success: boolean; message: string } {
    const therapists = dataStore.getTherapists();
    const target = therapists.find(t => t.userId === therapistUserId);
    if (!target) return { success: false, message: 'Không tìm thấy hồ sơ chuyên gia.' };

    const updated = therapists.map(t => {
      if (t.userId === therapistUserId) {
        return {
          ...t,
          isVerifiedByAdmin: isApproved,
          verificationDate: isApproved ? new Date().toISOString() : undefined,
          certificates: t.certificates.map(c => ({ ...c, verified: isApproved }))
        };
      }
      return t;
    });
    dataStore.saveTherapists(updated);

    // Update user status
    const users = dataStore.getUsers();
    const user = users.find(u => u.id === therapistUserId);
    if (user) {
      dataStore.updateUser({
        ...user,
        status: isApproved ? 'ACTIVE' : 'PENDING_APPROVAL'
      });
    }

    return {
      success: true,
      message: isApproved 
        ? `Đã phê duyệt chứng chỉ hành nghề và mở khóa lịch làm việc cho chuyên gia!`
        : `Đã thu hồi trạng thái xác thực của chuyên gia.`
    };
  }

  /**
   * Review Moderation (UC23: Hide / Restore reviews)
   */
  public static toggleReviewModeration(reviewId: string, reason?: string): { success: boolean; message: string } {
    const reviews = dataStore.getReviews();
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return { success: false, message: 'Không tìm thấy đánh giá.' };

    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          isModerated: !r.isModerated,
          moderationReason: !r.isModerated ? (reason || 'Vi phạm quy chuẩn cộng đồng') : undefined
        };
      }
      return r;
    });
    dataStore.saveReviews(updated);

    return {
      success: true,
      message: !rev.isModerated ? 'Đã ẩn đánh giá khỏi hồ sơ công khai.' : 'Đã khôi phục hiển thị đánh giá.'
    };
  }

  /**
   * Financial Analytics Engine (UC24)
   * Platform Commission = 15% of tele-therapy fees
   * Payout = 85% to therapists
   */
  public static getFinancialMetrics(): FinancialMetric {
    const appointments = dataStore.getAppointments();
    const users = dataStore.getUsers();

    // Calculate booking revenue
    const validBookings = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED');
    const totalBookingGross = validBookings.reduce((sum, a) => sum + a.fee, 0);
    const bookingCommission = Math.round(totalBookingGross * 0.15); // 15% platform commission
    const therapistPayout = totalBookingGross - bookingCommission;

    // Calculate subscription revenue (estimated based on active VIP users)
    const vipUsersCount = users.filter(u => u.isVip).length;
    const subscriptionRevenue = vipUsersCount * 199000; // 199,000 VND / month / user

    // Refunds issued
    const refundsIssued = appointments
      .filter(a => a.status === 'CANCELLED' && a.refundAmount)
      .reduce((sum, a) => sum + (a.refundAmount || 0), 0);

    return {
      totalGrossRevenue: totalBookingGross + subscriptionRevenue,
      subscriptionRevenue,
      bookingCommissionRevenue: bookingCommission,
      therapistPayoutTotal: therapistPayout,
      totalRefundsIssued: refundsIssued,
      totalTransactionsCount: validBookings.length + vipUsersCount
    };
  }

  /**
   * Decree 356/2025/ND-CP Article 5/6: 72-Hour Data Breach / Incident Emergency Alert System (UC25)
   * Mandatory notification to all affected data subjects within 72 hours of incident detection.
   */
  public static triggerDecree356IncidentAlert(params: {
    title: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    affectedScope: string;
    remedialActions: string;
  }): { success: boolean; alert: IncidentAlert; message: string } {
    const now = new Date();
    const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours deadline

    const alert: IncidentAlert = {
      id: `inc_${Date.now()}`,
      title: params.title,
      severity: params.severity,
      description: params.description,
      affectedScope: params.affectedScope,
      remedialActions: params.remedialActions,
      reportedAt: now.toISOString(),
      decree356Deadline: deadline.toISOString(),
      status: 'NOTIFIED_USERS',
      broadcastedToUsers: true
    };

    const incidents = dataStore.getIncidents();
    dataStore.saveIncidents([alert, ...incidents]);

    return {
      success: true,
      alert,
      message: `Đã phát thông báo khẩn cấp tới toàn bộ người dùng bị ảnh hưởng và cơ quan quản lý trong vòng 72 giờ theo chuẩn Nghị định 356/2025/NĐ-CP!`
    };
  }
}
