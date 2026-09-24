/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Wellness Library & VIP E-Commerce View (Module 2)
 * Manages GWI content, bookmarking, and PCI-DSS payment tokenization
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Bookmark, 
  Sparkles, 
  Lock, 
  Play, 
  Headphones, 
  FileText, 
  Heart, 
  CreditCard, 
  Plus, 
  Check, 
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { User, WellnessContent } from '../models/types';
import { dataStore } from '../models/storage';
import { ContentController } from '../controllers/contentController';

interface WellnessLibraryViewProps {
  currentUser: User;
  onOpenAuth: () => void;
}

export const WellnessLibraryView: React.FC<WellnessLibraryViewProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<WellnessContent | null>(null);

  // VIP Subscription Modal
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [paymentGateway, setPaymentGateway] = useState<'VNPAY' | 'MOMO' | 'STRIPE'>('VNPAY');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Creator Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<WellnessContent['category']>('Mindfulness');
  const [newMediaType, setNewMediaType] = useState<'ARTICLE' | 'VIDEO' | 'AUDIO_GUIDE'>('ARTICLE');
  const [newIsVip, setNewIsVip] = useState(false);

  const categories = [
    'ALL',
    'Mindfulness',
    'Nutrition',
    'Somatic Therapy',
    'Sleep Health',
    'Physical Recovery'
  ];

  const bookmarkedIds = new Set(dataStore.getBookmarks(currentUser.id));
  const articles = ContentController.getArticles({
    keyword,
    category: selectedCategory,
    onlyBookmarked: onlyBookmarks,
    userId: currentUser.id
  });

  const handleToggleBookmark = (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ContentController.toggleBookmark(contentId);
  };

  const handleOpenArticle = (article: WellnessContent) => {
    if (article.isVipOnly && !currentUser.isVip) {
      setIsVipModalOpen(true);
      return;
    }
    setSelectedArticle(article);
  };

  const handleSubscribeVip = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      const res = ContentController.purchaseVipSubscription(selectedPlan, paymentGateway);
      setPaymentProcessing(false);
      setPaymentSuccessMsg(res.message);
      setTimeout(() => {
        setIsVipModalOpen(false);
        setPaymentSuccessMsg(null);
      }, 1500);
    }, 1200);
  };

  const handleCreateArticle = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    ContentController.saveArticle({
      title: newTitle,
      excerpt: newExcerpt,
      content: newContent,
      category: newCategory,
      mediaType: newMediaType,
      isVipOnly: newIsVip
    });
    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Thư viện Tri thức & Phương pháp Phục hồi (GWI Framework)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Nghiên cứu ứng dụng Somatics, Yoga Nidra sóng Delta và Dinh dưỡng kháng viêm từ các chuyên gia hàng đầu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!currentUser.isVip && (
            <button
              onClick={() => setIsVipModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Nâng cấp VIP Hội viên
            </button>
          )}

          {(currentUser.role === 'CONTENT_CREATOR' || currentUser.role === 'ADMIN') && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo bài viết mới
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Tìm kiếm bài viết, video trị liệu, podcast..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-3">
            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                onlyBookmarks 
                  ? 'bg-sky-50 border-sky-300 text-sky-800' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-sky-700 text-sky-700' : ''}`} />
              Đã lưu ({bookmarkedIds.size})
            </button>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat 
                  ? 'bg-sky-600 text-white font-semibold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả danh mục' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Không có tài nguyên nào phù hợp với bộ lọc.
          </div>
        ) : (
          articles.map(item => {
            const isBookmarked = bookmarkedIds.has(item.id);
            const isLocked = item.isVipOnly && !currentUser.isVip;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenArticle(item)}
                className="group rounded-2xl bg-white border border-slate-200 hover:border-sky-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                <div>
                  {/* Image Cover */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={item.coverImage} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Media Type Indicator */}
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                      {item.mediaType === 'VIDEO' && <Play className="w-3 h-3 fill-white" />}
                      {item.mediaType === 'AUDIO_GUIDE' && <Headphones className="w-3 h-3" />}
                      {item.mediaType === 'ARTICLE' && <FileText className="w-3 h-3" />}
                      <span>{item.readTimeMinutes} phút</span>
                    </div>

                    {/* VIP Badge */}
                    {item.isVipOnly && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px] shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        VIP EXCLUSIVE
                      </div>
                    )}

                    {/* Bookmark Action */}
                    <button
                      onClick={(e) => handleToggleBookmark(item.id, e)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 hover:text-sky-600 transition-colors shadow-sm"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-sky-600 text-sky-600' : ''}`} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2.5">
                    <div className="text-[11px] font-semibold text-sky-700 uppercase">
                      {item.category}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-light">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Tác giả: {item.authorName}</span>
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <Lock className="w-3 h-3" />
                      Mở khóa VIP
                    </span>
                  ) : (
                    <span className="text-sky-600 font-medium group-hover:underline">
                      Xem chi tiết →
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase text-sky-600">{selectedArticle.category}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedArticle.title}</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Tác giả: {selectedArticle.authorName} ({selectedArticle.authorRole}) · {selectedArticle.readTimeMinutes} phút đọc
                </div>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <img 
              src={selectedArticle.coverImage} 
              alt={selectedArticle.title} 
              className="w-full h-56 object-cover rounded-xl"
            />

            <div className="text-xs text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap">
              {selectedArticle.content}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="font-semibold">{selectedArticle.likesCount} lượt yêu thích</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Subscription Modal (UC08 & PCI-DSS Tokenization) */}
      {isVipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nâng cấp KhanhAn VIP</h3>
                  <p className="text-xs text-slate-500">Mở khóa toàn bộ Masterclass & Video độc quyền</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVipModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan('MONTHLY')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'MONTHLY'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Gói Tháng</div>
                <div className="text-sm font-extrabold text-amber-600 mt-1">199.000 đ</div>
                <div className="text-[10px] text-slate-500">/ 30 ngày truy cập</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('YEARLY')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedPlan === 'YEARLY'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500 text-[9px] font-extrabold text-slate-950">
                  Tiết kiệm 20%
                </span>
                <div className="text-xs font-bold text-slate-900">Gói Năm</div>
                <div className="text-sm font-extrabold text-amber-600 mt-1">1.890.000 đ</div>
                <div className="text-[10px] text-slate-500">/ 365 ngày + 100 Zen</div>
              </button>
            </div>

            {/* Payment Gateway Choice (PCI-DSS Sandbox) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Cổng thanh toán trực tuyến:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['VNPAY', 'MOMO', 'STRIPE'] as const).map(gw => (
                  <button
                    key={gw}
                    type="button"
                    onClick={() => setPaymentGateway(gw)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentGateway === gw
                        ? 'border-sky-600 bg-sky-50 text-sky-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {gw === 'VNPAY' ? 'VNPay Sandbox' : gw === 'MOMO' ? 'MoMo' : 'Stripe'}
                  </button>
                ))}
              </div>
            </div>

            {/* PCI-DSS Security Guarantee */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Tuân thủ chuẩn PCI-DSS:</strong> KhanhAn chỉ sử dụng mã thông báo token hóa một chiều (Tokenization) từ cổng thanh toán đối tác. Số thẻ tín dụng không bao giờ được lưu trữ trên máy chủ nội bộ.
              </span>
            </div>

            {paymentSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-medium">
                {paymentSuccessMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsVipModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubscribeVip}
                disabled={paymentProcessing}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <CreditCard className="w-3.5 h-3.5" />
                {paymentProcessing ? 'Đang tạo Token giao dịch...' : 'Xác nhận Thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Upload Modal (UC06) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900">Đăng tải Tài nguyên Chuyên môn mới</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu đề bài viết / video:</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Kỹ thuật thở điều hòa thần kinh giao cảm..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tóm tắt ngắn (Excerpt):</label>
                <input 
                  type="text"
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="1-2 câu tóm tắt nội dung chính..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Danh mục GWI:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Somatic Therapy">Somatic Therapy</option>
                    <option value="Sleep Health">Sleep Health</option>
                    <option value="Physical Recovery">Physical Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Định dạng Media:</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="ARTICLE">Bài viết chuyên sâu</option>
                    <option value="VIDEO">Video hướng dẫn</option>
                    <option value="AUDIO_GUIDE">Audio Podcast / Thiền</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nội dung chi tiết:</label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Nội dung chuyên môn có cơ sở khoa học..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="newVipCheck"
                  checked={newIsVip}
                  onChange={(e) => setNewIsVip(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="newVipCheck" className="text-xs text-slate-800 font-medium cursor-pointer">
                  Chỉ dành riêng cho Hội viên VIP (VIP Exclusive)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateArticle}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Xuất bản Nội dung
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
