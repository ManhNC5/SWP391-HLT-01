/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Admin Center & Data Protection Office (Module 5 - UC05, UC23, UC24, UC25)
 * Enforces Decree 356/2025 72-Hour Breach Alerts, Review Moderation, and Financials
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  DollarSign, 
  Users, 
  Award, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  Send, 
  Ban, 
  Eye, 
  EyeOff,
  Scale,
  RefreshCw,
  Clock
} from 'lucide-react';
import { User, IncidentAlert, Review, TherapistProfile } from '../models/types';
import { dataStore } from '../models/storage';
import { AdminController } from '../controllers/adminController';

export const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'USERS' | 'CREDENTIALS' | 'REVIEWS' | 'INCIDENTS'>('FINANCE');
  const [notice, setNotice] = useState<string | null>(null);

  // Breach Broadcast Form State (UC25)
  const [incidentTitle, setIncidentTitle] = useState('Phát hiện truy cập trái phép vào API gateway ngoại vi');
  const [incidentSeverity, setIncidentSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [incidentScope, setIncidentScope] = useState('142 tài khoản người dùng đăng ký trong tháng 9');
  const [incidentDesc, setIncidentDesc] = useState('Hệ thống phát hiện IP bất thường quét cổng. Khóa token phiên đã được kích hoạt thu hồi và cấp phát lại ngay lập tức.');
  const [incidentActions, setIncidentActions] = useState('Buộc đăng xuất toàn bộ phiên làm việc, kích hoạt xoay vòng khóa bí mật PBKDF2 và báo cáo Cục An ninh mạng A05.');

  const financialMetrics = AdminController.getFinancialMetrics();
  const users = dataStore.getUsers();
  const therapists = dataStore.getTherapists();
  const reviews = dataStore.getReviews();
  const incidents = dataStore.getIncidents();

  const handleToggleBan = (userId: string) => {
    const res = AdminController.toggleUserBan(userId);
    setNotice(res.message);
  };

  const handleVerifyTherapist = (therapistUserId: string, approved: boolean) => {
    const res = AdminController.verifyTherapist(therapistUserId, approved);
    setNotice(res.message);
  };

  const handleToggleReviewModeration = (reviewId: string) => {
    const res = AdminController.toggleReviewModeration(reviewId);
    setNotice(res.message);
  };

  const handleBroadcastDecree356Alert = (e: React.FormEvent) => {
    e.preventDefault();
    const res = AdminController.triggerDecree356IncidentAlert({
      title: incidentTitle,
      severity: incidentSeverity,
      description: incidentDesc,
      affectedScope: incidentScope,
      remedialActions: incidentActions
    });
    setNotice(res.message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            Trung tâm Quản trị & DPO (Data Protection Office)
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900">
              Decree 356 & HIPAA Compliant
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Giám sát tài chính đa nguồn (UC24), kiểm duyệt chứng chỉ y tế CCHN (UC04/05) và phát tín hiệu cảnh báo sự cố 72 giờ (UC25).
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-sky-50 text-sky-900 text-xs rounded-xl border border-sky-200 flex items-center justify-between font-medium">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-sky-700 font-bold ml-4">×</button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-1 scrollbar-none text-xs">
        {[
          { id: 'FINANCE', label: 'Báo cáo Tài chính (UC24)', icon: DollarSign },
          { id: 'USERS', label: 'Quản lý Tài khoản (UC05)', icon: Users },
          { id: 'CREDENTIALS', label: 'Thẩm định Chuyên gia CCHN (UC04)', icon: Award },
          { id: 'REVIEWS', label: 'Kiểm duyệt Đánh giá (UC23)', icon: MessageSquare },
          { id: 'INCIDENTS', label: 'Cảnh báo Sự cố 72h NĐ 356 (UC25)', icon: AlertOctagon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-sky-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: FINANCIAL DASHBOARD (UC24) */}
      {activeTab === 'FINANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500 font-medium">Tổng doanh thu nền tảng (Gross)</div>
              <div className="text-2xl font-bold text-slate-900">
                {financialMetrics.totalGrossRevenue.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold pt-1">
                Gồm Subscriptions + Booking
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500 font-medium">Doanh thu Hội viên VIP</div>
              <div className="text-2xl font-bold text-amber-600">
                {financialMetrics.subscriptionRevenue.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400 pt-1">Gói 199.000 đ/tháng</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500 font-medium">Hoa hồng Nền tảng (15% Commission)</div>
              <div className="text-2xl font-bold text-sky-700">
                {financialMetrics.bookingCommissionRevenue.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400 pt-1">Trích từ các ca tham vấn hoàn thành</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500 font-medium">Tiền hoàn trả cho Khách (24h Policy)</div>
              <div className="text-2xl font-bold text-rose-600">
                {financialMetrics.totalRefundsIssued.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400 pt-1">Tuân thủ hoàn 100% nếu hủy trước 24h</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Phân bổ Doanh thu & Chi trả Đối tác Chuyên gia</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Chi trả thực nhận cho Chuyên gia (85% Net):</span>
                <span className="font-bold text-slate-900">
                  {financialMetrics.therapistPayoutTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div className="bg-sky-600 h-full" style={{ width: '85%' }} title="Therapists 85%"></div>
                <div className="bg-indigo-600 h-full" style={{ width: '15%' }} title="Platform 15%"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Xanh dương: Chi trả Bác sĩ (85%)</span>
                <span>Tím: Phí hoa hồng sàn duy trì hệ thống (15%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (UC05) */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Danh sách Tài khoản Người dùng & Trạng thái (UC05)</h3>
            <span className="text-xs text-slate-500">{users.length} tài khoản</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Vai trò (RBAC)</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Số dư Ví</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span>{u.fullName}</span>
                    </td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 font-bold text-sky-800">{u.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                        u.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700' :
                        u.status === 'ANONYMIZED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{u.walletBalance.toLocaleString('vi-VN')} đ</td>
                    <td className="p-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleBan(u.id)}
                          className={`px-3 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                            u.status === 'SUSPENDED' 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.status === 'SUSPENDED' ? 'Mở khóa' : 'Khóa tài khoản'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CREDENTIAL VERIFICATION (UC04 / UC05) */}
      {activeTab === 'CREDENTIALS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Thẩm định Chứng chỉ Hành nghề Y tế (Luật 15/2023/QH15)
            </h3>
            <p className="text-xs text-slate-500">
              Chỉ các chuyên gia được Quản trị viên thẩm định và phê duyệt CCHN mới được phép mở lịch đặt hẹn công khai.
            </p>

            <div className="space-y-4 pt-2">
              {therapists.map(t => {
                const u = users.find(user => user.id === t.userId);
                return (
                  <div key={t.userId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{u?.fullName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.isVerifiedByAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.isVerifiedByAdmin ? 'Đã xác minh' : 'Chưa xác minh'}
                        </span>
                      </div>
                      <div className="text-slate-600">{t.title}</div>
                      <div className="font-mono text-[11px] text-sky-800">
                        Số CCHN: <strong>{t.licenseNumber}</strong> · Đơn vị: {t.licenseIssuingAuthority}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyTherapist(t.userId, true)}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        Phê duyệt CCHN
                      </button>
                      <button
                        onClick={() => handleVerifyTherapist(t.userId, false)}
                        className="px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-medium text-xs cursor-pointer"
                      >
                        Thu hồi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW MODERATION (UC23) */}
      {activeTab === 'REVIEWS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Kiểm duyệt Đánh giá Khách hàng (UC23)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ẩn các bình luận mang tính xúc phạm hoặc vi phạm chuẩn mực y đức.</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.clientName}</span>
                    <span className="text-amber-500 font-bold">{rev.rating} ⭐</span>
                    {rev.isModerated && (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                        Đã bị ẩn bởi Quản trị viên
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed font-light">"{rev.comment}"</p>
                  <div className="text-[11px] text-slate-400">
                    Ngày đăng: {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleReviewModeration(rev.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0 ${
                    rev.isModerated 
                      ? 'bg-sky-50 text-sky-800 hover:bg-sky-100' 
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {rev.isModerated ? 'Khôi phục hiển thị' : 'Ẩn đánh giá'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DECREE 356/2025 72-HOUR INCIDENT ALERT (UC25) */}
      {activeTab === 'INCIDENTS' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1">
            <div className="font-bold flex items-center gap-2 text-rose-800 text-sm">
              <AlertOctagon className="w-5 h-5" />
              Quy định bắt buộc theo Điều 5 & 6 Nghị định 356/2025/NĐ-CP
            </div>
            <p className="leading-relaxed">
              Khi xảy ra sự cố vi phạm an toàn dữ liệu cá nhân nhạy cảm, Bên kiểm soát dữ liệu (KhanhAn) có nghĩa vụ thông báo khẩn cấp tới cơ quan thẩm quyền và phát thông báo trực tiếp tới toàn bộ Chủ thể dữ liệu bị ảnh hưởng <strong>trong vòng tối đa 72 giờ</strong> kể từ thời điểm phát hiện sự cố.
            </p>
          </div>

          {/* Broadcast Form (UC25) */}
          <form onSubmit={handleBroadcastDecree356Alert} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Phát Lệnh Cảnh báo Khẩn cấp Sự cố Dữ liệu 72 Giờ (UC25)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tiêu đề thông báo sự cố:</label>
                <input 
                  type="text" 
                  value={incidentTitle} 
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mức độ nghiêm trọng:</label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-rose-700"
                >
                  <option value="LOW">Thấp (Low)</option>
                  <option value="MEDIUM">Trung bình (Medium)</option>
                  <option value="HIGH">Nghiêm trọng (High)</option>
                  <option value="CRITICAL">Khẩn cấp tối cao (Critical)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Phạm vi ảnh hưởng (Affected Scope):</label>
              <input 
                type="text" 
                value={incidentScope} 
                onChange={(e) => setIncidentScope(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Mô tả bản chất sự cố:</label>
              <textarea 
                rows={3}
                value={incidentDesc} 
                onChange={(e) => setIncidentDesc(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Biện pháp khắc phục đã thực thi:</label>
              <textarea 
                rows={2}
                value={incidentActions} 
                onChange={(e) => setIncidentActions(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Phát lệnh Khẩn cấp trong 72 Giờ tới Người dùng
              </button>
            </div>
          </form>

          {/* Broadcast History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Lịch sử Thông báo Sự cố đã ghi nhận ({incidents.length})</h3>
            <div className="space-y-3 text-xs">
              {incidents.map(inc => (
                <div key={inc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{inc.title}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold text-[10px]">
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-slate-600">{inc.description}</p>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Thời hạn 72h: {new Date(inc.decree356Deadline).toLocaleString('vi-VN')}</span>
                    <span className="text-emerald-700 font-semibold">Đã gửi toàn hệ thống</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
