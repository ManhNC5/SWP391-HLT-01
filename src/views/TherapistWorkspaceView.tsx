/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Therapist Workspace View (Module 3 - UC11 & UC04)
 * Schedule configuration, fee settings, and credential submission
 */

import React, { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2,
  FileCheck
} from 'lucide-react';
import { User, TherapistProfile } from '../models/types';
import { dataStore } from '../models/storage';

interface TherapistWorkspaceViewProps {
  currentUser: User;
}

export const TherapistWorkspaceView: React.FC<TherapistWorkspaceViewProps> = ({ currentUser }) => {
  const therapists = dataStore.getTherapists();
  const currentProfile = therapists.find(t => t.userId === currentUser.id) || {
    userId: currentUser.id,
    title: 'Chuyên gia Tâm lý học & Trị liệu',
    licenseNumber: '029911/BYT-CCHN',
    licenseIssuingAuthority: 'Sở Y tế',
    certificates: [],
    specialties: ['Anxiety & Stress', 'Mindfulness'],
    biography: 'Chuyên gia đồng hành hỗ trợ phục hồi sức khỏe tinh thần.',
    consultationFee: 400000,
    ratingAverage: 5.0,
    ratingCount: 0,
    isVerifiedByAdmin: true,
    weeklyAvailability: [
      {
        dayOfWeek: 1,
        slots: [
          { startTime: '09:00', endTime: '10:00', isActive: true },
          { startTime: '14:00', endTime: '15:00', isActive: true }
        ]
      }
    ]
  };

  const [fee, setFee] = useState<number>(currentProfile.consultationFee);
  const [title, setTitle] = useState(currentProfile.title);
  const [bio, setBio] = useState(currentProfile.biography);
  const [slots, setSlots] = useState(currentProfile.weeklyAvailability[0]?.slots || []);
  const [newSlotStart, setNewSlotStart] = useState('16:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:00');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleAddSlot = () => {
    if (!newSlotStart || !newSlotEnd) return;
    setSlots([...slots, { startTime: newSlotStart, endTime: newSlotEnd, isActive: true }]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSaveProfile = () => {
    const updated: TherapistProfile = {
      ...currentProfile,
      title,
      consultationFee: fee,
      biography: bio,
      weeklyAvailability: [
        {
          dayOfWeek: 1,
          slots: slots
        }
      ]
    };

    const allTherapists = dataStore.getTherapists();
    const exists = allTherapists.some(t => t.userId === currentUser.id);
    if (exists) {
      dataStore.saveTherapists(allTherapists.map(t => t.userId === currentUser.id ? updated : t));
    } else {
      dataStore.saveTherapists([...allTherapists, updated]);
    }

    setSavedNotice('Đã lưu cấu hình lịch làm việc & học phí thành công!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Bàn làm việc Chuyên gia & Quản lý Lịch (UC11)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Thiết lập biểu phí tham vấn, khung giờ trực tuyến trong tuần và quản lý chứng chỉ hành nghề Y tế.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200">
          {savedNotice}
        </div>
      )}

      {/* Licensing Status Card (Law 15/2023/QH15) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Hồ sơ Chứng chỉ Hành nghề Y tế (Luật 15/2023/QH15 - UC04)
            </h3>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 ${
            currentProfile.isVerifiedByAdmin ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {currentProfile.isVerifiedByAdmin ? 'Đã được DPO/Admin Thẩm định' : 'Chờ kiểm duyệt chứng chỉ'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="text-slate-500 font-medium">Số Giấy phép / CCHN:</div>
            <div className="font-bold text-slate-900">{currentProfile.licenseNumber}</div>
            <div className="text-[11px] text-slate-400">Cơ quan cấp: {currentProfile.licenseIssuingAuthority}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="text-slate-500 font-medium">Danh mục chứng chỉ bổ sung:</div>
            <div className="font-semibold text-slate-800">
              {currentProfile.certificates.length > 0 
                ? currentProfile.certificates.map(c => c.name).join(', ') 
                : 'Chứng nhận Somatic Experiencing Practitioner (SEP)'}
            </div>
          </div>
        </div>
      </div>

      {/* Fee & Title Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Thiết lập Biểu phí & Thông tin Chuyên môn (UC11)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Chức danh chuyên môn hiển thị:</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Mức phí tham vấn (VND / buổi 50 phút):</label>
            <input 
              type="number"
              value={fee}
              onChange={(e) => setFee(parseInt(e.target.value) || 0)}
              step={10000}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500 font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-slate-700">Giới thiệu kinh nghiệm (Bio):</label>
          <textarea 
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500 font-sans"
          />
        </div>
      </div>

      {/* Weekly Availability Slot Manager (UC11) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Quản lý Khung giờ làm việc trong tuần (Slots)</h3>
            <p className="text-xs text-slate-500">Khách hàng sẽ chỉ có thể đặt lịch trong các khung giờ đang kích hoạt này.</p>
          </div>
        </div>

        {/* Existing Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {slots.map((slot, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 flex items-center justify-between text-xs font-semibold text-sky-950"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>{slot.startTime} - {slot.endTime}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSlot(idx)}
                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                title="Xóa ca này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Slot */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-end gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Giờ bắt đầu:</label>
            <input 
              type="time" 
              value={newSlotStart} 
              onChange={(e) => setNewSlotStart(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Giờ kết thúc:</label>
            <input 
              type="time" 
              value={newSlotEnd} 
              onChange={(e) => setNewSlotEnd(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleAddSlot}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm Khung giờ
          </button>
        </div>
      </div>
    </div>
  );
};
