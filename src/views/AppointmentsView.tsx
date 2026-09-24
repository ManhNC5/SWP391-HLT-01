/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Appointments Management & Consultation Notes View (Module 3 & 5)
 * Enforces 24-hour refund calculation and HIPAA-blinded encrypted notes
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  FileText, 
  Star, 
  Key, 
  ExternalLink, 
  ShieldAlert,
  ChevronRight,
  Send
} from 'lucide-react';
import { User, Appointment, ConsultationNote, Review } from '../models/types';
import { dataStore } from '../models/storage';
import { BookingController } from '../controllers/bookingController';

interface AppointmentsViewProps {
  currentUser: User;
  onNavigateToBooking: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  currentUser,
  onNavigateToBooking
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Notes Modal State
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Simulated Tele-Therapy Call Room State
  const [activeCallAppointment, setActiveCallAppointment] = useState<Appointment | null>(null);

  // Action messages
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const appointments = dataStore.getAppointments().filter(apt => {
    if (currentUser.role === 'CLIENT') {
      return apt.clientId === currentUser.id;
    }
    if (currentUser.role === 'THERAPIST') {
      return apt.therapistId === currentUser.id;
    }
    // Admin can view all appointments for system auditing
    return true;
  });

  const upcomingList = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');
  const pastList = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');
  const currentList = activeSubTab === 'UPCOMING' ? upcomingList : pastList;

  const handleCancelAppointment = (apt: Appointment) => {
    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy lịch hẹn lúc ${apt.startTime} ngày ${apt.date}?`);
    if (!confirmCancel) return;

    const result = BookingController.cancelAppointment(apt.id);
    setActionNotice(result.message);
  };

  const handleOpenNotes = async (apt: Appointment) => {
    setSelectedAppointment(apt);
    setDecryptedText(null);
    setDecryptionError(null);
    setNoteContent('');
    setIsNotesModalOpen(true);

    const existingNote = dataStore.getConsultationNotes().find(n => n.appointmentId === apt.id);
    if (existingNote) {
      setIsDecrypting(true);
      const res = await BookingController.getDecryptedConsultationNote(existingNote);
      setIsDecrypting(false);
      if (res.isDecrypted) {
        setDecryptedText(res.plaintext);
        setNoteContent(res.plaintext);
      } else {
        setDecryptionError(res.plaintext); // error message or admin blinded message
      }
    }
  };

  const handleSaveNote = async () => {
    if (!selectedAppointment || !noteContent.trim()) return;
    setSavingNote(true);
    const res = await BookingController.saveConsultationNote(
      selectedAppointment.id,
      selectedAppointment.clientId,
      noteContent
    );
    setSavingNote(false);
    if (res.success) {
      setActionNotice(res.message);
      setIsNotesModalOpen(false);
    }
  };

  const handleOpenReview = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setReviewRating(5);
    setReviewComment('');
    setReviewSuccessMsg(null);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedAppointment || !reviewComment.trim()) return;
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      appointmentId: selectedAppointment.id,
      therapistId: selectedAppointment.therapistId,
      clientId: currentUser.id,
      clientName: currentUser.fullName,
      clientAvatar: currentUser.avatarUrl,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
      isModerated: false
    };

    const reviews = dataStore.getReviews();
    dataStore.saveReviews([newRev, ...reviews]);

    // Mark appointment as reviewed
    dataStore.updateAppointment({
      ...selectedAppointment,
      hasClientReviewed: true
    });

    setReviewSuccessMsg('Cảm ơn bạn đã gửi đánh giá! Đánh giá sẽ hiển thị trên hồ sơ chuyên gia sau khi qua bộ lọc kiểm duyệt.');
    setTimeout(() => {
      setIsReviewModalOpen(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentUser.role === 'THERAPIST' ? 'Lịch hẹn Bệnh nhân & Hồ sơ Tham vấn' : 'Lịch hẹn Tham vấn của tôi'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các ca tư vấn, phòng họp Google Meet trực tuyến và ghi chép bệnh án mã hóa bảo mật.
          </p>
        </div>

        {currentUser.role === 'CLIENT' && (
          <button
            onClick={onNavigateToBooking}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            + Đặt thêm ca tư vấn
          </button>
        )}
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-sky-600 hover:text-sky-950 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Business Rule 2 Notice */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Chính sách hoàn hủy (Quy tắc nghiệp vụ 2):</strong> Hủy trước 24 giờ hoàn 100% học phí về ví; hủy trong vòng 24 giờ không hoàn tiền (0%).
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('UPCOMING')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'UPCOMING'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sắp diễn ra ({upcomingList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('PAST')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'PAST'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Lịch sử & Đã hoàn thành ({pastList.length})
        </button>
      </div>

      {/* Appointments Grid */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs text-slate-500">Chưa có lịch hẹn nào trong danh mục này.</div>
            {currentUser.role === 'CLIENT' && (
              <button
                onClick={onNavigateToBooking}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
              >
                Khám phá danh sách chuyên gia để đặt lịch ngay →
              </button>
            )}
          </div>
        ) : (
          currentList.map(apt => {
            const isConfirmed = apt.status === 'CONFIRMED';
            const isCompleted = apt.status === 'COMPLETED';
            const isCancelled = apt.status === 'CANCELLED';

            return (
              <div 
                key={apt.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-sky-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Block */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isConfirmed ? 'bg-sky-50 text-sky-700' :
                      isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {apt.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">#{apt.id.slice(0, 12)}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {currentUser.role === 'THERAPIST' ? `Khách hàng: ${apt.clientName}` : `Chuyên gia: ${apt.therapistName}`}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {apt.startTime} - {apt.endTime}
                    </span>
                    <span>Học phí: {apt.fee.toLocaleString('vi-VN')} đ</span>
                  </div>

                  {/* Refund notice if cancelled */}
                  {isCancelled && apt.refundAmount !== undefined && (
                    <div className="text-[11px] text-slate-500 font-medium pt-1">
                      Chính sách hủy: Hoàn {apt.refundPercentage}% ({apt.refundAmount.toLocaleString('vi-VN')} đ đã về ví)
                    </div>
                  )}
                </div>

                {/* Actions Block */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Join Video Call */}
                  {isConfirmed && (
                    <button
                      onClick={() => setActiveCallAppointment(apt)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Vào phòng Meet
                    </button>
                  )}

                  {/* Consultation Notes (HIPAA Encrypted) */}
                  {(isConfirmed || isCompleted) && (
                    <button
                      onClick={() => handleOpenNotes(apt)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      Ghi chú Bệnh án (ePHI)
                    </button>
                  )}

                  {/* Review Button for Client (UC21) */}
                  {isCompleted && currentUser.role === 'CLIENT' && !apt.hasClientReviewed && (
                    <button
                      onClick={() => handleOpenReview(apt)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Viết đánh giá
                    </button>
                  )}

                  {/* Cancel Button (Subject to 24-hr policy) */}
                  {isConfirmed && (
                    <button
                      onClick={() => handleCancelAppointment(apt)}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Hủy lịch hẹn
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Simulated Video Call Room Modal */}
      {activeCallAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <div className="text-sm font-bold">Phòng Tư vấn Trực tuyến Google Meet (Bảo mật HIPAA)</div>
                <div className="text-xs text-slate-400">
                  {activeCallAppointment.startTime} - {activeCallAppointment.endTime} · Chuyên gia: {activeCallAppointment.therapistName} · Khách hàng: {activeCallAppointment.clientName}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveCallAppointment(null)}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
            >
              Rời phòng họp
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-4 text-white">
              <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold">Phiên tham vấn đang hoạt động</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Đường truyền mã hóa đầu-cuối WebRTC / Google Workspace API.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-sky-400 select-all">
                {activeCallAppointment.videoMeetingUrl}
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <a
                  href={activeCallAppointment.videoMeetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở trên Tab mới
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Notes Modal (Business Rule 5 & HIPAA ePHI) */}
      {isNotesModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5 text-sky-700 text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  Bệnh án Tham vấn ePHI (Mã hóa AES-GCM-256)
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Phiên ngày {selectedAppointment.date} ({selectedAppointment.startTime} - {selectedAppointment.endTime})
                </h3>
              </div>
              <button 
                onClick={() => setIsNotesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Admin Blinded Notice */}
            {currentUser.role === 'ADMIN' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  GIỚI HẠN KỸ THUẬT HIPAA / NGHỊ ĐỊNH 356 (ADMIN BLINDED):
                </div>
                <p>
                  Theo Quy tắc Bảo mật ePHI (HIPAA Security Rule) và Điều 4 Nghị định 356/2025/NĐ-CP, tài khoản Quản trị viên (Super Admin) bị chặn kỹ thuật và không thể giải mã nội dung bệnh án tham vấn cá nhân. Chỉ có Chuyên gia phụ trách và Khách hàng mới sở hữu khóa giải mã.
                </p>
              </div>
            )}

            {isDecrypting ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Đang giải mã bằng thuật toán AES-GCM-256...
              </div>
            ) : decryptionError ? (
              <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-700 leading-relaxed font-mono">
                {decryptionError}
              </div>
            ) : currentUser.role === 'THERAPIST' ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 block">
                  Ghi chép chẩn đoán & Hướng dẫn phục hồi của Bác sĩ:
                </label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Nhập ghi chú tiến trình cảm xúc, phản xạ thể chất Somatic, bài tập hơi thở được giao..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 leading-relaxed font-sans"
                />
                <div className="text-[11px] text-slate-400">
                  * Dữ liệu sẽ được mã hóa tại trình duyệt (Client-side) trước khi gửi lưu trữ.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">Nội dung đã giải mã an toàn:</div>
                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {decryptedText || 'Chưa có ghi chú nào được lưu cho buổi tham vấn này.'}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer font-medium"
              >
                Đóng
              </button>

              {currentUser.role === 'THERAPIST' && (
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {savingNote ? 'Đang mã hóa AES...' : 'Mã hóa & Lưu Bệnh án'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (UC21) */}
      {isReviewModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900">
              Đánh giá phiên tham vấn cùng {selectedAppointment.therapistName}
            </h3>

            {reviewSuccessMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                {reviewSuccessMsg}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Mức độ hài lòng:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-400 focus:outline-hidden cursor-pointer"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-2">{reviewRating} / 5 Sao</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nhận xét chi tiết:</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về sự lắng nghe, chuyên môn và hiệu quả sau phiên tham vấn..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
