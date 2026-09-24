# KhanhAn - A Holistic Wellness & Tele-Therapy Hub
**Mã dự án:** SWP391-HLT-01 | **Môn học:** Software Development Project (SWP391)  
**Giảng viên phụ trách:** ManhNC5@fpt.edu.vn  
**Domain:** Healthcare, Holistic Wellness, E-Commerce  

---

## 1. Giới thiệu Dự án
**KhanhAn** là nền tảng số hợp nhất về chăm sóc sức khỏe toàn diện (Holistic Wellness) và tham vấn tâm lý từ xa (Tele-Therapy). Hệ thống giải quyết tình trạng phân mảnh trong chăm sóc sức khỏe, kết nối trực tiếp khách hàng với các Chuyên gia & Bác sĩ được cấp Chứng chỉ Hành nghề Y tế (CCHN) theo Luật Khám bệnh, chữa bệnh số 15/2023/QH15, cung cấp thư viện media chất lượng cao theo chuẩn GWI, và hệ sinh thái theo dõi thói quen sống lành mạnh theo hướng dẫn của WHO.

---

## 2. Kiến trúc Hệ thống theo Mô hình MVC (Model - View - Controller)
Mã nguồn được tổ chức sạch, phân lớp tường minh theo tiêu chuẩn doanh nghiệp:

```
├── /src/
│   ├── models/                    # Lớp Dữ liệu & Nghiệp vụ cốt lõi (Model)
│   │   ├── types.ts               # Định nghĩa thực thể, TypeScript interfaces & contracts
│   │   ├── initialData.ts         # Hạt giống dữ liệu ban đầu cho các vai trò & bác sĩ
│   │   ├── crypto.ts              # Mã hóa Web Crypto AES-GCM-256 & PBKDF2 cho ePHI
│   │   └── storage.ts             # Reactive DataStore & Concurrency Mutex Lock
│   │
│   ├── controllers/               # Lớp Điều khiển & Logic nghiệp vụ (Controller)
│   │   ├── authController.ts      # Xác thực Google OAuth SSO, OTP, Quyền xóa dữ liệu NĐ 356 (UC03)
│   │   ├── bookingController.ts   # Concurrency Lock chống trùng lịch, Tính toán hoàn 100%/0%
│   │   ├── contentController.ts   # Quản lý media GWI, Giới hạn VIP, Thanh toán PCI-DSS Token
│   │   ├── habitController.ts     # Checklist thói quen, Tự động thưởng Zen Points, Biểu đồ 7/30 ngày
│   │   └── adminController.ts     # Thẩm định Bác sĩ, Kiểm duyệt đánh giá, Báo cáo tài chính & Cảnh báo 72h
│   │
│   └── views/                     # Lớp Giao diện & Trải nghiệm người dùng (View)
│       ├── Navbar.tsx             # Thanh điều hướng với bộ chuyển đổi Persona/Role tức thì
│       ├── HomeView.tsx           # Trang chủ tone xanh dương tối giản, Banner cảnh báo sự cố NĐ 356
│       ├── TeleTherapyView.tsx    # Đặt lịch hẹn, Khóa xung đột Concurrency, Hộp kiểm không tích sẵn
│       ├── AppointmentsView.tsx   # Quản lý lịch hẹn, Phòng họp Meet, Bệnh án mã hóa AES (HIPAA)
│       ├── WellnessLibraryView.tsx# Thư viện bài viết/video GWI, Mở khóa gói hội viên VIP
│       ├── HabitZenView.tsx       # Theo dõi nước/ngủ/mood, Biểu đồ SVG xu hướng, Bảng xếp hạng Zen
│       ├── HealthProfileView.tsx  # Đánh giá sức khỏe nhạy cảm, Quyền xóa dữ liệu theo Điều 5 NĐ 356
│       ├── TherapistWorkspaceView.tsx # Thiết lập lịch làm việc theo ca, Biểu phí và CCHN Y tế
│       ├── AdminDashboardView.tsx # Dashboard tài chính (Hoa hồng 15%), Cảnh báo khẩn cấp 72 giờ
│       ├── AuthModal.tsx          # Popup đăng nhập Google OAuth SSO & OTP Email
│       └── DocumentationModal.tsx # Trình tra cứu tài liệu kỹ thuật & an ninh trực quan trong app
│
├── /supabase/
│   └── schema.sql                 # PostgreSQL DDL, RLS Policies, Unique constraints & Triggers
└── /README.md                     # Tài liệu hướng dẫn chi tiết
```

---

## 3. Tuân thủ Quy định Pháp lý & Chuẩn An ninh Quốc tế

### A. Nghị định 356/2025/NĐ-CP về Bảo vệ Dữ liệu Cá nhân
1. **Điều 4 (Dữ liệu cá nhân nhạy cảm):** Hồ sơ tâm lý và bệnh án tham vấn được phân loại là dữ liệu nhạy cảm cấp cao, được mã hóa phía Client với thuật toán `AES-GCM-256` trước khi gửi lên cơ sở dữ liệu.
2. **Điều 6 (Sự đồng ý có thể xác minh - Verifiable Consent):** Hộp kiểm chấp thuận cung cấp dữ liệu sức khỏe **tuyệt đối không được tích sẵn mặc định (No default-checked boxes)**. Hệ thống sẽ chặn thao tác submit nếu người dùng không tự tay tích chọn.
3. **Điều 5 (Quyền của Chủ thể Dữ liệu):** Cung cấp giao diện chuyên dụng cho Khách hàng thực thi **Quyền được xóa dữ liệu (Right to Deletion / Anonymization)** vĩnh viễn với nhật ký kiểm toán.
4. **Cảnh báo Vi phạm Dữ liệu trong 72 Giờ (UC25):** Module DPO cho phép Quản trị viên phát thông báo khẩn cấp tới cơ quan thẩm quyền và toàn bộ người dùng trong vòng tối đa 72 giờ khi phát hiện sự cố.

### B. Tiêu chuẩn Y tế HIPAA (Health Insurance Portability and Accountability Act)
- **HIPAA Security Rule (ePHI Encryption):** Toàn bộ ghi chú bệnh án tham vấn (Consultation Notes) được mã hóa bằng khóa bí mật riêng biệt giữa Chuyên gia và Bệnh nhân.
- **Admin Blinded Restriction:** Tài khoản Quản trị viên hệ thống (Super Admin) bị giới hạn kỹ thuật tuyệt đối, không thể giải mã hoặc đọc nội dung thô (plaintext) của bệnh án cá nhân.

### C. Chuẩn Bảo mật OWASP Top 10
- **A01: Broken Access Control:** Thực thi Role-Based Access Control (RBAC) nghiêm ngặt cho 4 vai trò: `CLIENT`, `THERAPIST`, `CONTENT_CREATOR`, `ADMIN`.
- **A02: Cryptographic Failures:** Chuẩn Web Crypto API với hàm dẫn xuất khóa `PBKDF2` (100.000 iterations, Salt ngẫu nhiên).
- **A03: Injection:** Truy vấn an toàn qua Parameterized Statements / Supabase ORM.
- **A04: Insecure Design:** Kiểm soát đồng thời (Concurrency Mutex Lock) loại trừ khả năng Race Conditions khi đặt lịch.
- **A07: Identification and Authentication Failures:** Single Sign-On với Google Identity và xác thực OTP 6 số hết hạn sau 5 phút.

### D. Chuẩn PCI-DSS cho Thanh toán Trực tuyến
- Áp dụng cơ chế mã hóa một chiều (Tokenization) từ cổng thanh toán (VNPay / MoMo / Stripe). Máy chủ không bao giờ lưu trữ số thẻ tín dụng hoặc mã CVV thô của người dùng.

---

## 4. Năm Quy tắc Nghiệp vụ Cốt lõi (Strict Business Rules)
1. **Chống trùng lịch (Double-Booking Prevention):** Kiểm soát đồng thời với khóa Mutex cấp ứng dụng và ràng buộc `UNIQUE (therapist_id, appointment_date, start_time)` ở cấp database. Nếu hai người đặt cùng lúc, người thứ hai sẽ nhận thông báo lỗi xung đột.
2. **Chính sách Hoàn hủy 24 Giờ:**
   - Hủy trước giờ hẹn > 24 giờ: Hoàn tiền 100% về ví cá nhân.
   - Hủy trong vòng 24 giờ: Hoàn tiền 0%.
3. **Quy tắc chấp thuận chủ động (No Default-Checked Boxes):** Không bao giờ tích sẵn ô đồng ý dữ liệu nhạy cảm.
4. **Tuyên bố Miễn trừ Y tế (Medical Disclaimer):** Khách hàng bắt buộc phải xác nhận dịch vụ chăm sóc sức khỏe toàn diện không thay thế cho cấp cứu y tế trước khi đặt lịch.
5. **Bảo mật Bệnh án ePHI:** Quản trị viên bị chặn xem nội dung plaintext của bệnh án tham vấn và hồ sơ đánh giá sức khỏe.

---

## 5. Hướng dẫn Triển khai trên Vercel & Kết nối Supabase

### Bước 1: Khởi tạo Cơ sở Dữ liệu trên Supabase
1. Đăng nhập [Supabase Dashboard](https://supabase.com).
2. Tạo New Project (chọn Region Singapore để tối ưu tốc độ cho Việt Nam).
3. Mở mục **SQL Editor** trong thanh công cụ bên trái.
4. Sao chép toàn bộ mã SQL từ tệp `/supabase/schema.sql` trong dự án KhanhAn và bấm **Run**.
5. Cơ sở dữ liệu sẽ được tạo đầy đủ 9 bảng, các ràng buộc toàn vẹn, chỉ mục Index và chính sách Row Level Security (RLS).

### Bước 2: Cấu hình Biến môi trường
Tạo file `.env.local` hoặc cấu hình trên Environment Variables của Vercel:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

### Bước 3: Triển khai lên Vercel
1. Đẩy mã nguồn lên GitHub.
2. Truy cập [Vercel](https://vercel.com) → Chọn **Add New Project** → Import repository KhanhAn.
3. Framework Preset: **Vite**.
4. Khai báo các Environment Variables đã chuẩn bị ở Bước 2.
5. Bấm **Deploy**. Vercel sẽ tự động build và cung cấp domain HTTPS toàn cầu với hiệu suất tải trang cao nhất nhờ React và Tailwind CSS.

---
*Dự án hoàn thành bởi nhóm 5 sinh viên SWP391 dưới sự hướng dẫn của Giảng viên ManhNC5@fpt.edu.vn.*
