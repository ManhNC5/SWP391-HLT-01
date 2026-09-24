/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Tele-Therapy Booking View (Module 3 - Core Engine)
 * Implements Concurrency Double-Booking Protection & Decree 356 Consent
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  FileText, 
  AlertCircle, 
  Video, 
  Lock, 
  ArrowRight,
  User,
  Info
} from 'lucide-react';
import { User as UserType, TherapistProfile } from '../models/types';
import { dataStore } from '../models/storage';
import { BookingController } from '../controllers/bookingController';
import { MASTER_SPECIALTIES } from '../models/initialData';

interface TeleTherapyViewProps {
  currentUser: UserType;
  selectedTherapistId?: string;
  onBookingSuccess: () => void;
  onOpenAuth: () => void;
}

export const TeleTherapyView: React.FC<TeleTherapyViewProps> = ({
  currentUser,
  selectedTherapistId,
  onBookingSuccess,
  onOpenAuth
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [activeTherapist, setActiveTherapist] = useState<TherapistProfile | null>(() => {
    const list = dataStore.getTherapists();
    if (selectedTherapistId) {
      return list.find(t => t.userId === selectedTherapistId) || list[0];
    }
    return list[0] || null;
  });

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Tomorrow's date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  
  // Strict Business Rule 3: Explicit consent MUST BE UNCHECKED BY DEFAULT
  const [explicitConsent, setExplicitConsent] = useState<boolean>(false);
  // Business Rule 4: Medical Disclaimer
  const [disclaimerConfirmed, setDisclaimerConfirmed] = useState<boolean>(false);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingStatusMessage, setBookingStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const therapists = dataStore.getTherapists().filter(t => t.isVerifiedByAdmin);
  const allUsers = dataStore.getUsers();
  const allReviews = dataStore.getReviews().filter(r => !r.isModerated);

  const filteredTherapists = therapists.filter(t => {
    const u = allUsers.find(user => user.id === t.userId);
    const matchesSpecialty = selectedSpecialty === 'ALL' || t.specialties.includes(selectedSpecialty);
    const matchesKeyword = !searchKeyword.trim() || 
      (u?.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) || 
       t.biography.toLowerCase().includes(searchKeyword.toLowerCase()) ||
       t.specialties.some(s => s.toLowerCase().includes(searchKeyword.toLowerCase())));
    return matchesSpecialty && matchesKeyword;
  });

  const handleOpenSlotModal = (therapist: TherapistProfile, slot: { startTime: string; endTime: string }) => {
    setActiveTherapist(therapist);
    setSelectedSlot(slot);
    setExplicitConsent(false); // ALWAYS RESET UNCHECKED
    setDisclaimerConfirmed(false);
    setBookingStatusMessage(null);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!activeTherapist || !selectedSlot) return;
    const therapistUser = allUsers.find(u => u.id === activeTherapist.userId);
    const therapistName = therapistUser ? therapistUser.fullName : 'Chuyên gia KhanhAn';

    setBookingLoading(true);
    setBookingStatusMessage(null);

    const result = await BookingController.bookAppointment({
      therapistId: activeTherapist.userId,
      therapistName,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      fee: activeTherapist.consultationFee,
      explicitSensitiveDataConsent: explicitConsent,
      medicalDisclaimerAcknowledged: disclaimerConfirmed
    });

    setBookingLoading(false);

    if (result.success) {
      setBookingStatusMessage({ text: result.message, isError: false });
      setTimeout(() => {
        setIsBookingModalOpen(false);
        onBookingSuccess();
      }, 1800);
    } else {
      setBookingStatusMessage({ text: result.message, isError: true });
    }
  };

  // Double Booking Concurrency Simulation Test
  const handleSimulateConcurrencyConflict = async () => {
    if (!activeTherapist || !selectedSlot) return;
    // Simulate another client simultaneously taking this slot
    dataStore.acquireBookingSlotLock(activeTherapist.userId, selectedDate, selectedSlot.startTime);
    setBookingStatusMessage({
      text: 'Đã giả lập tình huống: Khách hàng B vừa giữ chỗ khung giờ này trước bạn 50ms!',
      isError: true
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Đặt lịch Tham vấn Trực tuyến (Tele-Therapy)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
          Đội ngũ Bác sĩ Tâm lý và Chuyên gia Somatic được cấp phép. Cơ chế kiểm soát xung đột đặt trùng lịch (Concurrency Lock) & Tự động tạo link phòng họp an toàn.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Tìm theo tên bác sĩ, chuyên môn (Trầm cảm, Somatic, Mất ngủ)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500 bg-white"
            >
              <option value="ALL">Tất cả chuyên môn trị liệu</option>
              {MASTER_SPECIALTIES.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Therapist List & Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Therapists List */}
        <div className="lg:col-span-7 space-y-6">
          {filteredTherapists.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Không tìm thấy chuyên gia phù hợp với tiêu chí tìm kiếm.
            </div>
          ) : (
            filteredTherapists.map(therapist => {
              const u = allUsers.find(user => user.id === therapist.userId);
              const reviews = allReviews.filter(r => r.therapistId === therapist.userId);
              const isSelected = activeTherapist?.userId === therapist.userId;

              return (
                <div 
                  key={therapist.userId}
                  onClick={() => setActiveTherapist(therapist)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer space-y-4 ${
                    isSelected ? 'border-sky-500 shadow-md ring-1 ring-sky-500/30' : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3.5">
                      <img 
                        src={u?.avatarUrl} 
                        alt={u?.fullName} 
                        className="w-14 h-14 rounded-xl object-cover border border-sky-100 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{u?.fullName}</h3>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Verified CCHN
                          </span>
                        </div>
                        <div className="text-xs text-sky-700 font-medium">{therapist.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          CCHN: {therapist.licenseNumber}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {therapist.consultationFee.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10px] text-slate-400">/ buổi 50 phút</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {therapist.biography}
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {therapist.specialties.map((spec, i) => (
                      <span key={i} className="text-[11px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Rating & Reviews overview */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-slate-800">{therapist.ratingAverage}</span>
                      <span>({reviews.length} đánh giá đã thẩm định)</span>
                    </div>

                    <span className="text-sky-600 font-semibold text-[11px] flex items-center gap-1">
                      Xem lịch làm việc tuần này <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Therapist Detail & Slot Calendar */}
        <div className="lg:col-span-5">
          {activeTherapist ? (
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                  Khung giờ tư vấn trực tuyến
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {allUsers.find(u => u.id === activeTherapist.userId)?.fullName}
                </h2>
                <div className="text-xs text-slate-500">
                  Chọn ngày và khung giờ bạn mong muốn để đặt lịch:
                </div>
              </div>

              {/* Date Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  Ngày tham vấn:
                </label>
                <input 
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Weekly Availability Slots */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    Các khung giờ có sẵn (Slots):
                  </span>
                  <span className="text-[11px] text-slate-400">50 phút / ca</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {activeTherapist.weeklyAvailability[0]?.slots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOpenSlotModal(activeTherapist, slot)}
                      className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all text-xs font-semibold text-sky-900 flex flex-col items-center justify-center cursor-pointer group"
                    >
                      <span>{slot.startTime} - {slot.endTime}</span>
                      <span className="text-[10px] font-normal text-slate-500 group-hover:text-sky-100">
                        {activeTherapist.consultationFee.toLocaleString('vi-VN')} đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security & Concurrency Guarantee Box */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  Bảo đảm Concurrency & Nghị định 356:
                </div>
                <p>
                  Hệ thống tự động khóa mutex để ngăn chặn 2 khách hàng đặt trùng giờ (Double-Booking). Chính sách hoàn tiền 100% nếu hủy trước 24 giờ.
                </p>
              </div>

              {/* Public Reviews List */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800">
                  Đánh giá gần đây từ khách hàng ({allReviews.filter(r => r.therapistId === activeTherapist.userId).length})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allReviews.filter(r => r.therapistId === activeTherapist.userId).map(rev => (
                    <div key={rev.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{rev.clientName}</span>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-normal">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Booking Confirmation Modal (Enforcing Business Rule 1, 3, 4) */}
      {isBookingModalOpen && activeTherapist && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận Đặt lịch Tele-Therapy</h3>
                <p className="text-xs text-slate-500 mt-0.5">Khung giờ: {selectedSlot.startTime} - {selectedSlot.endTime} · Ngày {selectedDate}</p>
              </div>
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Appointment Summary */}
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs space-y-2 text-sky-950">
              <div className="flex justify-between">
                <span className="text-slate-600">Chuyên gia phụ trách:</span>
                <span className="font-bold">{allUsers.find(u => u.id === activeTherapist.userId)?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Học phí / Phí tham vấn:</span>
                <span className="font-bold text-slate-900">{activeTherapist.consultationFee.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số dư ví hiện tại:</span>
                <span className="font-semibold text-emerald-700">{currentUser.walletBalance.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* STRICT BUSINESS RULE 3: UNCHECKED BY DEFAULT CONSENT PER DECREE 356/2025 ARTICLE 6 */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
              <div className="flex items-start gap-2.5">
                <input 
                  type="checkbox"
                  id="decree356Consent"
                  checked={explicitConsent}
                  onChange={(e) => setExplicitConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="decree356Consent" className="text-xs text-amber-950 leading-snug cursor-pointer select-none">
                  <span className="font-bold">Đồng ý xử lý dữ liệu sức khỏe nhạy cảm</span> (Bắt buộc theo Điều 6 Nghị định 356/2025/NĐ-CP): Tôi chủ động đồng ý chia sẻ tình trạng sức khỏe tâm lý của mình cho chuyên gia trị liệu được phân công. (Hộp kiểm không được tích sẵn mặc định).
                </label>
              </div>
            </div>

            {/* STRICT BUSINESS RULE 4: MANDATORY MEDICAL DISCLAIMER */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-start gap-2.5">
                <input 
                  type="checkbox"
                  id="medicalDisclaimerCheck"
                  checked={disclaimerConfirmed}
                  onChange={(e) => setDisclaimerConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="medicalDisclaimerCheck" className="text-xs text-slate-700 leading-snug cursor-pointer select-none">
                  <span className="font-bold">Xác nhận Tuyên bố Miễn trừ Y tế:</span> Tôi hiểu rõ nền tảng KhanhAn cung cấp dịch vụ chăm sóc sức khỏe toàn diện (wellness support) và tham vấn từ xa, không thay thế cho chẩn đoán bệnh lý lâm sàng nội trú hoặc cấp cứu y tế khẩn cấp.
                </label>
              </div>
            </div>

            {/* Status Message */}
            {bookingStatusMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                bookingStatusMessage.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bookingStatusMessage.text}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSimulateConcurrencyConflict}
                className="text-[11px] text-slate-500 hover:text-rose-600 underline cursor-pointer"
                title="Bấm để mô phỏng tình huống hai người đặt cùng lúc để xem Concurrency Lock hoạt động"
              >
                [Kiểm thử Concurrency Conflict]
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer font-medium"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  {bookingLoading ? 'Đang xử lý Mutex Lock...' : 'Xác nhận & Giữ chỗ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
