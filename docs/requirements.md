# Requirements Specification

**Project:** TrustHire – Student Recruitment Support System

| Item | Value |
|------|-------|
| Version | 1.0 |
| Status | Draft |
| Methodology | Specification-Driven Development (SDD) |
| Development Model | GitHub Spec Kit |
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Architecture | Clean Architecture |
| Author | Project Team |
| Last Updated | 2026-06-07 |

---

# 1. Introduction

## 1.1 Purpose

Tài liệu này xác định các yêu cầu nghiệp vụ cho hệ thống **TrustHire – Student Recruitment Support System**.

Đây là tài liệu đầu vào của giai đoạn **Problem Definition** trong quy trình Specification-Driven Development (SDD).

Nội dung của tài liệu sẽ được sử dụng để xây dựng:

- spec.md
- architecture.md
- api-spec.md
- plan.md
- task.md
- test-plan.md

---

## 1.2 Background

Hiện nay sinh viên gặp nhiều khó khăn khi tìm kiếm việc làm phù hợp.

Một số doanh nghiệp chưa được xác minh khiến sinh viên khó đánh giá mức độ uy tín.

Doanh nghiệp cũng gặp khó khăn trong việc quản lý hồ sơ ứng tuyển và tìm kiếm ứng viên phù hợp.

Nhà trường chưa có một nền tảng thống nhất để kết nối sinh viên với doanh nghiệp.

---

## 1.3 Objectives

Hệ thống hướng tới các mục tiêu sau:

- Kết nối sinh viên và doanh nghiệp.
- Hỗ trợ đăng tuyển và ứng tuyển trực tuyến.
- Quản lý tập trung quy trình tuyển dụng.
- Kiểm duyệt doanh nghiệp trước khi hoạt động.
- Theo dõi toàn bộ trạng thái ứng tuyển.
- Chuẩn bị nền tảng cho các mô-đun AI trong tương lai.

---

# 2. Project Scope

## 2.1 In Scope (MVP)

Phiên bản đầu tiên bao gồm:

### Authentication

- Register
- Login
- Logout
- Change Password

### Student

- Quản lý hồ sơ
- Upload CV
- Quản lý CV
- Tìm kiếm việc làm
- Ứng tuyển
- Theo dõi trạng thái
- Quản lý lịch sử ứng tuyển

### Employer

- Quản lý doanh nghiệp
- Đăng tin tuyển dụng
- Quản lý tin tuyển dụng
- Quản lý ứng viên
- Cập nhật trạng thái tuyển dụng

### Administrator

- Kiểm duyệt doanh nghiệp
- Kiểm duyệt tin tuyển dụng
- Quản lý người dùng
- Dashboard
- Báo cáo

---

## 2.2 Out of Scope

Các chức năng sau chưa triển khai trong MVP.

- AI Resume Analysis
- AI Trust Score
- Chat
- Video Interview
- Mobile Application
- Online Payment

---

## 2.3 Future Expansion

Hệ thống phải cho phép mở rộng:

- Trust Score Engine
- Employer Verification
- Student Verification
- Fraud Detection
- AI Recommendation
- Resume Scoring
- Skill Matching

---

# 3. Stakeholders

| Role | Description |
|------|-------------|
| Student | Sinh viên tìm việc |
| Employer | Doanh nghiệp tuyển dụng |
| Administrator | Quản trị hệ thống |
| University | Theo dõi kết quả tuyển dụng |
| Development Team | Phát triển hệ thống |

---

# 4. Technology Stack

| Layer | Technology |
|---------|----------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MySQL |
| ORM | Prisma ORM |
| Authentication | JWT |
| Hashing | BCrypt |
| API | RESTful API |
| Version Control | Git + GitHub |
| AI Workflow | GitHub Spec Kit + Cline + OpenRouter |

---

# 5. Functional Requirements

## 5.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Đăng ký tài khoản | High |
| FR-AUTH-02 | Đăng nhập | High |
| FR-AUTH-03 | Đăng xuất | Medium |
| FR-AUTH-04 | Đổi mật khẩu | Medium |

---

## 5.2 Student Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ST-01 | Quản lý hồ sơ cá nhân | High |
| FR-ST-02 | Upload CV | High |
| FR-ST-03 | Quản lý nhiều CV | Medium |
| FR-ST-04 | Chọn CV mặc định | Medium |
| FR-ST-05 | Tìm kiếm việc làm | High |
| FR-ST-06 | Lọc việc làm | High |
| FR-ST-07 | Xem chi tiết công việc | High |
| FR-ST-08 | Ứng tuyển công việc | High |
| FR-ST-09 | Theo dõi trạng thái ứng tuyển | High |
| FR-ST-10 | Hủy hồ sơ ứng tuyển | Medium |
| FR-ST-11 | Quản lý lịch sử ứng tuyển | Medium |

---

## 5.3 Employer Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EM-01 | Đăng ký tài khoản doanh nghiệp | High |
| FR-EM-02 | Quản lý hồ sơ doanh nghiệp | High |
| FR-EM-03 | Tạo tin tuyển dụng | High |
| FR-EM-04 | Chỉnh sửa tin tuyển dụng | High |
| FR-EM-05 | Đóng hoặc mở lại tin tuyển dụng | Medium |
| FR-EM-06 | Quản lý danh sách tin tuyển dụng | High |
| FR-EM-07 | Xem danh sách ứng viên | High |
| FR-EM-08 | Xem hồ sơ ứng viên | High |
| FR-EM-09 | Cập nhật trạng thái ứng tuyển | High |
| FR-EM-10 | Thống kê kết quả tuyển dụng | Medium |

---

## 5.4 Administrator Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AD-01 | Đăng nhập hệ thống quản trị | High |
| FR-AD-02 | Kiểm duyệt doanh nghiệp | High |
| FR-AD-03 | Kiểm duyệt tin tuyển dụng | High |
| FR-AD-04 | Quản lý tài khoản người dùng | High |
| FR-AD-05 | Khóa hoặc mở khóa tài khoản | High |
| FR-AD-06 | Quản lý danh mục hệ thống | Medium |
| FR-AD-07 | Xem Dashboard thống kê | Medium |
| FR-AD-08 | Xem Audit Log | Medium |

---

## 5.5 System Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SYS-01 | Xác thực bằng JWT | High |
| FR-SYS-02 | Phân quyền theo Role (RBAC) | High |
| FR-SYS-03 | Upload và quản lý tệp CV | High |
| FR-SYS-04 | Tìm kiếm dữ liệu | High |
| FR-SYS-05 | Lọc dữ liệu | High |
| FR-SYS-06 | Phân trang dữ liệu | Medium |
| FR-SYS-07 | Gửi Email thông báo | Medium |
| FR-SYS-08 | Ghi Log hệ thống | Medium |
| FR-SYS-09 | Ghi Audit Log | Medium |
| FR-SYS-10 | Quản lý thông báo | Low |

---

## 5.6 Use Case Summary

| UC ID | Use Case | Actor |
|-------|----------|-------|
| UC-01 | Register Account | Student, Employer |
| UC-02 | Login | All Users |
| UC-03 | Manage Student Profile | Student |
| UC-04 | Upload CV | Student |
| UC-05 | Search Jobs | Student |
| UC-06 | Apply Job | Student |
| UC-07 | Manage Company Profile | Employer |
| UC-08 | Manage Job Posting | Employer |
| UC-09 | Review Applications | Employer |
| UC-10 | Verify Employer | Administrator |
| UC-11 | Approve Job Posting | Administrator |
| UC-12 | Manage Users | Administrator |

---

# 6. Non-Functional Requirements

## 6.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-01 | Thời gian phản hồi trung bình dưới 3 giây. |
| NFR-02 | Hỗ trợ tối thiểu 100 người dùng đồng thời. |
| NFR-03 | Hỗ trợ phân trang với dữ liệu lớn. |
| NFR-04 | Tìm kiếm công việc dưới 2 giây. |

---

## 6.2 Security

| ID | Requirement |
|----|-------------|
| NFR-05 | Mật khẩu được mã hóa bằng BCrypt. |
| NFR-06 | Xác thực người dùng bằng JWT. |
| NFR-07 | Phân quyền theo Role-Based Access Control (RBAC). |
| NFR-08 | Chỉ người có quyền mới được truy cập dữ liệu tương ứng. |
| NFR-09 | Kiểm tra dữ liệu đầu vào để chống tấn công phổ biến. |

---

## 6.3 Reliability

| ID | Requirement |
|----|-------------|
| NFR-10 | Dữ liệu phải được lưu ổn định và nhất quán. |
| NFR-11 | Hệ thống ghi nhận lỗi để phục vụ giám sát. |
| NFR-12 | Hỗ trợ sao lưu và phục hồi dữ liệu. |

---

## 6.4 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-13 | Áp dụng Clean Architecture. |
| NFR-14 | Sử dụng Repository Pattern. |
| NFR-15 | Áp dụng Dependency Injection. |
| NFR-16 | Dễ dàng mở rộng các module mới. |

---

## 6.5 Compatibility

| ID | Requirement |
|----|-------------|
| NFR-17 | Hỗ trợ Chrome, Edge và Firefox. |
| NFR-18 | Backend cung cấp RESTful API. |
| NFR-19 | Sử dụng MySQL 8 trở lên. |

---

## 6.6 Usability

| ID | Requirement |
|----|-------------|
| NFR-20 | Giao diện thân thiện, dễ sử dụng. |
| NFR-21 | Hỗ trợ Responsive trên Desktop và Tablet. |
| NFR-22 | Thông báo lỗi rõ ràng, dễ hiểu. |

## 6.7 MVP Decisions

| Vấn đề | Quyết định cho MVP |
|--------|-------------------|
| **Mật khẩu & chính sách** | Mật khẩu từ **8–32 ký tự**, bắt buộc có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt. Khóa tài khoản tạm thời **15 phút sau 5 lần đăng nhập sai liên tiếp**. |
| **Xác thực email** | **Có**. Sau khi đăng ký, người dùng phải xác thực email bằng liên kết hoặc OTP trước khi sử dụng đầy đủ chức năng. |
| **Quy trình duyệt tin** | Quản trị viên duyệt trong thời gian mục tiêu **24 giờ**. Khi bị từ chối hoặc được phê duyệt, hệ thống gửi email và thông báo trong ứng dụng cho doanh nghiệp. |
| **Trạng thái tin tuyển dụng** | Trạng thái gồm: **Draft → Pending → Approved → Rejected → Closed → Expired**. Tin ở trạng thái **Closed** được phép chỉnh sửa, nhưng khi đăng lại phải quay về **Pending** để kiểm duyệt. |
| **Hạn mức CV** | Chỉ chấp nhận **PDF**, dung lượng tối đa **5 MB**. |
| **Lưu trữ CV** | CV lưu trong thư mục `uploads/cv/{studentId}/` trên server. Database chỉ lưu metadata và đường dẫn tệp. Kiến trúc phải cho phép thay thế bằng Object Storage (AWS S3, MinIO...) trong tương lai. |
| **Báo cáo thống kê** | MVP hỗ trợ **Dashboard UI** và xuất **CSV**. Xuất PDF sẽ bổ sung ở phiên bản sau. |
| **Pagination** | Mặc định **10 bản ghi/trang**, cho phép lựa chọn **10, 20, 50** bản ghi. |
| **Email Notification** | Gửi email khi: đăng ký thành công, xác thực email, doanh nghiệp được duyệt/từ chối, tin tuyển dụng được duyệt/từ chối, trạng thái ứng tuyển thay đổi và khi đặt lại mật khẩu. |
| **Audit Log** | Ghi log các hành động: đăng nhập, đăng xuất, tạo/sửa/xóa tin tuyển dụng, duyệt doanh nghiệp, duyệt tin tuyển dụng, khóa/mở khóa tài khoản, thay đổi quyền, thay đổi trạng thái ứng tuyển. |
| **Future AI Modules** | MVP sử dụng **Modular Monolith**. Kiến trúc chuẩn bị để tách thành **Microservices** trong tương lai thông qua Event-driven Architecture hoặc Message Queue khi tích hợp AI. |
| **RBAC chi tiết** | MVP chỉ sử dụng **3 Role**: **Student**, **Employer**, **Administrator**. Các vai trò như HR hoặc Viewer sẽ được bổ sung ở phiên bản sau. |
| **Logout** | MVP sử dụng **JWT Access Token** kết hợp **Refresh Token**. Khi đăng xuất, Refresh Token bị thu hồi (revoke); Access Token hết hạn theo thời gian cấu hình. |
| **Đa ngôn ngữ** | MVP chỉ hỗ trợ **Tiếng Việt**. Kiến trúc giao diện cần chuẩn bị cho việc bổ sung i18n trong tương lai. |

---
# 7. Business Rules

| ID | Rule |
|----|------|
| BR-01 | Sinh viên chỉ được ứng tuyển một lần cho mỗi tin tuyển dụng. |
| BR-02 | Sinh viên chỉ được ứng tuyển khi tài khoản đang hoạt động. |
| BR-03 | Doanh nghiệp phải được quản trị viên phê duyệt trước khi đăng tin. |
| BR-04 | Tin tuyển dụng phải được kiểm duyệt trước khi hiển thị công khai. |
| BR-05 | Chỉ chủ doanh nghiệp mới được chỉnh sửa tin tuyển dụng của mình. |
| BR-06 | Chỉ sinh viên sở hữu hồ sơ mới được chỉnh sửa hồ sơ cá nhân. |
| BR-07 | Quản trị viên có toàn quyền quản lý hệ thống. |
| BR-08 | Tin tuyển dụng hết hạn sẽ tự chuyển sang trạng thái đóng. |
| BR-09 | Doanh nghiệp chỉ được xem hồ sơ của sinh viên đã ứng tuyển. |
| BR-10 | Mọi thao tác quan trọng phải được ghi nhận vào Audit Log. |

---

# 8. Project Constraints

## 8.1 Technical Constraints

- Frontend sử dụng React và Vite.
- Backend sử dụng Node.js và Express.js.
- Cơ sở dữ liệu sử dụng MySQL.
- API tuân thủ chuẩn RESTful.
- Xác thực sử dụng JWT.
- Mật khẩu được mã hóa bằng BCrypt.
- Quản lý mã nguồn bằng Git và GitHub.

---

## 8.2 Architecture Constraints

Hệ thống bắt buộc áp dụng:

- Clean Architecture.
- Repository Pattern.
- Dependency Injection.
- Factory Pattern.
- Strategy Pattern.
- SOLID Principles.

---

## 8.3 Development Constraints

Quy trình phát triển phải tuân theo Specification-Driven Development (SDD).

Thứ tự thực hiện:

1. Requirements
2. Specification
3. Planning
4. Tasks
5. Implementation
6. Testing
7. Evaluation
8. Documentation

Không triển khai mã nguồn khi tài liệu đặc tả chưa được phê duyệt.

---

# 9. Assumptions

Các giả định của dự án:

- Người dùng có kết nối Internet.
- Sinh viên đã có địa chỉ email hợp lệ.
- Doanh nghiệp cung cấp đầy đủ thông tin xác thực.
- Quản trị viên chịu trách nhiệm kiểm duyệt dữ liệu.
- Máy chủ có đủ tài nguyên để vận hành hệ thống.

---

# 10. Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R-01 | Doanh nghiệp giả mạo | Quy trình xác minh doanh nghiệp |
| R-02 | Tin tuyển dụng không chính xác | Kiểm duyệt trước khi công khai |
| R-03 | Dữ liệu bị truy cập trái phép | JWT + RBAC |
| R-04 | Mất dữ liệu | Backup định kỳ |
| R-05 | Khó mở rộng AI | Thiết kế theo Clean Architecture |

---

# 11. Future Expansion

Các chức năng sau không thuộc phạm vi MVP nhưng hệ thống cần hỗ trợ mở rộng.

## AI Features

- AI Job Recommendation.
- AI Resume Analysis.
- AI Skill Matching.
- AI Career Suggestion.

## Trust Features

- Trust Score Engine.
- Employer Verification.
- Student Verification.
- Reputation Scoring.
- Fraud Detection.
- Fake Job Detection.

## Analytics

- Dashboard nâng cao.
- Thống kê xu hướng tuyển dụng.
- Phân tích hành vi người dùng.
- Báo cáo theo thời gian thực.

Hệ thống cần được thiết kế theo hướng module để các tính năng trên có thể tích hợp mà không ảnh hưởng đến kiến trúc hiện tại.

---

# 12. Out of Scope

Phiên bản MVP chưa triển khai:

- Chat thời gian thực.
- Phỏng vấn trực tuyến.
- Thanh toán trực tuyến.
- Mobile Application.
- AI tự động chấm CV.
- AI tự động chấm Trust Score.
- Tích hợp mạng xã hội.
- Video Call.

---

# 13. Acceptance Criteria

Tài liệu Requirements được xem là hoàn thành khi:

- Phạm vi dự án được xác định rõ.
- Các vai trò người dùng được xác định.
- Functional Requirements đầy đủ.
- Non-Functional Requirements đầy đủ.
- Business Rules rõ ràng.
- Project Constraints được xác định.
- Future Expansion được mô tả.
- Có thể sử dụng làm đầu vào cho giai đoạn Specification.

---

# 14. Requirement Traceability

| Requirement Group | Related Document |
|-------------------|------------------|
| Functional Requirements | spec.md |
| Non-Functional Requirements | architecture.md |
| Business Rules | spec.md |
| API Requirements | api-spec.md |
| Development Plan | plan.md |
| Task Breakdown | task.md |
| Testing | test-plan.md |

---

# 15. References

- GitHub Spec Kit Documentation
- Specification-Driven Development (SDD)
- Clean Architecture
- RESTful API Design Best Practices
- OWASP Application Security Guide
- React Documentation
- Node.js Documentation
- Express.js Documentation
- MySQL Documentation

---

# 16. Document History

| Version | Date | Author | Description |
|----------|------|--------|-------------|
| 1.0 | 2026-06-27 | Project Team | Initial Requirements Specification |

---

# 17. Conclusion

Tài liệu này xác định toàn bộ yêu cầu nghiệp vụ và yêu cầu hệ thống cho dự án **TrustHire – Student Recruitment Support System**.

Đây là tài liệu nền tảng của giai đoạn **Problem Definition** trong quy trình **Specification-Driven Development (SDD)**.

Sau khi tài liệu được xem xét và phê duyệt, dự án sẽ chuyển sang giai đoạn **Specification**, nơi các yêu cầu sẽ được đặc tả chi tiết thành User Stories, Use Cases, Business Flows, API Contracts và các quy tắc nghiệp vụ phục vụ cho quá trình thiết kế, lập kế hoạch và triển khai hệ thống.

