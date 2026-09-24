/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Holistic Wellness & Tele-Therapy Hub
 * Main Application Orchestrator (MVC View Container)
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './views/Navbar';
import { HomeView } from './views/HomeView';
import { TeleTherapyView } from './views/TeleTherapyView';
import { AppointmentsView } from './views/AppointmentsView';
import { WellnessLibraryView } from './views/WellnessLibraryView';
import { HabitZenView } from './views/HabitZenView';
import { HealthProfileView } from './views/HealthProfileView';
import { TherapistWorkspaceView } from './views/TherapistWorkspaceView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AuthModal } from './views/AuthModal';
import { DocumentationModal } from './views/DocumentationModal';
import { dataStore } from './models/storage';
import { User } from './models/types';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Lock, 
  BookOpen, 
  FileText, 
  Scale, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => dataStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Subscribe to DataStore changes for real-time reactivity
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setCurrentUser(dataStore.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  const handleOpenBooking = (therapistId: string) => {
    setSelectedTherapistId(therapistId);
    setActiveTab('tele-therapy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* Main Viewport Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            currentUser={currentUser}
            onNavigate={handleTabChange}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {activeTab === 'tele-therapy' && (
          <TeleTherapyView
            currentUser={currentUser}
            selectedTherapistId={selectedTherapistId}
            onBookingSuccess={() => setActiveTab('appointments')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
            currentUser={currentUser}
            onNavigateToBooking={() => setActiveTab('tele-therapy')}
          />
        )}

        {activeTab === 'library' && (
          <WellnessLibraryView
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'habits' && (
          <HabitZenView currentUser={currentUser} />
        )}

        {activeTab === 'health-profile' && (
          <HealthProfileView currentUser={currentUser} />
        )}

        {activeTab === 'therapist-workspace' && (
          <TherapistWorkspaceView currentUser={currentUser} />
        )}

        {activeTab === 'creator-studio' && (
          <WellnessLibraryView
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Professional Healthcare Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  Khanh<span className="text-sky-400">An</span>
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Nền tảng Chăm sóc Sức khỏe Toàn diện & Tư vấn Trị liệu Tâm lý từ xa theo mô hình MVC.
              </p>
              <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Đạt chuẩn Nghị định 356/2025/NĐ-CP & HIPAA
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <div className="text-white font-bold uppercase text-[11px] tracking-wider">Phân hệ chức năng</div>
              <ul className="space-y-1 text-[11px]">
                <li><button onClick={() => handleTabChange('tele-therapy')} className="hover:text-white cursor-pointer">Đặt lịch Tele-Therapy</button></li>
                <li><button onClick={() => handleTabChange('library')} className="hover:text-white cursor-pointer">Thư viện GWI & VIP Media</button></li>
                <li><button onClick={() => handleTabChange('habits')} className="hover:text-white cursor-pointer">Nhật ký Thói quen & Zen Points</button></li>
                <li><button onClick={() => handleTabChange('health-profile')} className="hover:text-white cursor-pointer">Hồ sơ Sức khỏe & Xóa Dữ liệu</button></li>
              </ul>
            </div>

            {/* Compliance & Standards */}
            <div className="space-y-2">
              <div className="text-white font-bold uppercase text-[11px] tracking-wider">Tiêu chuẩn An ninh</div>
              <ul className="space-y-1 text-[11px]">
                <li className="flex items-center gap-1"><Lock className="w-3 h-3 text-sky-400" /> Mã hóa AES-GCM-256 (Web Crypto)</li>
                <li className="flex items-center gap-1"><Scale className="w-3 h-3 text-sky-400" /> Luật KCB số 15/2023/QH15</li>
                <li className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-sky-400" /> OWASP Top 10 Security Architecture</li>
                <li className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-400" /> WHO Digital Health Guidance</li>
              </ul>
            </div>

            {/* Developer & Architecture Docs */}
            <div className="space-y-2">
              <div className="text-white font-bold uppercase text-[11px] tracking-wider">Dành cho Giảng viên / Đánh giá</div>
              <p className="text-[11px] text-slate-400">
                Khám phá cấu trúc thư mục MVC, tài liệu kỹ thuật, PostgreSQL DDL schema và Vercel deploy guide.
              </p>
              <button
                onClick={() => setIsDocsOpen(true)}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-700 text-sky-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Mở Tài liệu Kỹ thuật
              </button>
            </div>
          </div>

          {/* Bottom disclaimer bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 KhanhAn Hub · Project Code: SWP391-HLT-01 · Lecturer: ManhNC5@fpt.edu.vn
            </div>
            <div>
              Thiết kế màu sắc chủ đạo Tone Xanh Dương Tối Giản · React 19 & Tailwind CSS v4
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={() => setCurrentUser(dataStore.getCurrentUser())}
      />

      {/* Technical Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
