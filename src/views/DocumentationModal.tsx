/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Technical Architecture & Security Documentation Modal
 * Documents MVC pattern, Supabase/Vercel integration, OWASP Top 10, Decree 356/2025, and HIPAA
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  Lock, 
  Server, 
  FileCode, 
  CheckCircle2, 
  Layers, 
  AlertOctagon,
  Copy,
  ExternalLink
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [activeDocTab, setActiveDocTab] = useState<'MVC' | 'SECURITY' | 'DECREE356' | 'SUPABASE_VERCEL'>('MVC');
  const [copied, setCopied] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-900 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Hồ sơ Tài liệu Kỹ thuật & Chuẩn An ninh KhanhAn</h2>
              <p className="text-xs text-slate-300">SWP391-HLT-01 · MVC Pattern · OWASP Top 10 · Nghị định 356/2025/NĐ-CP · HIPAA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer font-medium"
          >
            Đóng tài liệu
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs shrink-0 overflow-x-auto">
          {[
            { id: 'MVC', label: '1. Kiến trúc MVC & Thư mục', icon: Layers },
            { id: 'SECURITY', label: '2. Chuẩn OWASP Top 10', icon: Lock },
            { id: 'DECREE356', label: '3. Tuân thủ NĐ 356 & HIPAA', icon: AlertOctagon },
            { id: 'SUPABASE_VERCEL', label: '4. Tích hợp Supabase & Vercel', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeDocTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
          {/* TAB 1: MVC PATTERN ARCHITECTURE */}
          {activeDocTab === 'MVC' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                1. Thiết kế Hệ thống theo Mô hình MVC (Model - View - Controller)
              </h3>
              <p>
                Dự án KhanhAn được phân chia nghiêm ngặt theo mô hình 3 lớp MVC nhằm đảm bảo tính phân tách trách nhiệm (Separation of Concerns), dễ bảo trì và mở rộng:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-2">
                  <div className="font-bold text-sky-900 text-sm">Model Layer (/src/models)</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li><strong>types.ts:</strong> Định nghĩa các hợp đồng thực thể dữ liệu (User, TherapistProfile, Appointment, HealthAssessment, Review, HabitLog).</li>
                    <li><strong>storage.ts:</strong> Quản lý lưu trữ phản ứng (Reactive DataStore), quản lý khóa Mutex chống xung đột lịch hẹn.</li>
                    <li><strong>crypto.ts:</strong> Thực thi mã hóa chuẩn Web Crypto AES-GCM-256 cho dữ liệu nhạy cảm ePHI.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <div className="font-bold text-indigo-900 text-sm">Controller Layer (/src/controllers)</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li><strong>authController.ts:</strong> Xác thực Google OAuth SSO, Email OTP, quyền xóa dữ liệu NĐ 356 (UC03).</li>
                    <li><strong>bookingController.ts:</strong> Đặt lịch hẹn, khóa Mutex chống Double-booking, chính sách hoàn 100%/0% trước 24h.</li>
                    <li><strong>habitController.ts:</strong> Nhật ký thói quen, tự động cộng Zen Points, tính toán xu hướng 7/30 ngày.</li>
                    <li><strong>contentController.ts:</strong> Thư viện bài viết, phân loại GWI, thanh toán thẻ mô phỏng PCI-DSS.</li>
                    <li><strong>adminController.ts:</strong> Quản trị DPO, thẩm định CCHN Bác sĩ, cảnh báo 72h NĐ 356.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-900 text-sm">View Layer (/src/views)</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Giao diện React tối giản, tone xanh dương chuyên nghiệp y tế.</li>
                    <li>Không sử dụng static pill gây rối mắt, tuân thủ WCAG AA.</li>
                    <li>Đảm bảo hộp kiểm chấp thuận nhạy cảm không tích sẵn.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 font-mono text-[11px] text-slate-800 space-y-1">
                <div className="font-bold text-slate-900">Cấu trúc thư mục mã nguồn:</div>
                <div>├── /src/models/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Entities, Crypto AES-256, Storage Mutex</div>
                <div>├── /src/controllers/ &nbsp;&nbsp;&nbsp;# Business Logic & API Handlers</div>
                <div>├── /src/views/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# UI Components & Page Views</div>
                <div>├── /supabase/schema.sql &nbsp;# PostgreSQL DDL, RLS Policies & Triggers</div>
              </div>
            </div>
          )}

          {/* TAB 2: OWASP TOP 10 */}
          {activeDocTab === 'SECURITY' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                2. Bảng Ma trận Tuân thủ Chuẩn Bảo mật OWASP Top 10
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-1/3">Hạng mục OWASP Top 10</th>
                      <th className="p-3">Giải pháp Kiến trúc đã Triển khai trong KhanhAn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">A01: Broken Access Control</td>
                      <td className="p-3 text-slate-600">
                        Áp dụng Role-Based Access Control (RBAC) nghiêm ngặt cho 4 vai trò (Client, Therapist, Creator, Admin). Đặc biệt Super Admin bị giới hạn kỹ thuật (Admin Blinded) không thể đọc plaintext bệnh án.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">A02: Cryptographic Failures</td>
                      <td className="p-3 text-slate-600">
                        Sử dụng Web Crypto API tiêu chuẩn quốc tế: thuật toán AES-GCM-256 với hàm băm dẫn xuất khóa PBKDF2 (100,000 vòng lặp) và Salt ngẫu nhiên.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">A03: Injection</td>
                      <td className="p-3 text-slate-600">
                        Database Supabase/PostgreSQL áp dụng Parameterized Queries và ORM/Prepared Statements, ngăn chặn 100% SQL Injection.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">A04: Insecure Design</td>
                      <td className="p-3 text-slate-600">
                        Thiết kế Concurrency Mutex Lock ngăn chặn race conditions và double-booking; áp dụng quy tắc nghiệp vụ hoàn tiền 24 giờ minh bạch.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">A07: Identification and Authentication Failures</td>
                      <td className="p-3 text-slate-600">
                        Tích hợp Google Identity SSO bảo vệ mật khẩu, hỗ trợ Email OTP 6 chữ số có thời gian hết hạn sau 5 phút và cơ chế thu hồi phiên.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DECREE 356 & HIPAA */}
          {activeDocTab === 'DECREE356' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                3. Tuân thủ Nghị định 356/2025/NĐ-CP & Tiêu chuẩn Y tế HIPAA
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                  <div className="font-bold text-sky-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-700" />
                    Điều 4 - Dữ liệu cá nhân nhạy cảm:
                  </div>
                  <p className="text-slate-700">
                    Phân loại hồ sơ đánh giá sức khỏe tâm lý và bệnh án tham vấn là Dữ liệu nhạy cảm cấp cao. Bắt buộc mã hóa AES-256 ngay tại trình duyệt client trước khi gửi lên máy chủ.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <div className="font-bold text-amber-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    Điều 6 - Sự đồng ý có thể xác minh (Verifiable Consent):
                  </div>
                  <p className="text-slate-700">
                    Nghiêm cấm tuyệt đối việc sử dụng ô kiểm tích sẵn mặc định (No Default-Checked Boxes). Hệ thống chặn việc gửi form nếu người dùng không tự tay tích vào ô chấp thuận.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Điều 5 - Quyền của Chủ thể Dữ liệu (Right to Deletion):
                  </div>
                  <p className="text-slate-700">
                    Cung cấp UI chuyên dụng (UC03) cho phép người dùng yêu cầu xóa vĩnh viễn hoặc ẩn danh hóa toàn bộ hồ sơ bệnh lý nhạy cảm bất kỳ lúc nào.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                  <div className="font-bold text-rose-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-700" />
                    Cảnh báo Sự cố Khẩn cấp 72 Giờ (UC25):
                  </div>
                  <p className="text-slate-700">
                    Hệ thống DPO phát cảnh báo khẩn cấp tới cơ quan thẩm quyền và người dùng bị ảnh hưởng trong thời hạn tối đa 72 giờ tính từ thời điểm phát hiện sự cố.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPABASE & VERCEL INTEGRATION */}
          {activeDocTab === 'SUPABASE_VERCEL' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                4. Hướng dẫn Triển khai trên Vercel & Kết nối Supabase PostgreSQL
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 font-mono text-[11px]">
                  <div className="text-slate-400 font-sans font-bold">Biến môi trường (.env.production trên Vercel):</div>
                  <div className="text-sky-300">VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
                  <div className="text-sky-300">VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."</div>
                  <div className="text-emerald-300">GOOGLE_CLIENT_ID="your-google-oauth-client-id"</div>
                </div>

                <p>
                  Tệp cấu hình cơ sở dữ liệu đã được khởi tạo hoàn chỉnh tại đường dẫn: <code className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">/supabase/schema.sql</code>.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">Các bước triển khai lên Supabase:</div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Đăng nhập Supabase Console → Tạo Project mới (Region Singapore để tối ưu độ trễ cho Việt Nam).</li>
                    <li>Mở mục <strong>SQL Editor</strong> → Sao chép toàn bộ nội dung từ file <code>/supabase/schema.sql</code> → Bấm <strong>Run</strong>.</li>
                    <li>Toàn bộ 9 bảng dữ liệu, ràng buộc unique chống Double-booking, và chính sách Row Level Security (RLS) bảo vệ HIPAA sẽ được khởi tạo tự động.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">Các bước triển khai lên Vercel:</div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Kết nối repository GitHub với Vercel.</li>
                    <li>Framework Preset: chọn <strong>Vite</strong>.</li>
                    <li>Điền các biến môi trường <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                    <li>Bấm <strong>Deploy</strong> → Ứng dụng sẽ tự động tối ưu hóa hiệu suất hiển thị với React và Tailwind CSS.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">KhanhAn Platform Architecture v1.0 · SWP391</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
