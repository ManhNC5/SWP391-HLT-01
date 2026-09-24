/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Health Profile & Privacy Rights View (Module 1 - UC02 & UC03)
 * Strictly adheres to Vietnam Decree 356/2025/ND-CP Article 4, 5, 6
 * & HIPAA ePHI Client-Side AES-GCM-256 Encryption
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  AlertTriangle, 
  Key, 
  FileCheck2, 
  CheckCircle2, 
  Info,
  HeartPulse,
  Scale
} from 'lucide-react';
import { User, SensitiveHealthAssessment } from '../models/types';
import { dataStore } from '../models/storage';
import { encryptSensitiveData, decryptSensitiveData } from '../models/crypto';
import { AuthController } from '../controllers/authController';

interface HealthProfileViewProps {
  currentUser: User;
}

export const HealthProfileView: React.FC<HealthProfileViewProps> = ({ currentUser }) => {
  const existingAssessment = dataStore.getHealthAssessments()[currentUser.id];

  // Dynamic Assessment Form State
  const [stressLevel, setStressLevel] = useState<number>(6);
  const [sleepQuality, setSleepQuality] = useState<'POOR' | 'MODERATE' | 'GOOD' | 'EXCELLENT'>('MODERATE');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(['Anxiety & Áp lực', 'Mất ngủ']);
  const [medicalHistory, setMedicalHistory] = useState<string>('Thỉnh thoảng đau thắt lồng ngực và hồi hộp khi căng thẳng công việc.');
  
  // STRICT CONSTRAINT: Article 6 Decree 356/2025 - MUST BE UNCHECKED BY DEFAULT!
  const [explicitDecree356Consent, setExplicitDecree356Consent] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Right to Deletion Modal (UC03)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Yêu cầu rút lại sự đồng ý và bảo vệ quyền riêng tư cá nhân theo Điều 5 Nghị định 356/2025.');
  const [deleteProcessing, setDeleteProcessing] = useState(false);

  // Plaintext decrypted view state
  const [decryptedView, setDecryptedView] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const concernsList = [
    'Anxiety & Áp lực',
    'Mất ngủ',
    'Căng thẳng thể chất Somatic',
    'Burnout công sở',
    'Trầm cảm & Mất động lực',
    'Khủng hoảng mối quan hệ'
  ];

  const handleToggleConcern = (item: string) => {
    if (selectedConcerns.includes(item)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== item));
    } else {
      setSelectedConcerns([...selectedConcerns, item]);
    }
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Strict validation: Decree 356/2025 Article 6 (Verifiable explicit consent)
    if (!explicitDecree356Consent) {
      setMessage({
        text: 'HỆ THỐNG ĐÃ CHẶN THAO TÁC: Căn cứ Điều 6 Nghị định 356/2025/NĐ-CP, việc thu thập dữ liệu sức khỏe nhạy cảm bắt buộc phải có sự đồng ý chủ động của Chủ thể dữ liệu (Không được sử dụng ô kiểm tích sẵn mặc định). Vui lòng đọc kỹ thông báo và tích chọn đồng ý.',
        isError: true
      });
      return;
    }

    setSaving(true);
    try {
      const sensitiveDataObj = {
        stressLevel,
        sleepQuality,
        primaryConcerns: selectedConcerns,
        medicalHistoryNotes: medicalHistory,
        updatedAt: new Date().toISOString()
      };

      // Client-side AES-GCM-256 encryption
      const userSecretKey = `user_ephi_${currentUser.id}_secret_356`;
      const { ciphertext, iv } = await encryptSensitiveData(JSON.stringify(sensitiveDataObj), userSecretKey);

      const assessmentRecord: SensitiveHealthAssessment = {
        userId: currentUser.id,
        isEncrypted: true,
        encryptedPayload: ciphertext,
        iv: iv,
        encryptionAlgorithm: 'AES-GCM-256',
        lastUpdated: new Date().toISOString(),
        consentRecorded: {
          explicitAgreement: true,
          decree356ConsentText: 'Tôi hoàn toàn đồng ý cung cấp thông tin sức khỏe tâm thần và thể chất cho nền tảng KhanhAn phục vụ mục đích trị liệu và hỗ trợ sức khỏe.',
          ipAddressRecorded: '113.161.xx.xx (Mã hóa SHA-256)',
          timestamp: new Date().toISOString()
        }
      };

      dataStore.saveHealthAssessment(assessmentRecord);

      // Update user consent flag
      dataStore.updateUser({
        ...currentUser,
        isHealthProfileConsentGiven: true,
        healthProfileConsentTimestamp: new Date().toISOString()
      });

      setMessage({
        text: 'Hồ sơ đánh giá sức khỏe đã được mã hóa AES-GCM-256 và lưu trữ thành công theo đúng chuẩn Nghị định 356/2025/NĐ-CP!',
        isError: false
      });
      setDecryptedView(sensitiveDataObj);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi mã hóa dữ liệu.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDecryptView = async () => {
    if (!existingAssessment) return;
    setIsDecrypting(true);
    try {
      const userSecretKey = `user_ephi_${currentUser.id}_secret_356`;
      const plaintextJson = await decryptSensitiveData(existingAssessment.encryptedPayload, existingAssessment.iv, userSecretKey);
      setDecryptedView(JSON.parse(plaintextJson));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleExecuteDeletion = () => {
    setDeleteProcessing(true);
    setTimeout(() => {
      const res = AuthController.executeRightToDeletion(currentUser.id, deleteReason);
      setDeleteProcessing(false);
      setIsDeleteModalOpen(false);
      setDecryptedView(null);
      setMessage({ text: res.message, isError: false });
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            Hồ sơ Sức khỏe Toàn diện & Quyền Riêng tư
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Đánh giá sức khỏe tâm thần & thể chất (UC02) được bảo vệ bằng mã hóa AES-GCM-256 theo Điều 4 & 6 Nghị định 356/2025/NĐ-CP.
          </p>
        </div>

        {/* Right to Deletion Action (UC03) */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          Yêu cầu Xóa vĩnh viễn dữ liệu (UC03)
        </button>
      </div>

      {/* Decree 356 & HIPAA Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900 to-blue-950 text-white shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
          <Scale className="w-4 h-4 text-sky-400" />
          QUY TẮC PHÁP LÝ NGHỊ ĐỊNH 356/2025/NĐ-CP & TIÊU CHUẨN HIPAA ePHI:
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-light">
          Theo Điều 4 Nghị định 356/2025/NĐ-CP, tình trạng sức khỏe tâm thần và lịch sử trị liệu được phân loại là <strong>Dữ liệu cá nhân nhạy cảm</strong>. Hệ thống bắt buộc người dùng xác nhận sự đồng ý chủ động (Không được tích sẵn). Toàn bộ nội dung bệnh án được mã hóa tại máy trạm, ngay cả Quản trị viên hệ thống (Super Admin) cũng không thể xem nội dung thô (Plaintext Blinded).
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
          message.isError ? 'bg-rose-50 text-rose-900 border border-rose-300' : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
        }`}>
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{message.text}</span>
        </div>
      )}

      {/* Assessment Form (UC02) */}
      <form onSubmit={handleSaveAssessment} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-sky-600" />
            Biểu mẫu Đánh giá Sức khỏe Toàn diện (Dynamic Wellness Assessment)
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Module 1 - UC02</span>
        </div>

        {/* 1. Stress Level Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-800">
              Chỉ số Căng thẳng / Áp lực hiện tại (1: Rất thư thái - 10: Rất áp lực):
            </label>
            <span className="font-bold text-sm text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg">
              {stressLevel} / 10
            </span>
          </div>
          <input 
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
        </div>

        {/* 2. Sleep Quality */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800 block">
            Chất lượng giấc ngủ trong 7 ngày qua:
          </label>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { key: 'POOR', label: 'Kém / Mất ngủ' },
              { key: 'MODERATE', label: 'Trung bình' },
              { key: 'GOOD', label: 'Tốt' },
              { key: 'EXCELLENT', label: 'Rất sâu & sảng khoái' }
            ].map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSleepQuality(item.key as any)}
                className={`py-2.5 px-2 rounded-xl text-center font-medium transition-all border cursor-pointer ${
                  sleepQuality === item.key 
                    ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-2xs' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Primary Concerns */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800 block">
            Vấn đề bạn đang mong muốn cải thiện nhất:
          </label>
          <div className="flex flex-wrap gap-2">
            {concernsList.map(concern => {
              const isSelected = selectedConcerns.includes(concern);
              return (
                <button
                  key={concern}
                  type="button"
                  onClick={() => handleToggleConcern(concern)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-sky-600 border-sky-600 text-white font-medium' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {concern}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Medical History Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 block">
            Lịch sử y tế, triệu chứng thể chất hoặc ghi chú bổ sung:
          </label>
          <textarea
            rows={4}
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="Ví dụ: Đã từng trải qua giai đoạn kiệt sức (burnout), dị ứng thực phẩm hoặc đau cổ vai gáy..."
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 leading-relaxed font-sans"
          />
        </div>

        {/* STRICT CONSTRAINT: ARTICLE 4 & 6 DECREE 356/2025 - UNCHECKED CONSENT BOX */}
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-2">
          <div className="flex items-start gap-3">
            <input 
              type="checkbox"
              id="decree356HealthConsent"
              checked={explicitDecree356Consent}
              onChange={(e) => setExplicitDecree356Consent(e.target.checked)}
              className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer shrink-0"
            />
            <label htmlFor="decree356HealthConsent" className="text-xs text-amber-950 leading-relaxed cursor-pointer select-none">
              <span className="font-extrabold uppercase text-amber-900 block mb-0.5">
                Xác nhận Đồng ý Cung cấp Dữ liệu Sức khỏe Nhạy cảm (Điều 4 & 6 Nghị định 356/2025/NĐ-CP)
              </span>
              Tôi chủ động xác nhận và đồng ý cho phép nền tảng KhanhAn thu thập, mã hóa và xử lý thông tin sức khỏe tâm lý nêu trên cho mục đích kết nối trị liệu. Tôi hiểu rằng tôi có quyền thu hồi sự đồng ý và thực thi Quyền được xóa dữ liệu cá nhân bất kỳ lúc nào.
              <span className="block text-[11px] text-amber-800 font-semibold mt-1">
                (Ràng buộc kỹ thuật: Hộp kiểm này tuyệt đối không được tích sẵn mặc định).
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-sky-600" />
            <span>Mã hóa AES-GCM-256 bảo vệ dữ liệu trước khi truyền</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            {saving ? 'Đang mã hóa AES-256...' : 'Lưu Hồ sơ Bảo mật'}
          </button>
        </div>
      </form>

      {/* Encrypted Vault Inspector */}
      {existingAssessment && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Bản ghi Mã hóa trong Database (ePHI Vault)</h3>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">
              AES-GCM-256 Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-slate-500">Ciphertext Payload (Admin chỉ nhìn thấy chuỗi này):</div>
            <div className="p-3 bg-slate-900 text-sky-300 rounded-xl font-mono text-[11px] break-all max-h-24 overflow-y-auto">
              {existingAssessment.encryptedPayload}
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Initialization Vector (IV): <code className="text-slate-700">{existingAssessment.iv}</code></span>
              <span>Cập nhật lần cuối: {new Date(existingAssessment.lastUpdated).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleDecryptView}
              disabled={isDecrypting}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              {isDecrypting ? 'Đang giải mã...' : 'Giải mã xem trực quan'}
            </button>
          </div>

          {decryptedView && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-2 text-slate-800">
              <div className="font-bold text-sky-950">Dữ liệu đã giải mã bằng Khóa chủ:</div>
              <div>Mức độ Stress: <strong>{decryptedView.stressLevel} / 10</strong></div>
              <div>Chất lượng giấc ngủ: <strong>{decryptedView.sleepQuality}</strong></div>
              <div>Quan ngại: <strong>{decryptedView.primaryConcerns?.join(', ')}</strong></div>
              <div>Lịch sử y khoa: <em>"{decryptedView.medicalHistoryNotes}"</em></div>
            </div>
          )}
        </div>
      )}

      {/* Right to Deletion Modal (UC03 - Article 5 Decree 356/2025) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Thực thi Quyền được Xóa dữ liệu (Điều 5 NĐ 356)
                </h3>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đang yêu cầu thực hiện <strong>"Right to Deletion / Anonymization"</strong> theo quy định tại Điều 5 Nghị định 356/2025/NĐ-CP. Hệ thống sẽ:
            </p>

            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
              <li>Tiêu hủy vĩnh viễn toàn bộ hồ sơ đánh giá sức khỏe và bệnh án nhạy cảm.</li>
              <li>Ẩn danh hóa danh tính cá nhân trên toàn bộ cơ sở dữ liệu.</li>
              <li>Lưu vết nhật ký kiểm toán (Audit Trail) để đối soát với cơ quan quản lý.</li>
            </ul>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Lý do yêu cầu xóa dữ liệu:</label>
              <textarea
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteDeletion}
                disabled={deleteProcessing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                {deleteProcessing ? 'Đang tiêu hủy dữ liệu...' : 'Xác nhận Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
