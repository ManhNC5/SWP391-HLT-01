/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Daily Habit Tracking & Gamification View (Module 4)
 * Compliant with WHO Digital Health Guidelines (Non-anxiety positive reinforcement)
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplet, 
  Moon, 
  Smile, 
  Brain, 
  TrendingUp, 
  Trophy, 
  Settings2, 
  Check, 
  Plus, 
  Minus, 
  Award,
  Calendar
} from 'lucide-react';
import { User, HabitLog, GamificationRule } from '../models/types';
import { dataStore } from '../models/storage';
import { HabitController } from '../controllers/habitController';

interface HabitZenViewProps {
  currentUser: User;
}

export const HabitZenView: React.FC<HabitZenViewProps> = ({ currentUser }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentLog, setCurrentLog] = useState<HabitLog>(() => 
    HabitController.getLogForDate(currentUser.id, todayStr)
  );
  const [activeRange, setActiveRange] = useState<7 | 30>(7);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Gamification Rules config modal (UC20 for Admin)
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [rulesList, setRulesList] = useState<GamificationRule[]>(() => dataStore.getGamificationRules());

  const trend = HabitController.getTrendAnalytics(currentUser.id, activeRange);
  const leaderboard = HabitController.getLeaderboard();

  const handleWaterChange = (delta: number) => {
    const updated = {
      ...currentLog,
      waterGlasses: Math.max(0, Math.min(16, currentLog.waterGlasses + delta))
    };
    setCurrentLog(updated);
  };

  const handleSleepChange = (delta: number) => {
    const updated = {
      ...currentLog,
      sleepHours: Number(Math.max(0, Math.min(14, currentLog.sleepHours + delta)).toFixed(1))
    };
    setCurrentLog(updated);
  };

  const handleMoodSelect = (mood: HabitLog['mood']) => {
    setCurrentLog({ ...currentLog, mood });
  };

  const handleMindfulnessChange = (delta: number) => {
    const updated = {
      ...currentLog,
      mindfulnessMinutes: Math.max(0, Math.min(120, currentLog.mindfulnessMinutes + delta))
    };
    setCurrentLog(updated);
  };

  const handleSaveDailyLog = () => {
    const res = HabitController.saveHabitLog(currentLog);
    setSaveNotice(res.message);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleUpdateRulePoints = (ruleId: string, newPoints: number) => {
    const updated = rulesList.map(r => r.id === ruleId ? { ...r, points: newPoints } : r);
    setRulesList(updated);
    dataStore.saveGamificationRules(updated);
  };

  // SVG Chart Dimensions & Helpers
  const chartHeight = 120;
  const chartWidth = 460;
  const maxWaterVal = 10;
  const pointsString = trend.waterData.map((val, idx) => {
    const x = (idx / (trend.waterData.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxWaterVal) * chartHeight;
    return `${x},${Math.max(10, Math.min(chartHeight - 10, y))}`;
  }).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            Nhật ký Thói quen & Zen Points
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              WHO Guided
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Ghi nhận tiến trình sức khỏe không áp lực theo hướng dẫn của Tổ chức Y tế Thế giới (WHO) và tích lũy Zen Points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Ví Zen: {currentUser.zenPoints} Points</span>
          </div>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-slate-500" />
              Cấu hình Điểm thưởng (UC20)
            </button>
          )}
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Main Grid: Habit Tracker & Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Daily Habit Checklist (UC16 & UC17) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                Điểm danh Thói quen Hôm nay ({todayStr})
              </div>
              <span className="text-[11px] text-slate-400">Tự động cộng Zen Points</span>
            </div>

            {/* 1. Water Intake */}
            <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Uống nước tinh khiết</div>
                  <div className="text-[11px] text-slate-500">Mục tiêu: 8 ly (2.0L) · +10 Zen</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleWaterChange(-1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-sm text-sky-900 w-8 text-center">
                  {currentLog.waterGlasses}
                </span>
                <button
                  type="button"
                  onClick={() => handleWaterChange(1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Sleep Hours */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Thời gian ngủ chất lượng</div>
                  <div className="text-[11px] text-slate-500">Mục tiêu: 7 - 8 giờ · +15 Zen</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSleepChange(-0.5)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-sm text-indigo-900 w-12 text-center">
                  {currentLog.sleepHours}h
                </span>
                <button
                  type="button"
                  onClick={() => handleSleepChange(0.5)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Mood Self-Reflection */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Smile className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tâm trạng chủ đạo hôm nay</div>
                    <div className="text-[11px] text-slate-500">Tự soi chiếu cảm xúc · +10 Zen</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1 text-xs">
                {[
                  { key: 'PEACEFUL', label: 'Bình an', emoji: '😌' },
                  { key: 'GOOD', label: 'Tốt', emoji: '😊' },
                  { key: 'NEUTRAL', label: 'Bình thường', emoji: '😐' },
                  { key: 'STRESSED', label: 'Căng thẳng', emoji: '😓' },
                  { key: 'ANXIOUS', label: 'Âu lo', emoji: '😰' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleMoodSelect(item.key as any)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                      currentLog.mood === item.key
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-[10px] leading-tight truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Mindfulness Practice */}
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Thiền định / Bài tập thở Somatic</div>
                  <div className="text-[11px] text-slate-500">Mục tiêu: 15 phút · +20 Zen</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleMindfulnessChange(-5)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-sm text-purple-900 w-12 text-center">
                  {currentLog.mindfulnessMinutes}p
                </span>
                <button
                  type="button"
                  onClick={() => handleMindfulnessChange(5)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Save Action */}
            <button
              type="button"
              onClick={handleSaveDailyLog}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Lưu Thói quen & Tự động Nhận Zen Points
            </button>
          </div>
        </div>

        {/* Right: Visual Analytics & Leaderboard (UC18 & UC19) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Trend Charts (UC18) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Biểu đồ Phân tích Xu hướng (UC18)</h3>
              </div>

              {/* 7 vs 30 Days Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveRange(7)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeRange === 7 ? 'bg-white font-bold text-sky-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  7 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRange(30)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeRange === 30 ? 'bg-white font-bold text-sky-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  30 Ngày
                </button>
              </div>
            </div>

            {/* Summary KPI Badges */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                <div className="text-[11px] text-slate-500">Trung bình Nước</div>
                <div className="text-base font-bold text-sky-900">{trend.averageWater} ly</div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="text-[11px] text-slate-500">Trung bình Ngủ</div>
                <div className="text-base font-bold text-indigo-900">{trend.averageSleep} giờ</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="text-[11px] text-slate-500">Chuỗi liên tục</div>
                <div className="text-base font-bold text-emerald-900">{trend.streakDays} ngày</div>
              </div>
            </div>

            {/* Interactive SVG Trend Graph */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-700 mb-2">Lượng nước uống theo ngày (Ly):</div>
              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2={chartWidth} y2="30" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2={chartWidth} y2="70" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <line x1="0" y1="110" x2={chartWidth} y2="110" stroke="#e2e8f0" strokeDasharray="3 3" />

                  {/* Target line (8 glasses) */}
                  <line x1="0" y1={chartHeight - (8 / maxWaterVal) * chartHeight} x2={chartWidth} y2={chartHeight - (8 / maxWaterVal) * chartHeight} stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Line graph */}
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />

                  {/* Nodes */}
                  {trend.waterData.map((val, idx) => {
                    const x = (idx / (trend.waterData.length - 1)) * chartWidth;
                    const y = chartHeight - (val / maxWaterVal) * chartHeight;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={Math.max(10, Math.min(chartHeight - 10, y))}
                        r="4.5"
                        fill="#ffffff"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                      />
                    );
                  })}
                </svg>

                {/* X-Axis labels */}
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                  {trend.dates.map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Community Zen Leaderboard (UC19) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Bảng Xếp Hạng Zen Points Cộng đồng (UC19)</h3>
              </div>
              <span className="text-[11px] text-slate-400">Top tích cực</span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((item) => (
                <div
                  key={item.user.id}
                  className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                    item.isCurrentUser 
                      ? 'bg-sky-50 border border-sky-200 font-bold text-sky-950' 
                      : 'bg-slate-50/60 border border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-bold ${
                      item.rank === 1 ? 'text-amber-500' :
                      item.rank === 2 ? 'text-slate-400' :
                      item.rank === 3 ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      #{item.rank}
                    </span>
                    <img 
                      src={item.user.avatarUrl} 
                      alt="" 
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="truncate max-w-[160px]">
                      {item.user.fullName} {item.isCurrentUser && '(Bạn)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-extrabold text-amber-600">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.points} Zen</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Gamification Configuration Modal (UC20) */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cấu hình Quy tắc Điểm thưởng Zen (UC20)</h3>
                <p className="text-xs text-slate-500">Quyền DPO / Quản trị viên hệ thống</p>
              </div>
              <button 
                onClick={() => setIsRulesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3">
              {rulesList.map(rule => (
                <div key={rule.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{rule.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rule.actionCode}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={rule.points}
                      onChange={(e) => handleUpdateRulePoints(rule.id, parseInt(e.target.value) || 0)}
                      className="w-16 p-1.5 text-center text-xs font-bold rounded-lg border border-slate-300 bg-white"
                    />
                    <span className="font-medium text-slate-500">Zen</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Hoàn tất & Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
