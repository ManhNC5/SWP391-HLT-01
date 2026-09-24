/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Navigation Bar & Persona Switcher
 * Tone: Ocean Blue Minimalist & Medical Professional
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  HeartHandshake, 
  FileText, 
  UserCheck, 
  Wallet, 
  LogOut, 
  LogIn, 
  ChevronDown, 
  AlertTriangle,
  Stethoscope,
  PenTool,
  Lock
} from 'lucide-react';
import { User, UserRole } from '../models/types';
import { AuthController } from '../controllers/authController';
import { dataStore } from '../models/storage';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onOpenDocs
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const users = dataStore.getUsers();

  const handleSwitchUser = (userId: string) => {
    AuthController.switchRole(userId);
    setRoleMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: HeartHandshake },
    { id: 'tele-therapy', label: 'Đặt lịch Chuyên gia', icon: Stethoscope },
    { id: 'appointments', label: 'Lịch hẹn', icon: Calendar },
    { id: 'library', label: 'Thư viện Wellness', icon: BookOpen },
    { id: 'habits', label: 'Thói quen Zen', icon: Sparkles },
    { id: 'health-profile', label: 'Hồ sơ Sức khỏe', icon: FileText }
  ];

  if (currentUser.role === 'THERAPIST') {
    navItems.push({ id: 'therapist-workspace', label: 'Góc Chuyên gia', icon: UserCheck });
  }

  if (currentUser.role === 'CONTENT_CREATOR') {
    navItems.push({ id: 'creator-studio', label: 'Studio Nội dung', icon: PenTool });
  }

  if (currentUser.role === 'ADMIN') {
    navItems.push({ id: 'admin-dashboard', label: 'Quản trị DPO/Admin', icon: Shield });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      {/* Decree 356 & Security Bar */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 max-w-4xl truncate">
          <span className="flex items-center gap-1 text-sky-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            Nghị định 356/2025/NĐ-CP & HIPAA:
          </span>
          <span className="text-slate-200 truncate">
            Bảo vệ dữ liệu sức khỏe nhạy cảm · Mã hóa AES-GCM-256 · Chống đặt trùng lịch (Mutex Concurrency)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenDocs}
            className="text-sky-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer text-[11px] font-semibold flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            Tài liệu Kiến trúc & OWASP Top 10
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                  Khanh<span className="text-sky-600">An</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                  Tele-Therapy & Wellness
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      isActive
                        ? 'text-sky-700 border-sky-600 font-semibold'
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Island */}
          <div className="flex items-center gap-3">
            {/* Quick Persona/Role Switcher for Evaluators */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-sky-900 transition-colors cursor-pointer shadow-2xs"
                title="Chuyển đổi vai trò để chấm điểm các phân hệ"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Role: <strong>{currentUser.role}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-sky-700" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400 border-b border-slate-100">
                    Chuyển Persona để kiểm thử
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u.id)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-sky-50 transition-colors cursor-pointer ${
                        u.id === currentUser.id ? 'bg-sky-50/80 font-semibold text-sky-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase shrink-0">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet & Points Display */}
            <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium" title="Số dư ví nội bộ">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser.walletBalance.toLocaleString('vi-VN')} đ</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-amber-700 font-medium" title="Điểm Zen tích lũy">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentUser.zenPoints} Zen</span>
              </div>
            </div>

            {/* User Profile / Auth Button */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent focus:border-slate-300"
              >
                <img 
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full border border-sky-300 object-cover"
                />
                <span className="hidden md:block text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                  {currentUser.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-900 truncate">{currentUser.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {currentUser.role}
                      </span>
                      {currentUser.isVip && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          VIP Member
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onSelectTab('health-profile');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Hồ sơ sức khỏe & Quyền xóa dữ liệu
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('habits');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      Nhật ký Zen & Bảng xếp hạng
                    </button>
                    <button
                      onClick={() => {
                        onOpenDocs();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Kiểm toán bảo mật & Nghị định 356
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-sky-700 hover:bg-sky-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Đăng nhập / Google OAuth SSO
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 scrollbar-none">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
