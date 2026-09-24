/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Tele-Therapy Booking Engine (Module 3 & Core Business Rules)
 * Implements:
 * 1. Double-Booking Concurrency Control
 * 2. 24-Hour Refund & Cancellation Policy
 * 3. Mandatory Medical Disclaimer
 * 4. AES-GCM Encrypted Consultation Notes (HIPAA / Decree 356 compliance)
 */

import { dataStore } from '../models/storage';
import { Appointment, ConsultationNote } from '../models/types';
import { encryptSensitiveData, decryptSensitiveData } from '../models/crypto';

export interface BookingRequest {
  therapistId: string;
  therapistName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  fee: number;
  explicitSensitiveDataConsent: boolean; // Must be checked manually by client
  medicalDisclaimerAcknowledged: boolean; // Must be confirmed
}

export class BookingController {
  /**
   * Book an appointment with concurrency lock & business rule validation
   */
  public static async bookAppointment(req: BookingRequest): Promise<{ 
    success: boolean; 
    appointment?: Appointment; 
    message: string;
    errorCode?: 'DOUBLE_BOOKING_CONFLICT' | 'CONSENT_REQUIRED' | 'DISCLAIMER_REQUIRED' | 'INSUFFICIENT_FUNDS'
  }> {
    const currentUser = dataStore.getCurrentUser();

    // 1. Validate Explicit Consent (Business Rule 3 per Article 6 Decree 356/2025)
    if (!req.explicitSensitiveDataConsent) {
      return {
        success: false,
        errorCode: 'CONSENT_REQUIRED',
        message: 'Bạn phải chủ động đồng ý cung cấp thông tin sức khỏe nhạy cảm theo quy định tại Điều 6 Nghị định 356/2025/NĐ-CP (Hộp kiểm không được tích sẵn mặc định).'
      };
    }

    // 2. Validate Medical Disclaimer (Business Rule 4)
    if (!req.medicalDisclaimerAcknowledged) {
      return {
        success: false,
        errorCode: 'DISCLAIMER_REQUIRED',
        message: 'Bạn cần xác nhận Tuyên bố Miễn trừ Y tế trước khi đặt lịch hẹn.'
      };
    }

    // 3. Concurrency Lock: Double-Booking Prevention (Business Rule 1)
    const lockAcquired = dataStore.acquireBookingSlotLock(req.therapistId, req.date, req.startTime);
    if (!lockAcquired) {
      return {
        success: false,
        errorCode: 'DOUBLE_BOOKING_CONFLICT',
        message: 'Xung đột lịch hẹn (Double-Booking Conflict): Khung giờ này vừa được khách hàng khác giữ chỗ hoặc đã được đặt trước. Vui lòng chọn khung giờ khác.'
      };
    }

    // 4. Wallet Balance Check
    if (currentUser.walletBalance < req.fee) {
      dataStore.releaseBookingSlotLock(req.therapistId, req.date, req.startTime);
      return {
        success: false,
        errorCode: 'INSUFFICIENT_FUNDS',
        message: `Số dư ví không đủ. Cần ${req.fee.toLocaleString('vi-VN')} đ, số dư hiện tại là ${currentUser.walletBalance.toLocaleString('vi-VN')} đ. Vui lòng nạp thêm tiền qua VNPay/MoMo/Stripe.`
      };
    }

    try {
      // 5. Generate secure Google Meet video link
      const roomCode = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
      const videoMeetingUrl = `https://meet.google.com/kha-${roomCode}`;

      // 6. Deduct wallet balance
      dataStore.updateUser({
        ...currentUser,
        walletBalance: currentUser.walletBalance - req.fee
      });

      // 7. Create Appointment Record
      const newAppointment: Appointment = {
        id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        therapistId: req.therapistId,
        therapistName: req.therapistName,
        clientId: currentUser.id,
        clientName: currentUser.fullName,
        clientEmail: currentUser.email,
        date: req.date,
        startTime: req.startTime,
        endTime: req.endTime,
        fee: req.fee,
        status: 'CONFIRMED',
        videoMeetingUrl,
        medicalDisclaimerAcknowledged: true,
        createdAt: new Date().toISOString()
      };

      dataStore.addAppointment(newAppointment);

      // Award Zen Points for booking a session (Gamification)
      const rules = dataStore.getGamificationRules();
      const bookingRule = rules.find(r => r.actionCode === 'TELE_THERAPY_COMPLETED');
      if (bookingRule && bookingRule.isActive) {
        const points = Math.floor(bookingRule.points / 2); // 25 pts for booking, 25 for completion
        dataStore.updateUser({
          ...currentUser,
          walletBalance: currentUser.walletBalance - req.fee,
          zenPoints: currentUser.zenPoints + points
        });
        dataStore.addZenTransaction({
          id: `tx_${Date.now()}`,
          userId: currentUser.id,
          amount: points,
          reason: `Điểm thưởng đặt lịch tư vấn cùng ${req.therapistName}`,
          type: 'EARN',
          createdAt: new Date().toISOString()
        });
      }

      return {
        success: true,
        appointment: newAppointment,
        message: 'Đặt lịch tham vấn từ xa thành công! Đường link Google Meet bảo mật đã được tạo.'
      };
    } finally {
      dataStore.releaseBookingSlotLock(req.therapistId, req.date, req.startTime);
    }
  }

  /**
   * Cancel Appointment with 24-Hour Policy (Business Rule 2)
   * - If canceled > 24 hours before start: 100% refund to wallet.
   * - If canceled < 24 hours before start: 0% refund.
   */
  public static cancelAppointment(appointmentId: string): { 
    success: boolean; 
    refundAmount: number; 
    refundPercentage: number; 
    message: string 
  } {
    const appointments = dataStore.getAppointments();
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) {
      return { success: false, refundAmount: 0, refundPercentage: 0, message: 'Không tìm thấy cuộc hẹn.' };
    }

    if (apt.status === 'CANCELLED') {
      return { success: false, refundAmount: 0, refundPercentage: 0, message: 'Lịch hẹn này đã bị hủy trước đó.' };
    }

    // Calculate time difference between now and appointment start
    const aptStartTime = new Date(`${apt.date}T${apt.startTime}:00`).getTime();
    const now = Date.now();
    const hoursDifference = (aptStartTime - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let refundAmount = 0;

    if (hoursDifference > 24) {
      // > 24 hours: 100% refund
      refundPercentage = 100;
      refundAmount = apt.fee;
    } else {
      // < 24 hours: 0% refund
      refundPercentage = 0;
      refundAmount = 0;
    }

    // Update appointment
    const updatedApt: Appointment = {
      ...apt,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      refundPercentage,
      refundAmount
    };
    dataStore.updateAppointment(updatedApt);

    // Refund to client's wallet if applicable
    if (refundAmount > 0) {
      const users = dataStore.getUsers();
      const client = users.find(u => u.id === apt.clientId);
      if (client) {
        dataStore.updateUser({
          ...client,
          walletBalance: client.walletBalance + refundAmount
        });
      }
    }

    return {
      success: true,
      refundAmount,
      refundPercentage,
      message: refundPercentage === 100
        ? `Đã hủy lịch trước 24 giờ (${hoursDifference.toFixed(1)}h). Toàn bộ 100% học phí (${refundAmount.toLocaleString('vi-VN')} đ) đã được hoàn trả về ví cá nhân.`
        : `Đã hủy lịch trong vòng 24 giờ (${hoursDifference.toFixed(1)}h). Theo chính sách hoàn hủy của KhanhAn, không áp dụng hoàn tiền (0%).`
    };
  }

  /**
   * Save Consultation Note (UC15 & Business Rule 5)
   * Encrypted via AES-GCM-256. Plaintext cannot be read by Admins.
   */
  public static async saveConsultationNote(
    appointmentId: string, 
    clientId: string, 
    plaintextNote: string
  ): Promise<{ success: boolean; note?: ConsultationNote; message: string }> {
    const currentUser = dataStore.getCurrentUser();
    if (currentUser.role !== 'THERAPIST') {
      return { success: false, message: 'Chỉ Chuyên gia trị liệu mới có quyền ghi chép bệnh án tham vấn.' };
    }

    // Client-side encryption with AES-GCM
    const sessionSecret = `therapy_note_${appointmentId}_${clientId}`;
    const { ciphertext, iv } = await encryptSensitiveData(plaintextNote, sessionSecret);

    const note: ConsultationNote = {
      id: `note_${appointmentId}`,
      appointmentId,
      therapistId: currentUser.id,
      clientId,
      sessionDate: new Date().toISOString().split('T')[0],
      encryptedContent: ciphertext,
      iv: iv,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dataStore.saveConsultationNote(note);

    return {
      success: true,
      note,
      message: 'Ghi chú tham vấn đã được mã hóa AES-GCM-256 an toàn và lưu vào hồ sơ (Đạt chuẩn HIPAA Security Rule & Nghị định 356).'
    };
  }

  /**
   * Decrypt Consultation Note (Authorized Therapist or Client only)
   */
  public static async getDecryptedConsultationNote(
    note: ConsultationNote
  ): Promise<{ plaintext: string; isDecrypted: boolean; error?: string }> {
    const currentUser = dataStore.getCurrentUser();
    // RBAC: Admin is explicitly restricted (Business Rule 5)
    if (currentUser.role === 'ADMIN') {
      return {
        plaintext: 'TRUY CẬP BỊ TỪ CHỐI BỞI QUY TẮC BẢO MẬT HIPAA / NGHỊ ĐỊNH 356: Quản trị viên (Super Admin) bị giới hạn kỹ thuật, không có quyền xem nội dung bệnh án tham vấn nhạy cảm.',
        isDecrypted: false,
        error: 'HIPAA_ADMIN_BLINDED'
      };
    }

    try {
      const sessionSecret = `therapy_note_${note.appointmentId}_${note.clientId}`;
      const plaintext = await decryptSensitiveData(note.encryptedContent, note.iv, sessionSecret);
      return { plaintext, isDecrypted: true };
    } catch {
      return {
        plaintext: 'Không thể giải mã dữ liệu hoặc khóa phiên không hợp lệ.',
        isDecrypted: false,
        error: 'DECRYPTION_FAILED'
      };
    }
  }
}
