/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Content Library & E-Commerce Controller (Module 2)
 * Manages wellness media, VIP restrictions, search/filters, bookmarks, and subscriptions
 */

import { dataStore } from '../models/storage';
import { WellnessContent } from '../models/types';

export class ContentController {
  /**
   * Filter and search wellness library
   */
  public static getArticles(filter?: {
    keyword?: string;
    category?: string;
    onlyVip?: boolean;
    onlyBookmarked?: boolean;
    userId?: string;
  }): WellnessContent[] {
    let list = dataStore.getContent();

    if (filter?.keyword && filter.keyword.trim() !== '') {
      const kw = filter.keyword.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(kw) || 
        item.excerpt.toLowerCase().includes(kw) ||
        item.tags.some(t => t.toLowerCase().includes(kw))
      );
    }

    if (filter?.category && filter.category !== 'ALL') {
      list = list.filter(item => item.category === filter.category);
    }

    if (filter?.onlyVip) {
      list = list.filter(item => item.isVipOnly);
    }

    if (filter?.onlyBookmarked && filter.userId) {
      const bookmarks = new Set(dataStore.getBookmarks(filter.userId));
      list = list.filter(item => bookmarks.has(item.id));
    }

    return list;
  }

  /**
   * Check VIP access restriction (UC09)
   */
  public static canAccessContent(content: WellnessContent): boolean {
    if (!content.isVipOnly) return true;
    const currentUser = dataStore.getCurrentUser();
    return currentUser.isVip;
  }

  /**
   * Bookmark or unbookmark article
   */
  public static toggleBookmark(contentId: string): boolean {
    const currentUser = dataStore.getCurrentUser();
    return dataStore.toggleBookmark(currentUser.id, contentId);
  }

  /**
   * Content Creator: Upload or Edit Article (UC06)
   */
  public static saveArticle(content: Partial<WellnessContent>): { success: boolean; item?: WellnessContent; message: string } {
    const currentUser = dataStore.getCurrentUser();
    if (currentUser.role !== 'CONTENT_CREATOR' && currentUser.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Bạn không có quyền đăng tải hoặc chỉnh sửa tài nguyên nội dung chuyên môn.'
      };
    }

    const all = dataStore.getContent();
    let savedItem: WellnessContent;

    if (content.id) {
      // Edit existing
      const existing = all.find(c => c.id === content.id);
      if (!existing) return { success: false, message: 'Nội dung không tồn tại.' };
      savedItem = {
        ...existing,
        ...content,
        title: content.title || existing.title,
        tags: content.tags || existing.tags
      } as WellnessContent;
      dataStore.saveContent(all.map(c => c.id === savedItem.id ? savedItem : c));
    } else {
      // Create new
      savedItem = {
        id: `art_${Date.now()}`,
        title: content.title || 'Bài viết sức khỏe mới',
        slug: (content.title || 'bai-viet-moi').toLowerCase().replace(/[^a-z0-9]/g, '-'),
        excerpt: content.excerpt || '',
        content: content.content || '',
        category: content.category || 'Mindfulness',
        mediaType: content.mediaType || 'ARTICLE',
        mediaUrl: content.mediaUrl,
        readTimeMinutes: content.readTimeMinutes || 5,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorRole: 'Chuyên gia nội dung',
        isVipOnly: !!content.isVipOnly,
        coverImage: content.coverImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
        likesCount: 0,
        createdAt: new Date().toISOString(),
        tags: content.tags || ['Wellness']
      };
      dataStore.saveContent([savedItem, ...all]);
    }

    return {
      success: true,
      item: savedItem,
      message: 'Lưu tài nguyên bài viết thành công!'
    };
  }

  /**
   * Purchase VIP Subscription via Payment Gateway (UC08)
   */
  public static purchaseVipSubscription(
    plan: 'MONTHLY' | 'YEARLY',
    paymentGateway: 'VNPAY' | 'MOMO' | 'STRIPE'
  ): { success: boolean; message: string } {
    const currentUser = dataStore.getCurrentUser();
    const cost = plan === 'MONTHLY' ? 199000 : 1890000; // 199k VND or 1.89m VND

    // Simulate PCI-DSS compliant payment token generation (never store raw CC numbers)
    const transactionToken = `tok_pci_${paymentGateway.toLowerCase()}_${Date.now()}`;

    // Add subscription expiration
    const expiry = new Date();
    if (plan === 'MONTHLY') {
      expiry.setMonth(expiry.getMonth() + 1);
    } else {
      expiry.setFullYear(expiry.getFullYear() + 1);
    }

    dataStore.updateUser({
      ...currentUser,
      isVip: true,
      vipExpiresAt: expiry.toISOString(),
      zenPoints: currentUser.zenPoints + 100 // Bonus 100 zen points
    });

    return {
      success: true,
      message: `Thanh toán thành công gói VIP qua ${paymentGateway} (Token: ${transactionToken.slice(0, 14)}...). Toàn bộ tài liệu VIP độc quyền đã được mở khóa!`
    };
  }
}
