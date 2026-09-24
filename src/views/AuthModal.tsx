/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Authentication & Google OAuth Modal
 * Supports Google SSO, Email OTP login/registration, and Role selection
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { AuthController } from '../controllers/authController';
import { dataStore } from '../models/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'THERAPIST'>('CLIENT');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleGoogleLogin = async () => {
    const res = await AuthController.loginWithGoogle();
    if (res.success) {
      setMessage({ text: res.message, isError: false });
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 1000);
    }
  };

  const handleSendOtp = () => {
    const res = AuthController.sendOtp(email);
    if (res.success) {
      setIsOtpSent(true);
      setDemoCode(res.code);
      setMessage({ text: res.message, isError: false });
    } else {
      setMessage({ text: res.message, isError: true });
    }
  };

  const handleVerifyOtp = () => {
    const res = AuthController.verifyOtpAndLogin(email, otpCode, fullName, role);
    if (res.success) {
      setMessage({ text: res.message, isError: false });
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 1000);
    } else {
      setMessage({ text: res.message, isError: true });
    }
  };

  const handleFastSwitch = (userId: string) => {
    AuthController.switchRole(userId);
    onLoginSuccess();
    onClose();
  };

  const users = dataStore.getUsers();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'LOGIN' ? 'Đăng nhập Tài khoản' : 'Đăng ký Tài khoản mới'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              KhanhAn - Bảo mật OWASP Top 10 & Nghị định 356
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            message.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* 1. Google OAuth SSO Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Đăng nhập một chạm với Google Identity SSO
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[11px] text-slate-400 uppercase font-medium">hoặc dùng Email OTP</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* 2. Email OTP Flow */}
        <div className="space-y-3 text-xs">
          {mode === 'REGISTER' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Họ và tên:</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email:</label>
            <div className="flex gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@khanhan.vn"
                className="flex-1 p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 whitespace-nowrap cursor-pointer"
              >
                Gửi OTP
              </button>
            </div>
          </div>

          {isOtpSent && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Mã xác thực OTP (6 chữ số):</label>
                {demoCode && (
                  <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-mono font-bold">
                    Mã test: {demoCode}
                  </span>
                )}
              </div>
              <input 
                type="text" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Nhập mã 6 chữ số"
                maxLength={6}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono tracking-widest text-center text-sm font-bold"
              />
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vai trò tài khoản:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`p-2 rounded-lg border font-semibold text-center cursor-pointer ${
                    role === 'CLIENT' ? 'border-sky-600 bg-sky-50 text-sky-900' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Khách hàng (Client)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('THERAPIST')}
                  className={`p-2 rounded-lg border font-semibold text-center cursor-pointer ${
                    role === 'THERAPIST' ? 'border-sky-600 bg-sky-50 text-sky-900' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Chuyên gia (Therapist)
                </button>
              </div>
            </div>
          )}

          {isOtpSent && (
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              Xác thực OTP & Bắt đầu
            </button>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
              className="text-sky-700 hover:underline cursor-pointer text-xs font-semibold"
            >
              {mode === 'LOGIN' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>

        {/* Fast Test Persona Switcher */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">
            Đăng nhập nhanh các vai trò để kiểm thử SWP391:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleFastSwitch(u.id)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left text-slate-700 cursor-pointer transition-colors"
              >
                <div className="font-bold truncate text-[11px]">{u.fullName}</div>
                <div className="text-[10px] text-sky-700 uppercase font-semibold">{u.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
