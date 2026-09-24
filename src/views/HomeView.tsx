/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Home View
 * Tone: Minimalist Ocean Blue, High-Trust Healthcare Aesthetic
 */

import React from 'react';
import { 
  ShieldCheck, 
  Stethoscope, 
  Calendar, 
  Sparkles, 
  Lock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  AlertOctagon, 
  Activity,
  Compass,
  FileCheck2
} from 'lucide-react';
import { User, TherapistProfile, WellnessContent } from '../models/types';
import { dataStore } from '../models/storage';

interface HomeViewProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
  onOpenBooking: (therapistId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onNavigate,
  onOpenBooking
}) => {
  const therapists = dataStore.getTherapists().filter(t => t.isVerifiedByAdmin);
  const articles = dataStore.getContent().slice(0, 3);
  const incidents = dataStore.getIncidents().filter(i => i.broadcastedToUsers);

  return (
    <div className="space-y-10 pb-16">
      {/* 72-Hour Decree 356 Emergency Alert Banner (if any) */}
      {incidents.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-2">
                  <span>{incidents[0].title}</span>
                  <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    Điều 5 & 6 NĐ 356/2025
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed">{incidents[0].description}</p>
                <div className="text-amber-700 text-[11px] pt-1 font-medium">
                  Phạm vi: {incidents[0].affectedScope} · Biện pháp: {incidents[0].remedialActions}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-900 via-sky-950 to-slate-900 text-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,165,233,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Chuẩn Y tế Luật 15/2023/QH15 & Nghị định 356/2025/NĐ-CP
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Không gian Trị liệu Tâm lý & Chăm sóc Toàn diện <span className="text-sky-400">KhanhAn</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                Kết nối trực tuyến bảo mật với các Chuyên gia Tâm lý & Bác sĩ được cấp phép hành nghề. Nền tảng hợp nhất theo mô hình MVC, mã hóa dữ liệu bệnh lý AES-GCM và bảo vệ quyền riêng tư tuyệt đối.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('tele-therapy')}
                  className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4 text-slate-950" />
                  Đặt lịch Tham vấn Chuyên gia
                </button>

                <button
                  onClick={() => onNavigate('habits')}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Nhật ký Thói quen & Zen Points
                </button>
              </div>

              {/* Trust Metrics */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-6 text-left">
                <div>
                  <div className="text-2xl font-bold text-sky-400">100%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Chuyên gia có CCHN Y tế</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-sky-400">AES-256</div>
                  <div className="text-xs text-slate-400 mt-0.5">Mã hóa Bệnh án ePHI</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-sky-400">72 Giờ</div>
                  <div className="text-xs text-slate-400 mt-0.5">Cảnh báo vi phạm NĐ 356</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Chỉ số Bình an Hôm nay</div>
                      <div className="text-xs text-slate-400">Cập nhật lúc 08:30 sáng</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Cân bằng tốt
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Nước uống mục tiêu (8 ly):</span>
                    <span className="font-semibold text-white">6 / 8 ly (75%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-sky-400 h-2 rounded-full w-3/4"></div>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 pt-2">
                    <span>Thời gian ngủ sâu:</span>
                    <span className="font-semibold text-white">7.5 giờ (Tối ưu)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-indigo-400 h-2 rounded-full w-4/5"></div>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 pt-2">
                    <span>Điểm thưởng Zen Points:</span>
                    <span className="font-bold text-amber-300">+{currentUser.zenPoints} Zen</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/40 text-[11px] text-sky-200 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    Dữ liệu sức khỏe của bạn được tách biệt và bảo vệ theo tiêu chuẩn HIPAA & Nghị định 356/2025. Super Admin không thể đọc nội dung plaintext.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => onNavigate('tele-therapy')}
            className="group p-6 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              Đặt lịch Tham vấn Trực tuyến
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Khám phá hồ sơ chuyên gia, chứng chỉ hành nghề CCHN, chọn khung giờ linh hoạt và phòng họp video Google Meet bảo mật cao.
            </p>
            <div className="flex items-center text-xs font-semibold text-sky-600 gap-1 pt-1">
              Xem danh sách bác sĩ <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('library')}
            className="group p-6 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Thư viện Wellness & VIP Media
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kho kiến thức GWI chuẩn quốc tế: Somatic Experiencing, Yoga Nidra sóng Delta, Dinh dưỡng kháng viêm chống Burnout.
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1 pt-1">
              Khám phá bài học <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('habits')}
            className="group p-6 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              Nhật ký Thói quen & Zen Points
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Checklist hằng ngày không gây áp lực (theo khuyến cáo WHO), tự động tích lũy Zen Points đổi voucher trị liệu.
            </p>
            <div className="flex items-center text-xs font-semibold text-amber-600 gap-1 pt-1">
              Điểm danh hôm nay <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Therapists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Đội ngũ Chuyên gia được Thẩm định</h2>
            <p className="text-xs text-slate-500 mt-1">
              100% chuyên gia có Chứng chỉ Hành nghề Y tế (CCHN) theo Luật Khám bệnh, chữa bệnh 15/2023/QH15
            </p>
          </div>
          <button 
            onClick={() => onNavigate('tele-therapy')}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
          >
            Xem tất cả chuyên gia <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {therapists.map(therapist => {
            const user = dataStore.getUsers().find(u => u.id === therapist.userId);
            return (
              <div 
                key={therapist.userId}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={user?.avatarUrl} 
                    alt={user?.fullName} 
                    className="w-16 h-16 rounded-xl object-cover border border-sky-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{user?.fullName}</h3>
                      <span className="flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" />
                        Đã xác minh CCHN
                      </span>
                    </div>
                    <div className="text-xs text-sky-700 font-medium">{therapist.title}</div>
                    <div className="text-[11px] text-slate-500">
                      CCHN: {therapist.licenseNumber}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {therapist.biography}
                </p>

                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                  <span className="text-slate-400">Chuyên môn:</span>
                  {therapist.specialties.map((spec, i) => (
                    <span key={i} className="text-slate-700 font-medium">
                      {spec}{i < therapist.specialties.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-medium">Chi phí tham vấn</div>
                    <div className="text-sm font-bold text-slate-900">
                      {therapist.consultationFee.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-slate-500">/ 50 phút</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenBooking(therapist.userId);
                    }}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Xem lịch & Đặt hẹn
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mandatory Medical Disclaimer (Business Rule 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
          <FileCheck2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Tuyên bố Miễn trừ Y tế (Medical Disclaimer):</span> Nền tảng KhanhAn cung cấp giải pháp hỗ trợ chăm sóc sức khỏe toàn diện (wellness support) và tư vấn tâm lý từ xa. Dịch vụ này không thay thế cho việc chẩn đoán y khoa chuyên sâu tại bệnh viện hoặc cấp cứu trong các trường hợp nguy kịch đe dọa tính mạng. Nếu bạn đang ở trong tình huống khẩn cấp, vui lòng gọi 115 hoặc đến cơ sở y tế gần nhất.
          </div>
        </div>
      </section>
    </div>
  );
};
