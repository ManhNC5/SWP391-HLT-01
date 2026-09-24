/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Master Initial Seeds & Mock Database
 */

import { User, TherapistProfile, WellnessContent, Appointment, Review, GamificationRule, IncidentAlert } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_client_1',
    email: 'client@khanhan.vn',
    fullName: 'Nguyễn Thu Hà',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'CLIENT',
    status: 'ACTIVE',
    walletBalance: 1250000,
    zenPoints: 340,
    isVip: true,
    vipExpiresAt: '2026-12-31T23:59:59Z',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-09-20T10:15:00Z',
    authProvider: 'google',
    phoneNumber: '0901234567',
    isHealthProfileConsentGiven: true,
    healthProfileConsentTimestamp: '2026-01-16T09:00:00Z'
  },
  {
    id: 'user_therapist_1',
    email: 'therapist@khanhan.vn',
    fullName: 'TS. BS. Trần Minh Khang',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    role: 'THERAPIST',
    status: 'ACTIVE',
    walletBalance: 8400000,
    zenPoints: 920,
    isVip: true,
    createdAt: '2025-11-10T08:00:00Z',
    updatedAt: '2026-09-22T14:30:00Z',
    authProvider: 'google',
    phoneNumber: '0912345678'
  },
  {
    id: 'user_therapist_2',
    email: 'lananh.therapy@khanhan.vn',
    fullName: 'ThS. Nguyễn Lan Anh',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813594-5555416043ef?w=150&auto=format&fit=crop&q=80',
    role: 'THERAPIST',
    status: 'ACTIVE',
    walletBalance: 5600000,
    zenPoints: 760,
    isVip: true,
    createdAt: '2025-12-05T09:00:00Z',
    updatedAt: '2026-09-23T11:00:00Z',
    authProvider: 'password',
    phoneNumber: '0987654321'
  },
  {
    id: 'user_creator_1',
    email: 'creator@khanhan.vn',
    fullName: 'Lê Hoàng Yến',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'CONTENT_CREATOR',
    status: 'ACTIVE',
    walletBalance: 3200000,
    zenPoints: 580,
    isVip: true,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-09-21T09:00:00Z',
    authProvider: 'google',
    phoneNumber: '0977112233'
  },
  {
    id: 'user_admin_1',
    email: 'admin@khanhan.vn',
    fullName: 'Ban Quản Trị Hệ Thống (DPO/Admin)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    status: 'ACTIVE',
    walletBalance: 0,
    zenPoints: 1200,
    isVip: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-09-24T08:00:00Z',
    authProvider: 'google'
  }
];

export const INITIAL_THERAPISTS: TherapistProfile[] = [
  {
    userId: 'user_therapist_1',
    title: 'Tiến sĩ Tâm lý học Lâm sàng - Chuyên gia Somatic Therapy',
    licenseNumber: '014829/BYT-CCHN (Bộ Y Tế cấp theo Luật 15/2023/QH15)',
    licenseIssuingAuthority: 'Sở Y tế TP. Hà Nội & Hội Tâm lý Trị liệu Việt Nam',
    certificates: [
      {
        id: 'cert_1',
        name: 'Chứng chỉ Hành nghề Khám bệnh, chữa bệnh Tâm lý số 014829/BYT',
        issuedBy: 'Bộ Y Tế Việt Nam',
        year: 2021,
        fileUrl: 'https://example.com/certs/cchn-tranminhkhang.pdf',
        verified: true
      },
      {
        id: 'cert_2',
        name: 'Somatic Experiencing Practitioner (SEP)',
        issuedBy: 'Somatic Experiencing Trauma Institute (USA)',
        year: 2023,
        fileUrl: 'https://example.com/certs/sep-trauma-2023.pdf',
        verified: true
      }
    ],
    specialties: ['Anxiety & Stress', 'Somatic & Thể chấn thương', 'Mất ngủ kinh niên'],
    biography: 'Hơn 12 năm kinh nghiệm tư vấn và hỗ trợ phục hồi tinh thần cho người đi làm, lãnh đạo chịu áp lực cao và các rối loạn âu lo liên quan đến thể chất - tinh thần.',
    consultationFee: 450000, // 450,000 VND / slot
    ratingAverage: 4.9,
    ratingCount: 38,
    isVerifiedByAdmin: true,
    verificationDate: '2025-11-12T10:00:00Z',
    weeklyAvailability: [
      {
        dayOfWeek: 1, // Thứ 2
        slots: [
          { startTime: '09:00', endTime: '10:00', isActive: true },
          { startTime: '10:30', endTime: '11:30', isActive: true },
          { startTime: '14:00', endTime: '15:00', isActive: true },
          { startTime: '15:30', endTime: '16:30', isActive: true }
        ]
      },
      {
        dayOfWeek: 3, // Thứ 4
        slots: [
          { startTime: '09:00', endTime: '10:00', isActive: true },
          { startTime: '14:00', endTime: '15:00', isActive: true }
        ]
      },
      {
        dayOfWeek: 5, // Thứ 6
        slots: [
          { startTime: '10:00', endTime: '11:00', isActive: true },
          { startTime: '15:00', endTime: '16:00', isActive: true }
        ]
      },
      {
        dayOfWeek: 6, // Thứ 7
        slots: [
          { startTime: '09:00', endTime: '10:00', isActive: true },
          { startTime: '10:30', endTime: '11:30', isActive: true }
        ]
      }
    ]
  },
  {
    userId: 'user_therapist_2',
    title: 'Thạc sĩ Tâm lý Học đường & Dinh dưỡng Kháng viêm',
    licenseNumber: '028911/BYT-CCHN',
    licenseIssuingAuthority: 'Sở Y tế TP. Hồ Chí Minh',
    certificates: [
      {
        id: 'cert_3',
        name: 'Chứng chỉ Hành nghề Chăm sóc Sức khỏe Thần kinh số 028911/BYT',
        issuedBy: 'Sở Y Tế TP.HCM',
        year: 2022,
        fileUrl: 'https://example.com/certs/cchn-lananh.pdf',
        verified: true
      }
    ],
    specialties: ['Dinh dưỡng phục hồi năng lượng', 'Mindfulness', 'Stress tuổi trẻ'],
    biography: 'Chuyên gia kết hợp dinh dưỡng tự nhiên và chánh niệm để cân bằng hormone căng thẳng cortisol và tái tạo giấc ngủ sâu.',
    consultationFee: 380000,
    ratingAverage: 4.8,
    ratingCount: 24,
    isVerifiedByAdmin: true,
    verificationDate: '2025-12-08T09:00:00Z',
    weeklyAvailability: [
      {
        dayOfWeek: 2,
        slots: [
          { startTime: '08:30', endTime: '09:30', isActive: true },
          { startTime: '10:00', endTime: '11:00', isActive: true }
        ]
      },
      {
        dayOfWeek: 4,
        slots: [
          { startTime: '14:00', endTime: '15:00', isActive: true },
          { startTime: '15:30', endTime: '16:30', isActive: true }
        ]
      }
    ]
  }
];

export const MASTER_SPECIALTIES = [
  'Anxiety & Stress',
  'Somatic & Thể chấn thương',
  'Mất ngủ kinh niên',
  'Dinh dưỡng phục hồi năng lượng',
  'Mindfulness & Giảm áp lực',
  'Tâm lý Hôn nhân & Gia đình',
  'Burnout công sở'
];

export const INITIAL_CONTENT: WellnessContent[] = [
  {
    id: 'art_1',
    title: 'Somatic Experiencing: Kỹ thuật xả nén thần kinh phế vị trong 10 phút',
    slug: 'somatic-experiencing-xa-nen-than-kinh-phe-vi',
    excerpt: 'Phương pháp khoa học giải phóng cortisol và cảm giác nghẹn thắt lồng ngực thông qua vận động vi mô và điều hòa hơi thở.',
    content: 'Khi đối mặt với căng thẳng kéo dài, hệ thần kinh giao cảm kích hoạt trạng thái "Chiến hoặc Biến". Kỹ thuật Somatic Grounding giúp đưa tín hiệu an toàn trở lại não bộ thông qua cảm nhận lòng bàn chân và nhịp thở hộp 4-4-4-4...',
    category: 'Somatic Therapy',
    mediaType: 'ARTICLE',
    readTimeMinutes: 6,
    authorId: 'user_creator_1',
    authorName: 'Lê Hoàng Yến',
    authorRole: 'Master Somatic Coach',
    isVipOnly: false,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    likesCount: 142,
    createdAt: '2026-09-10T08:00:00Z',
    tags: ['Somatic', 'Giảm stress', 'Hơi thở']
  },
  {
    id: 'art_2',
    title: 'Nghệ thuật Yoga Nidra: Tái tạo sóng não Delta cho giấc ngủ sâu',
    slug: 'nghe-thuat-yoga-nidra-song-nao-delta',
    excerpt: 'Bài hướng dẫn âm thanh cao cấp độc quyền: Đưa não bộ vào trạng thái ngủ có ý thức để kích thích tế bào thần kinh tự phục hồi.',
    content: 'Yoga Nidra được mệnh danh là giấc ngủ thanh tẩy tâm trí. Chỉ 30 phút thực hành đúng chuẩn mang lại hiệu quả tương đương 3 giờ ngủ sinh lý tự nhiên...',
    category: 'Sleep Health',
    mediaType: 'AUDIO_GUIDE',
    readTimeMinutes: 20,
    authorId: 'user_creator_1',
    authorName: 'Lê Hoàng Yến',
    authorRole: 'Master Somatic Coach',
    isVipOnly: true,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    likesCount: 289,
    createdAt: '2026-09-18T10:00:00Z',
    tags: ['Yoga Nidra', 'Giấc ngủ', 'VIP Masterclass']
  },
  {
    id: 'art_3',
    title: 'Dinh dưỡng kháng viêm (Anti-Inflammatory) cho người kiệt sức công sở',
    slug: 'dinh-duong-khang-viem-chong-burnout',
    excerpt: 'Hướng dẫn cụ thể về việc điều chỉnh thực đơn giàu polyphenol, omega-3 để giảm stress oxy hóa và nâng cao năng lượng tế bào ty thể.',
    content: 'Tình trạng sương mù não (Brain Fog) vào buổi chiều thường xuất phát từ sự biến động đường huyết đột ngột và phản ứng viêm đường tiêu hóa...',
    category: 'Nutrition',
    mediaType: 'ARTICLE',
    readTimeMinutes: 8,
    authorId: 'user_therapist_2',
    authorName: 'ThS. Nguyễn Lan Anh',
    authorRole: 'Chuyên gia Dinh dưỡng',
    isVipOnly: false,
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80',
    likesCount: 175,
    createdAt: '2026-09-12T14:20:00Z',
    tags: ['Dinh dưỡng', 'Burnout', 'Kháng viêm']
  },
  {
    id: 'art_4',
    title: 'Video Guide: Giải tỏa ứ đọng năng lượng vùng cổ vai gáy do stress',
    slug: 'video-giai-toa-u-dong-co-vai-gay',
    excerpt: 'Chuỗi động tác kéo giãn vi mô và định vị khớp cắn dành riêng cho người ngồi máy tính hơn 8 tiếng mỗi ngày.',
    content: 'Cổ vai gáy là nơi lưu trữ ký ức cơ bắp của cảm xúc lo âu. Video 15 phút này tập trung vào các điểm kích hoạt trigger points...',
    category: 'Physical Recovery',
    mediaType: 'VIDEO',
    mediaUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    readTimeMinutes: 15,
    authorId: 'user_creator_1',
    authorName: 'Lê Hoàng Yến',
    authorRole: 'Master Somatic Coach',
    isVipOnly: true,
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    likesCount: 310,
    createdAt: '2026-09-19T09:15:00Z',
    tags: ['Video VIP', 'Vận động', 'Cổ vai gáy']
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_past_1',
    therapistId: 'user_therapist_1',
    therapistName: 'TS. BS. Trần Minh Khang',
    clientId: 'user_client_1',
    clientName: 'Nguyễn Thu Hà',
    clientEmail: 'client@khanhan.vn',
    date: '2026-09-15',
    startTime: '10:30',
    endTime: '11:30',
    fee: 450000,
    status: 'COMPLETED',
    videoMeetingUrl: 'https://meet.google.com/kha-znhk-wtp',
    medicalDisclaimerAcknowledged: true,
    createdAt: '2026-09-10T11:00:00Z',
    hasClientReviewed: true
  },
  {
    id: 'apt_upcoming_1',
    therapistId: 'user_therapist_1',
    therapistName: 'TS. BS. Trần Minh Khang',
    clientId: 'user_client_1',
    clientName: 'Nguyễn Thu Hà',
    clientEmail: 'client@khanhan.vn',
    date: '2026-09-28',
    startTime: '09:00',
    endTime: '10:00',
    fee: 450000,
    status: 'CONFIRMED',
    videoMeetingUrl: 'https://meet.google.com/opt-yqms-kha',
    medicalDisclaimerAcknowledged: true,
    createdAt: '2026-09-21T08:00:00Z',
    hasClientReviewed: false
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    appointmentId: 'apt_past_1',
    therapistId: 'user_therapist_1',
    clientId: 'user_client_1',
    clientName: 'Nguyễn Thu Hà',
    clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Bác sĩ Khang có phong thái rất điềm đạm và lắng nghe sâu sắc. Sau buổi tư vấn, kỹ thuật Somatic bác sĩ hướng dẫn đã giúp tôi giảm bớt triệu chứng hồi hộp và ngủ ngon hơn hẳn.',
    createdAt: '2026-09-16T09:30:00Z',
    isModerated: false
  },
  {
    id: 'rev_2',
    appointmentId: 'apt_past_0',
    therapistId: 'user_therapist_1',
    clientId: 'user_anon_2',
    clientName: 'Vũ Đức Nam',
    rating: 5,
    comment: 'Phòng khám trực tuyến bảo mật tốt, đường truyền video mượt mà. Đánh giá 5 sao cho tính chuyên nghiệp của nền tảng KhanhAn.',
    createdAt: '2026-09-08T16:00:00Z',
    isModerated: false
  }
];

export const INITIAL_GAMIFICATION_RULES: GamificationRule[] = [
  {
    id: 'rule_1',
    actionCode: 'HABIT_WATER',
    description: 'Uống đủ 8 ly nước lọc / ngày',
    points: 10,
    isActive: true
  },
  {
    id: 'rule_2',
    actionCode: 'HABIT_SLEEP',
    description: 'Ngủ đủ 7-8 giờ đúng nhịp sinh học',
    points: 15,
    isActive: true
  },
  {
    id: 'rule_3',
    actionCode: 'HABIT_MOOD',
    description: 'Ghi nhận cảm xúc & tự soi chiếu nội tâm',
    points: 10,
    isActive: true
  },
  {
    id: 'rule_4',
    actionCode: 'HABIT_MINDFULNESS',
    description: 'Thực hành thiền định / hơi thở tối thiểu 15 phút',
    points: 20,
    isActive: true
  },
  {
    id: 'rule_5',
    actionCode: 'TELE_THERAPY_COMPLETED',
    description: 'Hoàn thành buổi tham vấn cùng chuyên gia trị liệu',
    points: 50,
    isActive: true
  }
];

export const INITIAL_INCIDENT_ALERTS: IncidentAlert[] = [
  {
    id: 'inc_sample_1',
    title: 'Cảnh báo An toàn Dữ liệu: Kiểm tra định kỳ theo Nghị định 356/2025/NĐ-CP',
    severity: 'LOW',
    description: 'Hệ thống đã thực hiện xoay vòng khóa mã hóa AES-GCM-256 định kỳ cho toàn bộ dữ liệu hồ sơ sức khỏe. Toàn bộ thông tin được bảo vệ tuyệt đối.',
    affectedScope: 'Toàn bộ tài khoản người dùng',
    remedialActions: 'Kiểm toán an ninh độc lập và cập nhật quy tắc RBAC.',
    reportedAt: '2026-09-20T08:00:00Z',
    decree356Deadline: '2026-09-23T08:00:00Z',
    status: 'RESOLVED',
    broadcastedToUsers: true
  }
];
