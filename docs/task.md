# Task Breakdown (Phân rã Công việc)

**Project:** TrustHire – Student Recruitment Support System  
 **Version:** 1.1  
**Status:** Ready  
**Methodology:** Specification-Driven Development (SDD)  
**Parent Documents:** `requirements.md` + `spec.md` + `architecture.md`  
 **Last Updated:** 2026-07-04

---

## 1. Overview (Tổng quan)

 Tài liệu này phân rã toàn bộ quy trình phát triển hệ thống **TrustHire** thành các tác vụ (tasks) cụ thể, chi tiết và có thể kiểm thử được. Quá trình phát triển tuân thủ triết lý **Specification-Driven Development (SDD)**, áp dụng mô hình **Clean Architecture** và cấu trúc mã nguồn **Modular Monolith** nhằm đảm bảo tính sẵn sàng mở rộng các mô-đun AI sau này.
 
 Phiên bản 1.1 bổ sung các tác vụ hiện thực Factory Pattern (TSK-INF-210), Strategy Pattern (TSK-INF-211), GetJobDetailUseCase và module Quản lý Danh mục (TSK-AD-104) theo yêu cầu ràng buộc kiến trúc tại architecture.md Mục 4.8 và 4.9.

Hệ thống được chia thành 6 giai đoạn phát triển chính từ hạ tầng cốt lõi, phát triển các module tính năng đến tích hợp, kiểm thử và triển khai.

---

## 2. Phase 1: Project Setup & Database Layer (Thiết lập Dự án & Cơ sở dữ liệu)

Giai đoạn này tập trung vào thiết lập cấu trúc khung (scaffolding) cho cả Backend và Frontend, cấu hình cơ sở dữ liệu MySQL và viết Prisma schema hoàn chỉnh.

### 2.1 Backend Scaffolding
- [x] **TSK-SYS-101**: Khởi tạo dự án Node.js với TypeScript trong thư mục `source-code/backend/`. Cấu hình `tsconfig.json` và cài đặt các dependencies cốt lõi (`express`, `typescript`, `@types/node`, `@types/express`, `pino`, `dotenv`).
- [x] **TSK-SYS-102**: Cấu hình ESLint và Prettier cho Backend đảm bảo đồng bộ chuẩn viết code.
- [x] **TSK-SYS-103**: Khởi tạo cấu hình biến môi trường (`.env.example` và `.env`) chứa các cấu hình về cổng chạy, cơ sở dữ liệu, khóa bảo mật JWT, SMTP, thư mục upload.

### 2.2 Database & Prisma Configuration
- [x] **TSK-DB-101**
  - Cài đặt Prisma ORM v6.10.1.
  - Cấu hình `schema.prisma`.
  - Cấu hình `prisma.config.ts`.
  - Kết nối MySQL thông qua `DATABASE_URL`.
  - Generate Prisma Client.
- [x] **TSK-DB-102**: Định nghĩa các bảng thực thể trong `schema.prisma` khớp hoàn toàn với Domain Model của hệ thống:
  - Bảng `User` (id, email, passwordHash, role, isActive, emailVerified, failedLoginAttempts, lockedUntil, timestamps).
  - Bảng `StudentProfile` (userId, fullName, phone, address, university, major, graduationYear, defaultCvId, timestamps).
  - Bảng `EmployerProfile` (userId, companyName, companyDescription, website, address, logoUrl, verified, verifiedAt, verifiedBy, timestamps).
  - Bảng `JobPosting` (id, employerId, title, description, requirements, location, jobType, salaryRange, state, expiresAt, approvedAt, approvedBy, rejectionReason, timestamps).
  - Bảng `Application` (id, jobId, studentId, cvId, coverLetter, state, appliedAt, reviewedAt, reviewedBy, rejectionReason, timestamps).
  - Bảng `CV` (id, studentId, fileName, filePath, fileSize, mimeType, isDefault, uploadedAt).
  - Bảng `RefreshToken` (id, userId, tokenHash, expiresAt, revoked, createdAt).
  - Bảng `AuditLog` (id, actorId, action, entity, entityId, metadata, timestamp).
  - Bảng `Notification` (id, userId, type, title, message, data, isRead, createdAt).
- [x] **TSK-DB-103**: Khởi tạo migration đầu tiên bằng `prisma migrate dev --name init`, đồng bộ cấu trúc cơ sở dữ liệu MySQL và xác nhận toàn bộ bảng cùng quan hệ được tạo thành công.
- [x] **TSK-DB-104**: Thiết lập Prisma Client cho tầng Infrastructure. Tạo module `src/infrastructure/database/prisma.ts` quản lý một singleton `PrismaClient`, kiểm tra kết nối cơ sở dữ liệu và đảm bảo toàn bộ Repository sử dụng chung một Prisma Client. Không sử dụng Prisma Seed trong dự án.

### 2.3 Frontend Scaffolding
- [x] **TSK-FE-101**: Khởi tạo dự án React + Vite với TypeScript trong thư mục `source-code/frontend/`.
- [x] **TSK-FE-102**: Cài đặt và cấu hình Tailwind CSS cho việc thiết kế giao diện responsive.
- [x] **TSK-FE-103**: Cài đặt các thư viện thiết yếu: `react-router-dom` (routing), `@tanstack/react-query` (state management & caching), `axios` (HTTP client), `zod` + `react-hook-form` (validation), `socket.io-client` (real-time notification).
- [x] **TSK-FE-104**: Cấu hình cấu trúc thư mục Frontend theo mô hình Feature-based (`app/`, `features/`, `core/`, `styles/`).

---

## 3. Phase 2: Common Infrastructure & Core Middleware (Hạ tầng dùng chung)

Xây dựng các thành phần nền tảng dùng chung cho toàn bộ các module Backend để đảm bảo tính nhất quán (Consistent).

### 3.1 Security & Authentication Core
- [x] **TSK-INF-201**: Hiện thực lớp `BcryptPasswordHasher` mã hóa mật khẩu bằng BCrypt với cost factor = 12.
- [x] **TSK-INF-202**: Hiện thực lớp `JwtTokenProvider` chịu trách nhiệm tạo và kiểm tra tính hợp lệ của Access Token (15 phút) và Refresh Token (7 ngày).
- [x] **TSK-INF-203**: Thiết lập hệ thống kiểm soát quyền truy cập: `AuthGuard` (xác thực JWT) và `RolesGuard` (phân quyền dựa trên Role - RBAC).

### 3.2 Error Handling & Logging
- [x] **TSK-INF-204**: Hiện thực các lớp ngoại lệ nghiệp vụ (`BusinessException` và các lớp con: `ValidationException`, `AuthException`, `ForbiddenException`, `NotFoundException`, `ConflictException`).
- [x] **TSK-INF-205**: Viết Express error-handling middleware (`AllExceptionsFilter`) bắt mọi lỗi và chuẩn hóa cấu trúc JSON trả về client (chứa `success: false`, `error: { code, message, details }`, `meta: { timestamp, requestId }`).
- [x] **TSK-INF-206**: Thiết lập `Pino Logger` ghi log dạng cấu trúc JSON, tự động đính kèm `requestId` và ẩn các thông tin nhạy cảm (password, tokens).

 ### 3.3 Utilities & Services adapters
- [x] **TSK-INF-207**: Thiết lập `LocalFileStorage` xử lý lưu trữ tệp tin tải lên (CV, Avatar) tại thư mục cục bộ `uploads/`, tích hợp sẵn giao diện `IFileStorage` để sẵn sàng chuyển đổi sang AWS S3 sau này.
- [x] **TSK-INF-208**: Hiện thực `EmailServiceAdapter` sử dụng Nodemailer hỗ trợ gửi các email giao dịch (Xác thực tài khoản, thay đổi trạng thái tuyển dụng, khôi phục mật khẩu).
 - [x] **TSK-INF-209**: Thiết lập Socket.io server phục vụ đẩy thông báo thời gian thực (Real-time notifications) tới trình duyệt.

### 3.4 Design Patterns Implementation

- [x] TSK-INF-210A (UserFactory): Hiện thực UserFactory trong modules/auth/domain/ với validate role, hash password qua DI, set mặc định isActive = false.
- [x] TSK-INF-210 (Factory Pattern): Hiện thực các Factory class còn lại trong Domain Layer của từng module tương ứng:
  - `StudentProfileFactory` (modules/student/domain/): Tạo StudentProfile gắn với userId, kiểm tra role = Student.
  - `EmployerProfileFactory` (modules/employer/domain/): Tạo EmployerProfile gắn với userId, set verified = false.
  - `JobPostingFactory` (modules/job/domain/): Tạo JobPosting với state khởi tạo = Draft, validate title <= 120 chars.
  - `ApplicationFactory` (modules/application/domain/): Tạo Application Entity với state = Applied, appliedAt, createdAt, updatedAt. Validate dữ liệu đầu vào (studentId, jobId, cvId). KHÔNG truy cập Repository/Database. BR-01 và BR-02 được kiểm tra trong ApplyJobUseCase (Application Layer) vì cần Repository để truy vấn dữ liệu tồn tại.

- [x] TSK-INF-211 (Strategy Pattern): Hiện thực các Strategy Interface tại Domain Layer và Implementation tại Infrastructure:
  - `IFileStorageStrategy` + `LocalFileStorageStrategy` (MVP) + `S3FileStorageStrategy` (stub/placeholder cho future). UploadCVUseCase phụ thuộc vào IFileStorageStrategy, không phụ thuộc trực tiếp LocalFileStorageStrategy.
  - `INotificationStrategy` + `EmailNotificationStrategy` + `WebSocketNotificationStrategy` + `CompositeNotificationStrategy` (gửi cả hai).
  - `IPasswordHashStrategy` + `BcryptHashStrategy` (cost factor = 12, configurable qua .env).
  - `ITokenStrategy` + `JwtAccessTokenStrategy` + `JwtRefreshTokenStrategy`.

---

## 4. Phase 3: Module-by-Module Development (Phát triển chi tiết từng Module)

Phát triển hệ thống theo cấu trúc Modular Monolith. Mỗi module sẽ đi qua 4 tầng của Clean Architecture ở Backend và tích hợp giao diện Frontend tương ứng.

### 4.1 Authentication Module (Xác thực tài khoản)
* **Backend Development (Clean Architecture)**:
  - [x] **TSK-AUTH-101 (Domain)**: Định nghĩa thực thể `User`, `RefreshToken`, các Value Objects `Email`, `Password`, và interface `IUserRepository`, `IRefreshTokenRepository`.
  - [x] **TSK-AUTH-102 (Infrastructure)**: Hiện thực `PrismaUserRepository` và `PrismaRefreshTokenRepository` truy cập DB thông qua Prisma.
  - [x] **TSK-AUTH-103 (Application)**: Xây dựng các Use Case cốt lõi:
    - `RegisterUseCase` (Đăng ký tài khoản mới, mã hóa mật khẩu, tạo token kích hoạt, phát sự kiện `UserRegistered`).
    - `LoginUseCase` (Đăng nhập bằng Email/Password, xử lý đếm số lần sai mật khẩu quá 5 lần sẽ khóa tạm thời 15 phút, trả về cặp token, phát sự kiện `UserLoggedIn`).
    - `LogoutUseCase` (Đăng xuất, thu hồi/vô hiệu hóa Refresh Token).
    - `ChangePasswordUseCase` (Đổi mật khẩu cho người dùng đã xác thực).
    - `VerifyEmailUseCase` (Kích hoạt tài khoản bằng liên kết/OTP gửi qua email).
  - [x] **TSK-AUTH-104 (Presentation)**: Thiết lập `AuthController` định nghĩa các routing, áp dụng validation DTOs bằng Zod schemas.
* **Frontend Integration**:
  - [ ] **TSK-AUTH-201**: Phát triển trang Đăng ký (Register Form) với kiểm tra chính sách mật khẩu nghiêm ngặt (8-32 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt).
  - [ ] **TSK-AUTH-202**: Phát triển trang Đăng nhập (Login Form) và lưu trữ Access Token trong bộ nhớ, Refresh Token tự động lưu HttpOnly Cookie. Xử lý hiển thị thông báo lỗi chi tiết khi sai tài khoản hoặc bị khóa.
  - [ ] **TSK-AUTH-203**: Phát triển trang Xác thực Email, trang Yêu cầu đổi mật khẩu và trang Đổi mật khẩu.

### 4.2 Student Module (Phân hệ Sinh viên)
* **Backend Development (Clean Architecture)**:
  - [x] **TSK-ST-101 (Domain)**: Định nghĩa thực thể `StudentProfile`, `CVMetadata`, và interface `IStudentRepository`, `ICVRepository`.
  - [x] **TSK-ST-102 (Infrastructure)**: Hiện thực `PrismaStudentRepository` hỗ trợ lưu thông tin cá nhân và quản lý danh sách tệp CV của sinh viên.
  - [x] **TSK-ST-103 (Application)**: Hiện thực các Use Case nghiệp vụ:
    - `UpdateProfileUseCase` (Tạo hoặc cập nhật thông tin cá nhân, bắt buộc fullName, phone).
    - `UploadCVUseCase` (Tiếp nhận file PDF tối đa 5MB, lưu trữ tại thư mục `uploads/cv/{studentId}/`, lưu metadata vào DB).
    - `ManageCVListUseCase` (Liệt kê danh sách CV, xóa CV, thiết lập CV mặc định để ứng tuyển).
   - `GetApplicationHistoryUseCase` (Lấy lịch sử ứng tuyển kèm phân trang).
   - `GetJobDetailUseCase` (Lấy chi tiết 1 JobPosting theo id, chỉ trả về khi state = Approved. Phục vụ FR-ST-07).
  - [x] **TSK-ST-104 (Presentation)**: Tạo `StudentController` với các endpoint bảo vệ bằng `AuthGuard` và kiểm tra vai trò là `Student`.
* **Frontend Integration**:
  - [x] **TSK-FE-ST-201**: Thiết kế giao diện Quản lý hồ sơ cá nhân sinh viên (Họ tên, SĐT, Địa chỉ, Trường học, Chuyên ngành).
  - [x] **TSK-FE-ST-202**: Thiết kế giao diện Quản lý CV hỗ trợ kéo thả tệp PDF, hiển thị dung lượng, ngày tải lên, tích hợp nút "Đặt làm mặc định" và "Xóa".
  - [x] **TSK-FE-ST-203**: Thiết kế trang Lịch sử ứng tuyển, hiển thị trạng thái của từng hồ sơ (Applied -> Under Review -> Accepted/Rejected/Withdrawn) theo trục thời gian tuyến tính.

### 4.3 Employer Module (Phân hệ Nhà tuyển dụng)
* **Backend Development (Clean Architecture)**:
  - [ ] **TSK-EM-101 (Domain)**: Định nghĩa thực thể `EmployerProfile`, và interface `IEmployerRepository`.
  - [ ] **TSK-EM-102 (Infrastructure)**: Hiện thực `PrismaEmployerRepository` truy cập bảng dữ liệu doanh nghiệp và cập nhật trạng thái kiểm duyệt (`verified`).
  - [ ] **TSK-EM-103 (Application)**: Phát triển các Use Case nghiệp vụ:
    - `UpdateCompanyProfileUseCase` (Cập nhật thông tin công ty: tên, mô tả, website, logo).
    - `GetMyApplicantsUseCase` (Nhà tuyển dụng lấy danh sách ứng viên đã nộp hồ sơ vào tin tuyển dụng của mình).
    - `ViewApplicantDetailsUseCase` (Xem chi tiết hồ sơ, CV của sinh viên đã ứng tuyển - Tuân thủ **BR-09** chỉ xem được khi đã ứng tuyển).
  - [ ] **TSK-EM-104 (Presentation)**: Tạo `EmployerController` cho các API quản lý thông tin doanh nghiệp.
* **Frontend Integration**:
  - [ ] **TSK-FE-EM-201**: Thiết kế trang Hồ sơ Doanh nghiệp (Cập nhật thông tin giới thiệu, địa chỉ, logo, website).
  - [ ] **TSK-FE-EM-202**: Thiết kế màn hình Quản lý ứng viên: Hiển thị danh sách sinh viên ứng tuyển, hỗ trợ lọc theo trạng thái và tìm kiếm.
  - [ ] **TSK-FE-EM-203**: Thiết kế trang Xem chi tiết ứng viên, hiển thị thư giới thiệu (Cover Letter) và xem trực tiếp tệp PDF CV ngay trên trình duyệt thông qua PDF Viewer.

### 4.4 Job Module (Quản lý Tin tuyển dụng)
* **Backend Development (Clean Architecture)**:
  - [ ] **TSK-JOB-101 (Domain)**: Định nghĩa thực thể `JobPosting`, Value Object `JobState` (máy trạng thái: Draft, Pending, Approved, Rejected, Closed, Expired), và interface `IJobPostingRepository`.
  - [ ] **TSK-JOB-102 (Infrastructure)**: Hiện thực `PrismaJobPostingRepository` hỗ trợ đầy đủ các thao tác CRUD tin tuyển dụng, tìm kiếm toàn văn (full-text search) và lọc kết quả.
  - [ ] **TSK-JOB-103 (Application)**: Phát triển các Use Case:
    - `CreateJobPostingUseCase` (Nhà tuyển dụng tạo tin mới ở trạng thái `Draft`, yêu cầu doanh nghiệp phải đã được kiểm duyệt - **BR-03**).
    - `SubmitJobPostingUseCase` (Chuyển trạng thái từ `Draft` sang `Pending` để chờ quản trị viên duyệt).
    - `UpdateJobPostingUseCase` (Chỉnh sửa tin tuyển dụng của chủ sở hữu - **BR-05**, tin ở trạng thái Approved không cho sửa trực tiếp, tin ở Closed khi đăng lại phải chuyển về Pending để kiểm duyệt lại).
    - `CloseJobPostingUseCase` (Nhà tuyển dụng chủ động đóng tin tuyển dụng).
    - `SearchJobsUseCase` (Sinh viên tìm kiếm công việc công khai ở trạng thái `Approved` - **BR-04**, hỗ trợ phân trang và lọc dữ liệu nâng cao).
  - [ ] **TSK-JOB-104 (Presentation)**: Xây dựng `JobController` cung cấp các API công khai và API bảo mật cho nhà tuyển dụng.
* **Frontend Integration**:
  - [ ] **TSK-FE-JOB-201**: Thiết kế Form tạo mới và chỉnh sửa tin tuyển dụng (Tiêu đề ≤ 120 ký tự, mô tả, yêu cầu công việc, địa điểm, mức lương, hạn nộp hồ sơ).
  - [ ] **TSK-FE-JOB-202**: Thiết kế Dashboard tin tuyển dụng của nhà doanh nghiệp (Danh sách tin đã đăng, trạng thái tương ứng, số lượng ứng viên đã nộp).
  - [ ] **TSK-FE-JOB-203**: Thiết kế trang Tìm kiếm việc làm của Sinh viên: hỗ trợ nhập từ khóa, lọc theo địa điểm, mức lương, hình thức làm việc, phân trang thông minh (10, 20, 50 kết quả/trang).
  - [ ] **TSK-FE-JOB-204**: Thiết kế trang xem Chi tiết công việc với nút "Ứng tuyển ngay" nổi bật.

### 4.5 Application Module (Hồ sơ Ứng tuyển)
* **Backend Development (Clean Architecture)**:
  - [ ] **TSK-APP-101 (Domain)**: Định nghĩa thực thể `Application`, máy trạng thái `ApplicationState` (Applied, Under Review, Accepted, Rejected, Withdrawn), và interface `IApplicationRepository`.
  - [ ] **TSK-APP-102 (Infrastructure)**: Hiện thực `PrismaApplicationRepository` lưu trữ thông tin ứng tuyển và kiểm tra trùng lặp.
  - [ ] **TSK-APP-103 (Application)**: Hiện thực các Use Case:
    - `ApplyJobUseCase` (Sinh viên nộp hồ sơ, kiểm tra sinh viên đang hoạt động - **BR-02**, kiểm tra ứng tuyển duy nhất 1 lần cho 1 tin - **BR-01**, lưu trạng thái khởi tạo `Applied`, phát sự kiện `ApplicationSubmitted`).
    - `UpdateApplicationStatusUseCase` (Nhà tuyển dụng cập nhật trạng thái hồ sơ ứng viên: Under Review, Accepted, Rejected. Phát sự kiện `ApplicationStatusChanged`).
    - `WithdrawApplicationUseCase` (Sinh viên chủ động hủy/rút hồ sơ ứng tuyển khi ở trạng thái Applied hoặc Under Review, chuyển sang `Withdrawn`).
  - [ ] **TSK-APP-104 (Presentation)**: Xây dựng `ApplicationController` xử lý các API nộp, cập nhật trạng thái và hủy ứng tuyển.
* **Frontend Integration**:
  - [ ] **TSK-FE-APP-201**: Thiết kế Popup Ứng tuyển: Sinh viên lựa chọn CV có sẵn từ danh sách hoặc tải lên CV mới, điền Cover Letter và xác nhận nộp hồ sơ.
  - [ ] **TSK-FE-APP-202**: Tích hợp các nút chức năng đổi trạng thái tuyển dụng tại màn hình của nhà doanh nghiệp (Chuyển sang "Đang đánh giá", "Đồng ý", "Từ chối" kèm ghi chú phản hồi lý do).
  - [ ] **TSK-FE-APP-203**: Thiết kế nút "Hủy ứng tuyển" tại lịch sử ứng tuyển của sinh viên kèm cảnh báo xác nhận trước khi rút hồ sơ.

### 4.6 Administrator Module (Quản trị hệ thống)
* **Backend Development (Clean Architecture)**:
  - [ ] **TSK-AD-101 (Domain/Infrastructure)**: Xây dựng repository và các truy vấn tổng hợp phức tạp (composite queries) phục vụ hiển thị số liệu thống kê.
  - [ ] **TSK-AD-102 (Application)**: Phát triển các Use Case nghiệp vụ quản trị viên:
    - `VerifyEmployerUseCase` (Duyệt doanh nghiệp đăng ký: chuyển `verified = true`, phát sự kiện `EmployerVerified`).
    - `ApproveJobPostingUseCase` (Duyệt tin tuyển dụng chuyển từ Pending -> Approved, phát sự kiện `JobPostingApproved`).
    - `RejectJobPostingUseCase` (Từ chối tin tuyển dụng chuyển sang Rejected kèm ghi chú phản hồi, phát sự kiện `JobPostingRejected`).
    - `ManageUserAccountUseCase` (Khóa/mở khóa tài khoản người dùng, thay đổi quyền hạn người dùng).
    - `GetDashboardStatsUseCase` (Tính toán tổng hợp số lượng user hoạt động, tin tuyển dụng mới, tỷ lệ ứng tuyển).
  - [ ] **TSK-AD-103 (Presentation)**: Tạo `AdminController` bảo mật nghiêm ngặt bằng `RolesGuard` chỉ cho phép tài khoản Admin truy cập.
* **Frontend Integration**:
  - [ ] **TSK-FE-AD-201**: Thiết kế Trang quản trị Dashboard Admin hiển thị các số liệu thống kê trực quan (biểu đồ số lượng người dùng, biểu đồ trạng thái tin tuyển dụng).
  - [ ] **TSK-FE-AD-202**: Thiết kế Trang danh sách chờ duyệt Doanh nghiệp và danh sách chờ duyệt Tin tuyển dụng, tích hợp nút bấm Duyệt / Từ chối (nhập lý do từ chối trực tiếp).
  - [ ] **TSK-FE-AD-203**: Thiết kế Trang quản lý người dùng (Danh sách sinh viên, doanh nghiệp kèm bộ lọc trạng thái hoạt động, nút Khóa / Mở khóa tài khoản nhanh).

### 4.7 Notification & Audit Module (Thông báo & Nhật ký hệ thống)
* **Backend Development (Clean Architecture)**:
  - [ ] **TSK-SYS-201 (Notification)**: Hiện thực cơ chế đăng ký và nhận diện Domain Events. Khi nhận các sự kiện (`EmployerVerified`, `JobPostingApproved`, `ApplicationStatusChanged`, v.v.), tự động tạo bản ghi `Notification` và đẩy tin nhắn real-time qua WebSockets đồng thời kích hoạt Email gửi đi.
  - [ ] **TSK-SYS-202 (Audit Log)**: Tạo module lưu nhật ký hệ thống độc lập. Mọi hành động quan trọng từ người dùng và quản trị viên phải được ghi lại tự động bằng cách lắng nghe Domain Events và lưu vào bảng `AuditLog` để phục vụ bảo mật/tra cứu.
* **Frontend Integration**:
  - [ ] **TSK-FE-SYS-201**: Phát triển Icon thông báo (chuông báo) trên Header, tích hợp hiển thị số lượng thông báo chưa đọc, hiển thị danh sách thông báo và nút "Đánh dấu đã đọc".
  - [ ] **TSK-FE-SYS-202 (Admin)**: Thiết kế Trang xem nhật ký Audit Log dành cho quản trị viên, hỗ trợ tìm kiếm theo người thực hiện, thời gian, loại hành động.

### 4.8 AI Extension Points Stub Module (Chuẩn bị mở rộng AI)
* **Backend Development (Clean Architecture)**:
  - [ ] **TSK-AI-101 (Domain Interfaces)**: Định nghĩa các Interface nghiệp vụ AI trong Domain Layer:
    - `IResumeAnalyzer` (Phân tích CV, trích xuất kỹ năng).
    - `ITrustScoreEngine` (Tính điểm uy tín nhà tuyển dụng).
    - `IRecommendationEngine` (Gợi ý việc làm thông minh).
    - `IFraudDetector` (Phát hiện tin tuyển dụng lừa đảo/spam).
  - [ ] **TSK-AI-102 (Infrastructure Stubs)**: Hiện thực các lớp Adapter giả lập (No-Op / Stub Adapters) cho các Interface trên. Các Stub này chỉ ghi log nhận sự kiện và trả về kết quả mặc định trống rỗng cho MVP để đảm bảo core hệ thống chạy ổn định và độc lập mà không cần kết nối tới LLMs/AI model thực tế.

---

## 5. Phase 4: Integration & Scheduled Jobs (Tích hợp & Tác vụ tự động)

Tích hợp liên kết chéo các module nghiệp vụ và xây dựng các tiến trình chạy nền tự động.

- [ ] **TSK-INT-401**: Hiện thực tiến trình tự động đóng tin tuyển dụng hết hạn (`JobExpiryJob` chạy mỗi 5 phút bằng `node-cron`): Quét toàn bộ `JobPosting` đang ở trạng thái `Approved` có `expiresAt <= now()`, chuyển trạng thái sang `Expired`, ghi Audit Log.
- [ ] **TSK-INT-402**: Hiện thực tiến trình dọn dẹp file rác định kỳ (`FileCleanupJob` chạy hàng tuần): Quét thư mục `uploads/cv/` để xóa các tệp tin PDF không có liên kết tham chiếu trong cơ sở dữ liệu.
- [ ] **TSK-INT-403**: Hiện thực tính năng xuất báo cáo cho nhà tuyển dụng (Xuất dữ liệu danh sách ứng viên đã nộp thành tệp CSV).
- [ ] **TSK-INT-404**: Hiện thực tính năng xuất nhật ký Audit Log ra tệp CSV cho Admin.

---

## 6. Phase 5: Testing & Security Hardening (Kiểm thử & Gia cố Bảo mật)

Đảm bảo hệ thống vận hành đúng đặc tả nghiệp vụ và đạt các tiêu chuẩn phi chức năng.

### 6.1 Backend API testing
- [ ] **TSK-TST-501**: Viết các Unit Tests độc lập cho tầng Use Cases sử dụng Jest và Mocking cho các Repository. Đảm bảo độ bao phủ mã nguồn (code coverage) tối thiểu 80%.
- [ ] **TSK-TST-502**: Viết các Integration Tests cho toàn bộ API Endpoints bằng Jest kết hợp thư viện `supertest`. Kiểm thử đầy đủ các trạng thái thành công và các lỗi nghiệp vụ từ `B001` đến `B999`.

### 6.2 Security Hardening
- [ ] **TSK-SEC-501**: Tích hợp middleware `Helmet` để kích hoạt các tiêu chuẩn bảo vệ header (CSP, HSTS, X-Frame-Options, chống clickjacking).
- [ ] **TSK-SEC-502**: Triển khai middleware `express-rate-limit` chống spam API tại các endpoint nhạy cảm (Đăng nhập: 5 lần/phút, Upload CV: 10 lần/phút, Search: 30 lần/phút).
- [ ] **TSK-SEC-503**: Thiết lập CORS chỉ chấp nhận kết nối từ các tên miền cụ thể được cấu hình trong tệp `.env`.

---

## 7. Phase 6: Deployment & CI/CD Pipeline (Triển khai hệ thống)

Đóng gói ứng dụng và thiết lập quy trình bàn giao tự động.

- [ ] **TSK-DEP-601**: Viết tệp cấu hình `Dockerfile` độc lập cho cả thư mục `source-code/backend/` và `source-code/frontend/`.
- [ ] **TSK-DEP-602**: Tạo tệp cấu hình `docker-compose.yml` để khởi chạy đồng thời toàn bộ môi trường phát triển (Express, React Vite, MySQL 8.0, Redis nếu có) chỉ bằng một câu lệnh.
- [ ] **TSK-DEP-603**: Xây dựng quy trình tích hợp liên tục **GitHub Actions Workflow** (`.github/workflows/ci.yml`): Tự động kiểm tra cú pháp (Lint), chạy bộ kiểm thử tự động (Test) và đóng gói build sản phẩm mỗi khi có mã nguồn mới đẩy lên nhánh chính.

---

## 8. Definition of Done (Tiêu chuẩn Hoàn thành)

Một tác vụ được coi là hoàn thành (Done) khi và chỉ khi:
1. **Mã nguồn**: Viết hoàn chỉnh bằng TypeScript, không còn mã debug hoặc dòng comment thừa, đã được định dạng chuẩn bằng Prettier.
2. **Kiểm thử**: Đã chạy thành công qua Unit test và chạy thử nghiệm thủ công trên môi trường local.
3. **Tuân thủ Kiến trúc**: Đảm bảo phân tầng Clean Architecture, tuyệt đối không gọi trực tiếp các adapter từ presentation, các use-case phải phụ thuộc ngược thông qua interfaces định nghĩa tại domain layer.
4. **Bảo mật**: Mọi đầu vào dữ liệu đều được xác thực cấu trúc (Zod validation), mật khẩu được mã hóa, các endpoint được gán đúng Guard tương ứng và ghi nhật ký đầy đủ.
5. **Tài liệu**: Cập nhật hợp lệ nếu có thay đổi trong API hoặc cấu trúc tệp liên quan.
