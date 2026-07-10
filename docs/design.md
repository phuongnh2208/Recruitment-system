# Design Guidelines

**Project:** TrustHire – Student Recruitment Support System

| Item             | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Version          | 2.0                                                           |
| Status           | Draft                                                         |
| Related Document | requirements.md (NFR-20, NFR-21, NFR-22), spec.md (Section 7) |
| Tech Target      | Tailwind CSS v3+ (utility-first), React + Vite                |
| Author           | Project Team                                                  |
| Last Updated     | 2026-07-10                                                    |

---

# 1. Introduction

## 1.1 Purpose

Tài liệu này định nghĩa hệ thống thiết kế (Design System) đầy đủ cho **TrustHire**, bao gồm token màu sắc, typography, spacing, và pattern component cụ thể theo Tailwind CSS, làm cơ sở triển khai nhất quán cho toàn bộ giao diện.

## 1.2 Scope

Áp dụng cho giao diện Student, Employer và Administrator trong phạm vi MVP. Tài liệu cung cấp **token và pattern tham chiếu** (design reference), không phải mã nguồn chính thức triển khai vào `source-code/frontend/` — việc hiện thực hoá thuộc Stage 5 (AI-assisted Development) sau khi tài liệu đặc tả được phê duyệt.

## 1.3 Glossary

| Thuật ngữ         | Giải thích                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| Design Token      | Giá trị thiết kế được đặt tên, ánh xạ vào `tailwind.config.js`          |
| Signature Element | Chi tiết thị giác đặc trưng, giúp nhận diện thương hiệu                 |
| Utility-first     | Phương pháp style bằng class tiện ích của Tailwind thay vì CSS tùy biến |
| Archetype         | Khuôn mẫu bố cục lặp lại cho một nhóm trang có chức năng tương tự       |

---

# 2. Design Concept

## 2.1 Ý tưởng chủ đạo: "Verification Seal"

Giá trị cốt lõi của TrustHire là **xác thực**: doanh nghiệp được kiểm duyệt, tin tuyển dụng được duyệt, hồ sơ được xác minh (BR-03, BR-04, FR-AD-02, FR-AD-03). Ngôn ngữ thiết kế lấy hình tượng **con dấu / chứng nhận chính thức** làm sợi chỉ xuyên suốt: đường viền tròn đồng tâm, huy hiệu (badge) cho trạng thái "Verified/Approved", và mã định danh dạng monospace cho các mã truy vết (Job ID, Application Code) — phản ánh đúng bản chất một hệ thống có traceability chặt chẽ.

Đây là **signature element** duy nhất được nhấn mạnh; phần còn lại của giao diện giữ tối giản, nhiều khoảng trắng, để không gây rối mắt.

## 2.2 Vì sao không dùng công thức mặc định

| Công thức phổ biến (tránh)                 | Lựa chọn của TrustHire                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Nền cream + serif tương phản cao + cam đất | Nền paper mát (xanh xám nhạt) + serif có tính cách vừa phải + accent gold ánh kim |
| Nền đen tuyền + 1 accent neon              | Nền sáng, tông emerald đậm làm chủ đạo                                            |
| Layout newspaper viền chỉ mảnh, bo góc = 0 | Bo góc mềm có kiểm soát                                                           |

---

# 3. Design Tokens

## 3.1 Color Palette

| Token          | Hex       | Tên gọi       | Mục đích                                                   |
| -------------- | --------- | ------------- | ---------------------------------------------------------- |
| `primary`      | `#146356` | Emerald Trust | Thương hiệu chính, nút hành động, trạng thái Approved/Open |
| `primary-dark` | `#0D453C` | Deep Emerald  | Hover/active của nút chính, nền header tối                 |
| `accent`       | `#C99A3B` | Signal Gold   | Huy hiệu "Verified", điểm nhấn cao cấp, icon xác thực      |
| `ink`          | `#142019` | Ink           | Văn bản chính                                              |
| `paper`        | `#F6F7F3` | Paper         | Nền trang (mát hơn cream, tránh công thức mặc định)        |
| `sage`         | `#DCE6DD` | Sage          | Nền phụ, border, khối chia section                         |
| `danger`       | `#B23A2E` | Brick Alert   | Lỗi, trạng thái Rejected                                   |
| `warning`      | `#C97C2C` | Amber Pending | Trạng thái Pending                                         |

### Cấu hình Tailwind (`tailwind.config.js`)

```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#146356',
        dark: '#0D453C',
        light: '#E4F0EC',
      },
      accent: {
        DEFAULT: '#C99A3B',
        light: '#F6ECD6',
      },
      ink: '#142019',
      paper: '#F6F7F3',
      sage: '#DCE6DD',
      danger: { DEFAULT: '#B23A2E', light: '#F7E4E1' },
      warning: { DEFAULT: '#C97C2C', light: '#FBEBD9' },
    },
    fontFamily: {
      display: ['Fraunces', 'serif'],
      body: ['"Be Vietnam Pro"', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'monospace'],
    },
    borderRadius: {
      seal: '999px',
      card: '14px',
    },
    boxShadow: {
      card: '0 2px 10px -2px rgba(20, 32, 25, 0.08)',
      raised: '0 8px 24px -6px rgba(20, 32, 25, 0.16)',
    },
  },
}
```

## 3.2 Typography

| Vai trò   | Font                     | Tailwind class               | Sử dụng                                       |
| --------- | ------------------------ | ---------------------------- | --------------------------------------------- |
| Display   | Fraunces (600–700)       | `font-display font-semibold` | H1, H2 — tiêu đề trang, tên công việc nổi bật |
| Body      | Be Vietnam Pro (400/500) | `font-body`                  | Toàn bộ nội dung, form, nút                   |
| Data/Mono | IBM Plex Mono (500)      | `font-mono`                  | Job ID, Application Code, Audit Log timestamp |

```html
<h1 class="font-display font-semibold text-4xl md:text-5xl text-ink leading-tight">
<h2 class="font-display font-semibold text-2xl text-ink">
<p class="font-body text-base text-ink/80 leading-relaxed">
<span class="font-mono text-xs tracking-wide text-ink/60">JOB-2026-00142</span>
```

Lý do chọn Be Vietnam Pro: hỗ trợ tốt dấu tiếng Việt, khớp yêu cầu MVP chỉ hỗ trợ Tiếng Việt (mục 6.7 requirements.md).

## 3.3 Spacing & Radius

| Token                      | Giá trị           | Tailwind              |
| -------------------------- | ----------------- | --------------------- |
| Khoảng cách cơ bản         | 4/8/16/24/40/64px | `space-1/2/4/6/10/16` |
| Bo góc Card                | 14px              | `rounded-card`        |
| Bo góc Button/Badge (seal) | full              | `rounded-seal`        |
| Bo góc Input               | 8px               | `rounded-lg`          |

---

# 4. Signature Component: Verification Badge

Huy hiệu xác thực xuất hiện ở: Employer đã duyệt, JobPosting Approved/Open, hồ sơ sinh viên đã xác thực email.

```html
<span class="inline-flex items-center gap-1.5 rounded-seal bg-accent-light
             px-3 py-1 font-mono text-xs font-medium text-accent
             ring-1 ring-accent/30">
  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="9" stroke-width="1.5"/>
    <path d="M8 12.5l2.5 2.5L16 9.5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  Verified
</span>
```

Đường viền tròn đồng tâm (`ring-1 ring-accent/30`) mô phỏng vành con dấu — chỉ dùng cho huy hiệu xác thực, không lạm dụng nơi khác để giữ giá trị biểu tượng.

---

# 5. Core Components (Tailwind Patterns)

## 5.1 Button

```html
<!-- Primary -->
<button class="rounded-seal bg-primary px-6 py-2.5 font-body font-medium
               text-white shadow-card transition hover:bg-primary-dark">
  Ứng tuyển ngay
</button>

<!-- Secondary (outline) -->
<button class="rounded-seal border border-primary px-6 py-2.5 font-body
               font-medium text-primary transition hover:bg-primary-light">
  Xem chi tiết
</button>

<!-- Disabled -->
<button disabled class="rounded-seal bg-sage px-6 py-2.5 font-body
               text-ink/40 cursor-not-allowed">
  Đã ứng tuyển
</button>
```

## 5.2 Card (Job Posting)

```html
<div class="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5
            transition hover:shadow-raised">
  <div class="flex items-start justify-between">
    <h3 class="font-display font-semibold text-lg text-ink">Backend Developer Intern</h3>
    <span class="rounded-seal bg-primary-light px-2.5 py-0.5 font-mono text-xs text-primary">Open</span>
  </div>
  <p class="mt-1 font-mono text-xs text-ink/50">JOB-2026-00142</p>
  <p class="mt-3 font-body text-sm text-ink/70 line-clamp-2">
    Tham gia đội ngũ phát triển API nội bộ, làm việc với NestJS và Prisma...
  </p>
</div>
```

## 5.3 Status Tag (theo state trong spec.md Section 7)

| Trạng thái       | Class                           |
| ---------------- | ------------------------------- |
| Draft            | `bg-sage text-ink/60`           |
| Pending          | `bg-warning-light text-warning` |
| Approved / Open  | `bg-primary-light text-primary` |
| Rejected         | `bg-danger-light text-danger`   |
| Closed / Expired | `bg-sage text-ink/50`           |

## 5.4 Form Input

```html
<label class="block">
  <span class="font-body text-sm font-medium text-ink">Email</span>
  <input type="email" class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white
         px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30
         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
  <span class="mt-1 block font-body text-xs text-danger">Email không hợp lệ.</span>
</label>
```

## 5.5 Navigation Bar

```html
<nav class="sticky top-0 z-30 flex items-center justify-between
            bg-paper/90 backdrop-blur px-8 py-4 ring-1 ring-ink/5">
  <span class="font-display text-xl font-semibold text-ink">TrustHire</span>
  <div class="hidden gap-8 font-body text-sm text-ink/70 md:flex">
    <a href="#" class="hover:text-primary">Việc làm</a>
    <a href="#" class="hover:text-primary">Doanh nghiệp</a>
    <a href="#" class="hover:text-primary">Về chúng tôi</a>
  </div>
  <button class="rounded-seal bg-primary px-5 py-2 font-body text-sm text-white hover:bg-primary-dark">
    Đăng nhập
  </button>
</nav>
```

---

# 6. Page Archetypes (Layout Concepts)

## 6.1 Landing Page

```
Nav: Logo   Menu (giua)   [Dang nhap]
------------------------------------------
H1: "Ket noi dung nguoi - dung viec,
     da duoc xac thuc."
[Tim viec lam]  [Dang tin tuyen dung]

+-- Demo tim kiem viec that (search box) --+
|  [Verified badge] Backend Intern  JOB-...|
+-------------------------------------------+
```
Hero không dùng số liệu thống kê chung chung — thay bằng khối demo tìm kiếm việc làm thật, có huy hiệu Verified, phản ánh đúng use-case chính (FR-ST-05).

## 6.2 Dashboard (Employer/Admin)

```
+--------+----------------------------------+
| Rail   |  Header: tieu de + [Hanh dong]    |
| Nav    +----------------------------------+
| (icon  |  Card luoi: KPI (mono numerals)   |
|  +text)+----------------------------------+
|        |  Bang du lieu (ma mono, tag mau)  |
+--------+----------------------------------+
```

## 6.3 Job Detail (dạng "văn bản chính thức")

Bố cục dài, giống một văn bản/chứng nhận: tiêu đề lớn font display, mã Job ID mono ngay dưới tiêu đề, khối "Yêu cầu" và "Mô tả" tách bạch bằng `sage` divider, huy hiệu Verified đặt cạnh tên doanh nghiệp.

---

# 7. Motion Guidelines

* Chuyển màu nút/hover: `transition duration-150 ease-out` — nhẹ, không phô trương.
* Card khi hover: nâng shadow (`shadow-card → shadow-raised`), không dùng scale/transform gây giật hình.
* Verified badge có thể có hiệu ứng xuất hiện một lần khi tải trang — không lặp lại liên tục.
* Tôn trọng `prefers-reduced-motion`: tắt toàn bộ transition khi người dùng bật chế độ giảm chuyển động.

---

# 8. Accessibility & Responsive

* Tương phản chữ/nền đạt tối thiểu WCAG AA (`ink` trên `paper` đạt ~13:1).
* Trạng thái lỗi luôn có văn bản kèm theo, không chỉ dựa vào màu (đáp ứng NFR-22).
* Focus ring rõ ràng bằng `focus:ring-2 focus:ring-primary/20` cho mọi phần tử tương tác.
* Ưu tiên tối ưu Desktop và Tablet (`md:`, `lg:` breakpoints) theo đúng phạm vi NFR-21; Mobile là khuyến khích thêm, không bắt buộc.

---

# 9. Traceability

| Design Element                                    | Nguồn yêu cầu                    |
| ------------------------------------------------- | -------------------------------- |
| Giao diện thân thiện, dễ sử dụng                  | NFR-20                           |
| Responsive Desktop/Tablet                         | NFR-21                           |
| Thông báo lỗi rõ ràng                             | NFR-22                           |
| Status Tag theo trạng thái JobPosting/Application | spec.md Section 7                |
| Verification Badge cho Employer/Job đã duyệt      | BR-03, BR-04, FR-AD-02, FR-AD-03 |
| Mono font cho mã truy vết                         | Yêu cầu Traceability toàn dự án  |

---

# 10. Change Log

| Version | Date       | Author       | Description                                                                                                                                     |
| ------- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-07-10 | Project Team | Khởi tạo Design Guidelines dựa trên ảnh tham chiếu phong cách                                                                                   |
| 2.0     | 2026-07-10 | Project Team | Xây dựng lại theo hướng thiết kế riêng biệt "Verification Seal", bổ sung token đầy đủ, cấu hình Tailwind, pattern component và layout archetype |