# Implementation Plan - Kế hoạch triển khai dự án TrustHire

| Item | Value |
|------|-------|
| Project | TrustHire – Student Recruitment Support System |
| Version | 1.0 |
| Status | Draft |
| Last Updated | 2026-07-29 |
| Parent Documents | requirements.md, spec.md, architecture.md, task.md |

Tài liệu này mô tả chi tiết chiến lược, roadmap và các quyết định kỹ thuật cốt lõi phục vụ cho việc triển khai hệ thống **TrustHire – Student Recruitment Support System** theo phương pháp **Specification-Driven Development (SDD)**. Đây là tài liệu định hướng kỹ thuật làm cơ sở để AI và các lập trình viên phối hợp thực hiện dự án một cách đồng bộ.

---

## 1. Overview (Tổng quan)

### 1.1 Mục tiêu của kế hoạch triển khai
- Định hướng chiến lược phát triển toàn diện hệ thống TrustHire, thiết lập sự nhất quán giữa kiến trúc kỹ thuật và tiến trình thực hiện thực tế.
- Làm cầu nối định hướng giữa các đặc tả nghiệp vụ (`requirements.md`, `spec.md`) và danh sách nhiệm vụ chi tiết (`task.md`).
- Đảm bảo toàn bộ mã nguồn tuân thủ nghiêm ngặt các nguyên tắc Clean Architecture và có tính sẵn sàng cao đối với việc tích hợp các mô-đun trí tuệ nhân tạo (AI-Ready) trong tương lai.

### 1.2 Phạm vi triển khai MVP
- Triển khai toàn bộ các tính năng cốt lõi thuộc phân hệ: Xác thực tài khoản (Authentication), Quản lý hồ sơ và CV của Sinh viên (Student), Đăng tuyển và xét duyệt của Doanh nghiệp (Employer), Kiểm duyệt và Quản trị hệ thống của Quản trị viên (Administrator).
- Thiết lập hạ tầng chung bao gồm logging, xử lý lỗi tập trung, phân quyền dựa trên vai trò (RBAC), thông báo thời gian thực và ghi nhật ký kiểm toán (Audit Log).
- Loại trừ tất cả các tính năng nâng cao (AI, Chat, Video Call, Payment) ra khỏi giai đoạn MVP này, nhưng vẫn thiết kế sẵn các cổng kết nối (interfaces/stubs) phù hợp.

Bảng ánh xạ giữa Phase trong plan.md và task.md:

| plan.md | task.md | Ghi chú |
|---------|---------|---------|
| Phase 1–2 | Phase 1 | Project Setup & Database |
| Phase 3 | Phase 2 | Common Infrastructure |
| Phase 4–9 | Phase 3 | Module-by-Module Development |
| Phase 10–11 | Phase 4 | Integration & Scheduled Jobs |
| Phase 12 | Phase 5 | Testing & Security Hardening |
| Phase 13 | Phase 6 | Deployment & CI/CD |

### 1.3 Các nguyên tắc phát triển
- **Kiến trúc Clean & Modularity**: Tách biệt hoàn toàn các tầng presentation, application, domain và infrastructure. Phát triển hệ thống theo dạng Modular Monolith.
- **Specification-Driven**: Không viết bất kỳ dòng code nghiệp vụ nào trước khi cấu trúc và logic nghiệp vụ được định nghĩa và đặc tả rõ ràng.
- **Chất lượng và Kiểm thử tự động**: Đảm bảo toàn bộ usecase của hệ thống có unit test đi kèm và các endpoint quan trọng đều có integration test.
- **Bảo mật mặc định (Secure by Default)**: Áp dụng các tiêu chuẩn OWASP, mã hóa mật khẩu một chiều, bảo vệ API bằng JWT kết hợp cơ chế thu hồi refresh token, kiểm soát chặt chẽ dữ liệu đầu vào.

---

## 2. Development Strategy (Chiến lược Phát triển)

### 2.1 Quy trình phát triển theo SDD
- Mỗi tính năng nghiệp vụ sẽ đi qua chu trình khép kín: Đọc đặc tả nghiệp vụ trong `spec.md` -> Xác định Use Case liên quan -> Thiết lập các DTO đầu vào/đầu ra và các quy tắc kiểm tra (Zod schemas) -> Viết Unit Test cho Use Case -> Viết mã nguồn cho Domain Entities và Use Case -> Hiện thực các Adapter/Repository ở Infrastructure -> Đăng ký định tuyến tại Presentation -> Kiểm thử tích hợp.

### 2.2 Chiến lược phát triển Backend
- Áp dụng triệt để nguyên lý đảo ngược phụ thuộc (Dependency Inversion): Tầng Application và Domain định nghĩa các interface; tầng Infrastructure cung cấp các hiện thực chi tiết (Prisma, BCrypt, Nodemailer, File Storage).
- Sử dụng cấu trúc Modular Monolith để chia hệ thống thành các module nghiệp vụ độc lập, giúp hạn chế sự phụ thuộc chéo và dễ dàng tách thành các Microservices trong tương lai.

### 2.3 Chiến lược phát triển Frontend
- Thiết kế theo hướng Feature-Based Folder Structure để cô lập logic của từng phân hệ (Auth, Student, Employer, Admin) thành các thư mục độc lập chứa components, hooks và các api calls riêng biệt.
- Sử dụng React Query làm trung tâm quản lý trạng thái máy chủ (server state), đảm bảo dữ liệu luôn được đồng bộ, lưu trữ đệm (cached) hiệu quả và tối ưu hóa số lượng API request.

### 2.4 Chiến lược Database
- Sử dụng Prisma ORM làm công cụ chính để mô hình hóa dữ liệu dạng Type-safe, quản lý phiên bản cơ sở dữ liệu qua migrations và khởi tạo dữ liệu mẫu thông qua hệ thống seed.
- Thiết lập mối quan hệ chặt chẽ bằng ràng buộc khóa ngoại trực tiếp trong MySQL để đảm bảo tính nhất quán của dữ liệu.

### 2.5 Chiến lược API
- Phát triển API theo chuẩn RESTful đồng nhất: sử dụng danh từ số nhiều cho tài nguyên, áp dụng đúng phương thức HTTP (GET, POST, PUT, PATCH, DELETE) và trả về dữ liệu đóng gói dạng chuẩn (envelope response format).

---

## 3. Implementation Roadmap (Lộ trình Triển khai)

### Phase 1: Project Setup
- **Mục tiêu**: Thiết lập khung cấu trúc dự án (scaffolding) cho cả Frontend và Backend, thiết lập quy chuẩn viết code và kiểm tra tự động ban đầu.
- **Đầu vào**: Các tài liệu thiết kế và kiến trúc (`spec.md`, `architecture.md`).
- **Đầu ra**: Khung thư mục monorepo hoàn chỉnh, cấu hình TypeScript, cấu hình linter/formatter (ESLint, Prettier), cấu hình ban đầu cho CI/CD.
- **Điều kiện hoàn thành**: Dự án build thành công trên local, linter không phát hiện lỗi cảnh báo nghiêm trọng.
- **Các module phụ thuộc**: Không có.

### Phase 2: Database
- **Mục tiêu**: Thiết lập mô hình dữ liệu, khởi tạo cơ sở dữ liệu MySQL và áp dụng các cấu trúc lưu trữ mẫu.
- **Đầu vào**: Domain Model từ tài liệu đặc tả `spec.md`.
- **Đầu ra**: File `prisma/schema.prisma` hoàn chỉnh, các tệp di cư dữ liệu (migrations), script seed dữ liệu mẫu thành công.
- **Điều kiện hoàn thành**: Migrate thành công trên database local và khởi tạo thành công tài khoản quản trị viên mặc định.
- **Các module phụ thuộc**: Phase 1.

### Phase 3: Common Infrastructure
- **Mục tiêu**: Xây dựng nền tảng hạ tầng dùng chung như xử lý ngoại lệ, ghi log, lưu trữ tệp tin cục bộ, gửi email và truyền thông điệp thời gian thực.
- **Đầu vào**: Cấu trúc kiến trúc hạ tầng từ `architecture.md`.
- **Đầu ra**: Hệ thống Express error handler middleware, cấu hình Pino Logger, các Service adapters cho File Storage, Email và Socket.io.
- **Điều kiện hoàn thành**: API Health Check hoạt động ổn định và trả về trạng thái bình thường của các dịch vụ liên kết.
- **Các module phụ thuộc**: Phase 2.

### Phase 4: Authentication
- **Mục tiêu**: Hoàn thành toàn bộ quy trình đăng ký, xác thực, đăng nhập và phân quyền hệ thống.
- **Đầu vào**: Các Use Cases thuộc nhóm `FR-AUTH-*`.
- **Đầu ra**: Các api endpoints hoàn chỉnh cho việc đăng ký, kích hoạt tài khoản qua email, đăng nhập lấy JWT, đổi mật khẩu và đăng xuất.
- **Điều kiện hoàn thành**: Đăng nhập thành công trả về cặp Access Token và Refresh Token hợp lệ; cơ chế kiểm soát quyền (RBAC Guard) hoạt động chính xác.
- **Các module phụ thuộc**: Phase 3.

### Phase 5: Student Module
- **Mục tiêu**: Triển khai hồ sơ cá nhân sinh viên, chức năng tải lên và quản lý danh sách CV.
- **Đầu vào**: Các Use Cases thuộc nhóm `FR-ST-01` đến `FR-ST-04`.
- **Đầu ra**: Phân hệ Frontend và Backend cho phép cập nhật thông tin cá nhân, tải lên tệp PDF CV và chọn CV mặc định.
- **Điều kiện hoàn thành**: File CV được lưu trữ an toàn trong thư mục cục bộ của server và metadata được lưu chính xác trong database.
- **Các module phụ thuộc**: Phase 4.

### Phase 6: Employer Module
- **Mục tiêu**: Phát triển hồ sơ doanh nghiệp và giao diện quản lý ứng viên dành cho nhà tuyển dụng.
- **Đầu vào**: Các Use Cases thuộc nhóm `FR-EM-01` và `FR-EM-02`.
- **Đầu ra**: Các tính năng cập nhật thông tin giới thiệu công ty, logo, website, giao diện xem thông tin ứng viên đã nộp hồ sơ.
- **Điều kiện hoàn thành**: Nhà tuyển dụng chỉ truy cập được thông tin cá nhân và CV của những sinh viên thực sự ứng tuyển vào tin của họ.
- **Các module phụ thuộc**: Phase 5.

### Phase 7: Job Module
- **Mục tiêu**: Triển khai toàn bộ quy trình tạo mới, chỉnh sửa, đóng, mở lại và tìm kiếm các tin đăng tuyển dụng.
- **Đầu vào**: Các Use Cases thuộc nhóm `FR-EM-03` đến `FR-EM-06` và `FR-ST-05` đến `FR-ST-07`.
- **Đầu ra**: Công cụ tìm kiếm, bộ lọc việc làm đa năng, quy trình kiểm duyệt tin đăng.
- **Điều kiện hoàn thành**: Tin tuyển dụng khi tạo mới ở trạng thái Draft, và chỉ hiển thị công khai trên giao diện tìm kiếm của sinh viên khi đã được chuyển sang trạng thái Approved.
- **Các module phụ thuộc**: Phase 6.

### Phase 8: Application Module
- **Mục tiêu**: Xử lý toàn bộ quy trình nộp hồ sơ ứng tuyển, rút hồ sơ và chuyển đổi trạng thái đánh giá ứng viên.
- **Đầu vào**: Các Use Cases thuộc nhóm `FR-ST-08` đến `FR-ST-11` và `FR-EM-07` đến `FR-EM-09`.
- **Đầu ra**: Quy trình nộp hồ sơ hoàn chỉnh, máy trạng thái chuyển đổi trạng thái hồ sơ ứng tuyển, cơ chế ghi nhận lịch sử.
- **Điều kiện hoàn thành**: Ngăn chặn tuyệt đối việc sinh viên nộp hồ sơ trùng lặp cho cùng một công việc; trạng thái ứng tuyển được cập nhật chính xác theo đúng sơ đồ luồng.
- **Các module phụ thuộc**: Phase 7.

### Phase 9: Administrator Module
- **Mục tiêu**: Hoàn thiện cổng thông tin quản trị hệ thống phục vụ việc kiểm duyệt thực thể, quản lý tài khoản người dùng và xem thống kê.
- **Đầu vào**: Các Use Cases thuộc nhóm `FR-AD-*`.
- **Đầu ra**: Dashboard thống kê trực quan, giao diện kiểm duyệt doanh nghiệp/tin tuyển dụng, chức năng khóa/mở khóa tài khoản người dùng.
- **Điều kiện hoàn thành**: Quản trị viên thực hiện phê duyệt/từ chối thành công các yêu cầu, hệ thống cập nhật đúng cờ trạng thái tương ứng.
- **Các module phụ thuộc**: Phase 8.

### Phase 10: Notification
- **Mục tiêu**: Triển khai hệ thống gửi thông báo thời gian thực và email giao dịch dựa trên các sự kiện nghiệp vụ xảy ra trong hệ thống.
- **Đầu vào**: Các yêu cầu về thông báo `FR-SYS-07` và `FR-SYS-10`.
- **Đầu ra**: Trung tâm thông báo (Notification Center) trên giao diện Frontend, Socket.io gateway kết nối thời gian thực, module Email giao dịch hoạt động.
- **Điều kiện hoàn thành**: Khi một hành động kích hoạt xảy ra, người dùng liên quan lập tức nhận được thông báo in-app và một email giao dịch được gửi đi thành công.
- **Các module phụ thuộc**: Phase 9.

### Phase 11: Integration
- **Mục tiêu**: Liên kết tất cả các module đơn lẻ lại với nhau, hiện thực các tác vụ nền tự động và tối ưu hóa hệ thống.
- **Đầu vào**: Toàn bộ mã nguồn từ Phase 1 đến Phase 10, yêu cầu của các tác vụ chạy nền định kỳ (`FR-SYS-11`).
- **Đầu ra**: Hệ thống vận hành trơn tru một cách đồng bộ, cron job tự động đóng các công việc hết hạn chạy ổn định định kỳ.
- **Điều kiện hoàn thành**: Cron job cập nhật chính xác trạng thái tin tuyển dụng hết hạn sau mỗi chu kỳ quét 5 phút.
- **Các module phụ thuộc**: Phase 10.

### Phase 12: Testing
- **Mục tiêu**: Gia tăng tối đa độ bao phủ kiểm thử, hoàn thành kiểm thử tích hợp API và rà soát hiệu năng hệ thống.
- **Đầu vào**: Toàn bộ hệ thống đã tích hợp hoàn chỉnh.
- **Đầu ra**: Báo cáo kiểm thử chi tiết, kết quả đo lường độ bao phủ mã nguồn (Code coverage).
- **Điều kiện hoàn thành**: Đạt độ bao phủ mã nguồn tổng thể từ 80% trở lên, toàn bộ các kịch bản kiểm thử API đều vượt qua (Pass).
- **Các module phụ thuộc**: Phase 11.

### Phase 13: Deployment
- **Mục tiêu**: Đóng gói container hóa toàn bộ ứng dụng và thiết lập quy trình bàn giao tự động lên môi trường staging/production.
- **Đầu vào**: Các tệp tin cấu hình môi trường, Dockerfile và Docker Compose.
- **Đầu ra**: Các container chạy ổn định trên môi trường máy chủ, quy trình CI/CD hoàn thiện.
- **Điều kiện hoàn thành**: Hệ thống khởi chạy thành công trên máy chủ thông qua Docker Compose, dữ liệu hoạt động ổn định và nhất quán.
- **Các module phụ thuộc**: Phase 12.

---

## 4. Technical Decisions (Các Quyết định Kỹ thuật)

- **React + Vite**: Vite cung cấp tốc độ khởi động cực nhanh nhờ sử dụng Native ESM, kết hợp cơ chế Hot Module Replacement (HMR) tối ưu giúp đẩy nhanh tốc độ phát triển giao diện phía Client so với Webpack truyền thống.
- **Node.js + Express**: Sự tối giản và tính linh hoạt cao của Express giúp dễ dàng thiết kế hệ thống Clean Architecture mà không bị gò bó bởi các cấu trúc mặc định của framework khác, đồng thời sở hữu cộng đồng middleware cực kỳ phong phú.
- **Prisma**: ORM thế hệ mới tự động tạo ra các kiểu dữ liệu Type-safe đồng bộ trực tiếp từ cơ sở dữ liệu, loại bỏ hoàn toàn các lỗi truy vấn sai tên trường hoặc sai kiểu dữ liệu ngay tại thời điểm biên dịch.
- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đáng tin cậy, tuân thủ chặt chẽ ACID, đáp ứng hoàn hảo cho việc lưu trữ các thực thể có mối quan hệ ràng buộc cao như hồ sơ ứng tuyển, thông tin doanh nghiệp.
- **JWT**: Cơ chế xác thực phi trạng thái (stateless) lý tưởng giúp tối ưu hóa tài nguyên máy chủ, dễ dàng mở rộng quy mô hệ thống và tích hợp với các ứng dụng khác trong tương lai.
- **BCrypt**: Thuật toán băm mật khẩu một chiều thích ứng (adaptive) cực kỳ an toàn, có khả năng tự động điều chỉnh cost factor để chống lại các cuộc tấn công Brute-force bằng phần cứng hiện đại.
- **Clean Architecture**: Đảm bảo mã nguồn được phân rã thành các tầng có trách nhiệm độc lập rõ ràng. Giúp tăng khả năng bảo trì, dễ dàng viết test và tách biệt logic nghiệp vụ cốt lõi khỏi sự phụ thuộc vào database hay framework bên ngoài.
- **Repository Pattern**: Tạo ra một lớp trừu tượng (abstraction) ngăn cách giữa logic nghiệp vụ (use cases) và chi tiết truy xuất cơ sở dữ liệu thực tế, giúp dễ dàng chuyển đổi hoặc mock dữ liệu khi viết unit test.
- **RESTful API**: Chuẩn giao tiếp phổ biến giúp hệ thống dễ hiểu, dễ tích hợp và thuận tiện cho các mô-đun AI hoặc ứng dụng di động trong tương lai kết nối vào hệ thống một cách nhất quán.
- **React Query**: Quản lý server-state cực kỳ hiệu quả thông qua cơ chế tự động làm mới (polling/revalidation), quản lý bộ nhớ đệm thông minh và xử lý cập nhật giao diện nhanh chóng (optimistic updates).
- **TailwindCSS**: Giúp tăng tốc độ xây dựng giao diện responsive đẹp mắt, giảm thiểu tối đa kích thước bundle CSS khi build sản phẩm nhờ cơ chế loại bỏ code thừa (purge CSS).
- **Socket.io**: Hỗ trợ thiết lập kết nối hai chiều thời gian thực ổn định, có cơ chế tự động kết nối lại (auto-reconnection) và fallback thông minh sang HTTP long-polling nếu kết nối WebSocket bị chặn.

Factory Pattern: Áp dụng để tạo các đối tượng domain phức tạp (User, StudentProfile, EmployerProfile, JobPosting, Application) với toàn bộ Business Rules được thực thi ngay tại điểm khởi tạo, tách biệt logic tạo đối tượng khỏi Use Case. Tham chiếu: architecture.md Mục 4.8, TSK-INF-210.

Strategy Pattern: Áp dụng cho các hành vi có thể thay đổi implementation mà không ảnh hưởng Use Case: IFileStorageStrategy (LocalFileStorageStrategy cho MVP, S3FileStorageStrategy cho future), INotificationStrategy (Email/WebSocket/Composite), IPasswordHashStrategy (BCrypt), ITokenStrategy (Access/Refresh). Tham chiếu: architecture.md Mục 4.9, TSK-INF-211.

---

## 5. Database Strategy (Chiến lược Cơ sở dữ liệu)

- **Prisma Migration**: Toàn bộ thay đổi về cấu trúc bảng bắt buộc phải được thực hiện thông qua câu lệnh migrate của Prisma, tạo ra các tệp tin SQL di cư có đánh số phiên bản rõ ràng trong thư mục `prisma/migrations`. Không chỉnh sửa cấu trúc DB thủ công bằng các công cụ bên ngoài.
- **Seed Data**: Viết script seed chuyên dụng trong thư mục `prisma/seed.ts` để tự động khởi tạo dữ liệu nền của hệ thống khi chạy setup cơ sở dữ liệu, bao gồm các vai trò người dùng cốt lõi, danh mục lĩnh vực mặc định và một tài khoản Administrator ban đầu.
- **Backup**: Thiết lập tiến trình sao lưu tự động (Cron job) để kết xuất dữ liệu MySQL định kỳ hàng ngày (logical backup thông qua `mysqldump`), lưu trữ các bản sao lưu an toàn tại ổ đĩa độc lập và tự động dọn dẹp các bản sao lưu cũ quá 30 ngày.
- **Index**: Tạo các chỉ mục (indexes) hiệu quả cho các cột thường xuyên xuất hiện trong mệnh đề `WHERE` hoặc các phép liên kết `JOIN`, đặc biệt là các cột `email` của bảng User, `jobId` và `studentId` của bảng Application để tăng tốc độ truy vấn.
- **Foreign Key**: Sử dụng khóa ngoại vật lý trực tiếp trong MySQL để ràng buộc mối quan hệ giữa các bảng. Thiết lập quy tắc hành động phù hợp khi xóa dữ liệu (ví dụ: `ON DELETE CASCADE` cho thông tin đi kèm, hoặc `ON DELETE RESTRICT` để bảo vệ các thực thể nghiệp vụ quan trọng).
- **Transaction**: Áp dụng cơ chế giao dịch ACID (`$transaction` của Prisma) cho toàn bộ các luồng xử lý nghiệp vụ phức tạp liên quan đến nhiều bảng dữ liệu đồng thời, đảm bảo dữ liệu luôn ở trạng thái nhất quán nhất ngay cả khi xảy ra lỗi đột ngột giữa luồng.

---

## 6. API Strategy (Chiến lược API)

- **REST API Convention**: Sử dụng danh từ số nhiều làm tên tài nguyên (ví dụ: `/api/v1/jobs`, `/api/v1/applications`). Toàn bộ API đều sử dụng định dạng JSON cho dữ liệu gửi đi và nhận về.
- **HTTP Status Code**: Tuân thủ nghiêm ngặt chuẩn mã trạng thái HTTP: `200 OK` (thành công), `201 Created` (tạo mới thành công), `400 Bad Request` (lỗi đầu vào), `401 Unauthorized` (chưa đăng nhập), `403 Forbidden` (sai vai trò/không có quyền), `404 Not Found` (không tìm thấy tài nguyên), `409 Conflict` (trùng lặp/lỗi logic máy trạng thái), `500 Internal Server Error` (lỗi hệ thống đột ngột).
- **Pagination**: Mọi API trả về danh sách dữ liệu bắt buộc phải hỗ trợ phân trang thông qua hai tham số truy vấn là `page` và `pageSize` (hỗ trợ các kích thước trang chuẩn: 10, 20, 50 bản ghi/trang). Phản hồi trả về cấu trúc meta chứa tổng số bản ghi và tổng số trang hiện tại.
- **Filtering**: Hỗ trợ lọc dữ liệu trực tiếp trên server-side bằng cách truyền các tham số lọc vào Query parameters (ví dụ: `?location=hanoi&jobType=internship`), đảm bảo tải dữ liệu tối thiểu lên client.
- **Sorting**: Hỗ trợ sắp xếp linh hoạt theo cấu trúc trường và chiều sắp xếp (ví dụ: `?sort=createdAt:desc` hoặc `?sort=title:asc`).
- **Error Response**: Khi xảy ra lỗi, API luôn trả về một cấu trúc phản hồi lỗi đồng nhất chứa mã lỗi nghiệp vụ độc lập (theo định dạng mã `Bxxx` được đặc tả tại `spec.md`), kèm theo thông điệp thông báo lỗi rõ ràng thân thiện với lập trình viên và AI.
- **Authentication**: Các API bảo vệ yêu cầu Client gửi kèm Access Token trong tiêu đề HTTP `Authorization: Bearer <token>`. Cơ chế làm mới token tự động thông qua Refresh Token lưu tại HttpOnly Cookie.
- **Versioning**: Sử dụng phiên bản trực tiếp trên đường dẫn URL (bắt đầu bằng tiền tố `/api/v1/`) để đảm bảo khả năng tương thích ngược của hệ thống khi nâng cấp hoặc phát triển các phiên bản API mới sau này.

---

## 7. Security Strategy (Chiến lược Bảo mật)

- **JWT**: Sử dụng cơ chế token tự chứa (self-contained) được ký bằng thuật toán bảo mật an toàn. Thiết lập thời gian hết hạn cực ngắn cho Access Token (15 phút) nhằm hạn chế rủi ro khi token bị lộ lọt.
- **Refresh Token**: Sử dụng Refresh Token với thời hạn dài hơn (7 ngày) lưu an toàn tại HttpOnly Cookie (chống tấn công XSS). Thiết lập cơ chế danh sách đen (Blacklist) trong cơ sở dữ liệu để có thể chủ động thu hồi tất cả các phiên đăng nhập khi người dùng đăng xuất hoặc đổi mật khẩu.
- **Password Hashing**: Toàn bộ mật khẩu của người dùng bắt buộc phải được băm một chiều an toàn bằng BCrypt với hệ số muối (salt rounds) phù hợp trước khi lưu trữ vào cơ sở dữ liệu, đảm bảo không lưu mật khẩu dạng văn bản thô (plain text).
- **RBAC**: Hiện thực cơ chế phân quyền dựa trên vai trò nghiêm ngặt bằng Guards ở Backend. Kiểm tra quyền hạn trực tiếp tại cấp độ API Endpoint, phân loại quyền truy cập rõ ràng giữa 3 vai trò: Student, Employer và Administrator.
- **Rate Limit**: Triển khai middleware giới hạn tần suất yêu cầu (`express-rate-limit`) nhằm ngăn chặn các cuộc tấn công từ chối dịch vụ (DoS/DDoS) và brute-force, áp dụng giới hạn riêng cho các API nhạy cảm như đăng nhập, quên mật khẩu và tải tệp tin.
- **Validation**: Kiểm tra nghiêm ngặt kiểu dữ liệu, định dạng và độ dài của toàn bộ tham số đầu vào bằng schemas (Zod/express-validator) tại tầng Presentation trước khi đưa vào xử lý logic nghiệp vụ.
- **Upload Security**: Chỉ chấp nhận tệp tin tải lên có định dạng PDF (đối với CV) với kích thước tối đa 5MB. Kiểm tra định dạng thật của tệp (MIME type) ở Backend để ngăn chặn việc tải lên các tệp mã độc thực thi. Lưu trữ tệp ngoài thư mục công khai của web root.
- **CORS**: Cấu hình CORS chặt chẽ, chỉ cho phép các yêu cầu HTTP đến từ các nguồn gốc (origins) được khai báo rõ ràng trong cấu hình biến môi trường của hệ thống.
- **Helmet**: Sử dụng Helmet middleware để tự động cấu hình các tiêu đề bảo mật HTTP thiết yếu như Content Security Policy (CSP), HTTP Strict Transport Security (HSTS) giúp bảo vệ người dùng trước các cuộc tấn công XSS, Clickjacking.

---

## 8. Testing Strategy (Chiến lược Kiểm thử)

- **Unit Test**: Viết các bài kiểm thử đơn vị độc lập cho toàn bộ các Use Case nghiệp vụ tại tầng Application. Sử dụng thư viện Jest để thực hiện chạy các ca kiểm thử, kết hợp cơ chế Mocking để cô lập logic nghiệp vụ khỏi các phụ thuộc hạ tầng hay cơ sở dữ liệu thực tế.
- **Integration Test**: Thực hiện kiểm thử tích hợp các Endpoint API bằng cách sử dụng công cụ Supertest khởi chạy server Express giả lập. Truy cập trực tiếp vào một cơ sở dữ liệu SQLite trong bộ nhớ (in-memory SQLite) hoặc cơ sở dữ liệu test độc lập để kiểm tra độ chính xác của luồng nghiệp vụ và phản hồi HTTP trả về.
- **API Test**: Xây dựng bộ sưu tập các yêu cầu API (Postman/Thunder Client) hoàn chỉnh bao phủ toàn bộ các kịch bản tương tác dữ liệu, cho phép chạy tự động hóa trong quy trình CI/CD để phát hiện sớm các lỗi phá vỡ hợp đồng API (regression).
- **Manual Test**: Thực hiện các ca kiểm thử thủ công trực tiếp trên trình duyệt theo các kịch bản trải nghiệm người dùng cuối, rà soát khả năng tương thích của giao diện trên các trình duyệt phổ thông như Chrome, Edge, Firefox và kiểm tra tính trực quan của giao diện responsive.
- **Code Coverage**: Thiết lập cấu hình đo lường độ bao phủ mã nguồn trong Jest, đặt ra tiêu chuẩn bắt buộc tổng thể phải đạt tối thiểu 80% độ bao phủ dòng lệnh, đặc biệt ưu tiên rà soát đạt trên 95% độ bao phủ đối với các module quan trọng như Xác thực và Đăng tuyển.

---

## 9. Deployment Strategy (Chiến lược Triển khai)

- **Docker**: Xây dựng các tệp tin `Dockerfile` đa giai đoạn (multi-stage builds) riêng biệt cho Frontend và Backend để tối ưu hóa kích thước của các Docker images thành phẩm, đảm bảo môi trường chạy ứng dụng luôn đồng nhất từ local cho tới production.
- **Docker Compose**: Sử dụng tệp cấu hình `docker-compose.yml` để dễ dàng quản lý và khởi chạy đồng thời toàn bộ các container bao gồm frontend, backend và database MySQL chỉ với một câu lệnh duy nhất, giúp đẩy nhanh tiến trình thiết lập môi trường phát triển.
- **Environment**: Toàn bộ các thông số cấu hình nhạy cảm hoặc thay đổi theo môi trường (như DB credentials, JWT secrets, SMTP configs) bắt buộc phải được tách riêng ra tệp cấu hình `.env` và không được phép đưa vào mã nguồn lưu trên kho lưu trữ Git.
- **CI/CD**: Thiết lập quy trình tích hợp liên tục tự động hóa hoàn toàn. Mỗi khi có mã nguồn mới được đẩy lên (push) hoặc yêu cầu hợp nhất (pull request) vào nhánh chính `main`, hệ thống sẽ tự động kích hoạt tiến trình kiểm tra.
- **GitHub Actions**: Sử dụng GitHub Actions làm công cụ vận hành quy trình CI/CD: tự động kiểm tra cú pháp (lint), định dạng mã nguồn, chạy toàn bộ suite unit test & integration test, tự động đóng gói ứng dụng thành Docker Image và đẩy lên kho lưu trữ trực tuyến khi toàn bộ các bước kiểm tra đều thành công.

---

## 10. Risks & Mitigation (Rủi ro & Phương án Giảm thiểu)

- **Database**:
  - *Rủi ro*: Thay đổi cấu trúc cơ sở dữ liệu làm gián đoạn hệ thống hoặc mất mát dữ liệu đang hoạt động.
  - *Phương án giảm thiểu*: Áp dụng quy trình Prisma Migrations chặt chẽ; viết script migrate hỗ trợ tương thích ngược (backward compatible); luôn thực hiện sao lưu dữ liệu tự động trước khi áp dụng bất kỳ bản cập nhật database nào lên staging/production.
- **Authentication**:
  - *Rủi ro*: Rò rỉ khóa bí mật JWT dẫn đến giả mạo quyền truy cập hệ thống hoặc rò rỉ thông tin đăng nhập của người dùng.
  - *Phương án giảm thiểu*: Đặt khóa bí mật JWT cực kỳ phức tạp trong biến môi trường; thiết lập thời hạn sống của Access Token cực ngắn; thực hiện lưu trữ an toàn Refresh Token tại HttpOnly Cookie; áp dụng cơ chế khóa tài khoản tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp.
- **File Upload**:
  - *Rủi ro*: Người dùng cố tình tải lên các tệp tin chứa mã độc phá hoại máy chủ hoặc tải lên quá nhiều tệp tin rác làm tràn dung lượng lưu trữ của ổ đĩa.
  - *Phương án giảm thiểu*: Chỉ chấp nhận định dạng PDF và giới hạn kích thước tối đa 5MB; đổi tên tệp tin tải lên thành định dạng duy nhất (UUID); lưu trữ tệp tin ngoài thư mục web root; triển khai cron job tự động quét dọn các file rác không có liên kết tham chiếu trong database định kỳ hàng tuần.
- **Concurrent Access**:
  - *Rủi ro*: Nhiều sinh viên ứng tuyển cùng một lúc vào một vị trí tuyển dụng cận giờ hết hạn gây ra hiện tượng nghẽn truy vấn cơ sở dữ liệu hoặc xung đột trạng thái.
  - *Phương án giảm thiểu*: Áp dụng cơ chế khóa lạc quan (optimistic locking) hoặc sử dụng các giao dịch cơ sở dữ liệu (transactions) chặt chẽ; cấu hình tối ưu hóa connection pool của Prisma ORM để quản lý các kết nối DB hiệu quả.
- **Security**:
  - *Rủi ro*: Bị tấn công bởi các lỗ hổng bảo mật phổ biến như SQL Injection, Cross-Site Scripting (XSS), hay Cross-Site Request Forgery (CSRF).
  - *Phương án giảm thiểu*: Sử dụng Prisma ORM giúp loại bỏ nguy cơ SQL Injection; áp dụng Helmet để thiết lập các tiêu đề bảo mật; cấu hình CORS nghiêm ngặt; kiểm tra và làm sạch dữ liệu đầu vào (sanitization) một cách hệ thống ở Backend trước khi lưu trữ.
- **AI Integration**:
  - *Rủi ro*: Mô hình AI hoạt động không ổn định hoặc độ trễ phản hồi quá cao làm ảnh hưởng trực tiếp đến hiệu năng của luồng nghiệp vụ cốt lõi.
  - *Phương án giảm thiểu*: Tách biệt hoàn toàn logic AI ra khỏi luồng nghiệp vụ cốt lõi bằng các Interfaces/Adapters; xử lý các tác vụ AI một cách bất đồng bộ (asynchronous) thông qua Domain Events; triển khai các Mock/Stub Adapters trả về kết quả mặc định để hệ thống luôn chạy ổn định ngay cả khi dịch vụ AI gặp sự cố.

---

## 11. Milestones (Các Mốc hoàn thành Dự án)

> Lịch trình này áp dụng cho phát triển cá nhân có hỗ trợ AI (Cline). Thứ tự Phase giữ nguyên theo plan.md, thời gian được nén lại phù hợp với thực tế 14 ngày.

### Tuần 1 - Foundation & Core Business Logic

- Mốc 1 (Ngày 1): Phase 1 + Phase 2 — Khởi tạo monorepo, cấu hình TypeScript/ESLint/Prettier, Prisma schema hoàn chỉnh, migrate MySQL, seed tài khoản Administrator mặc định.

- Mốc 2 (Ngày 2): Phase 3 — Hạ tầng dùng chung: JWT, BCrypt, RBAC Guards, Error handler, Logger, File Storage adapter, Email adapter, Socket.io. Factory Pattern + Strategy Pattern (TSK-INF-210, TSK-INF-211).

- Mốc 3 (Ngày 3–4): Phase 4 — Authentication: Register, Login, Logout, Change Password, Verify Email. Frontend: form đăng ký/đăng nhập hoàn chỉnh.

- Mốc 4 (Ngày 5–6): Phase 5 + Phase 6 — Student: profile, upload CV, quản lý CV, đặt CV mặc định. Employer: hồ sơ công ty, xem danh sách và chi tiết ứng viên.

- Mốc 5 (Ngày 7): Phase 7 — Job Module: tạo/sửa/đóng tin tuyển dụng, tìm kiếm, lọc, xem chi tiết. Máy trạng thái JobPosting (Draft → Pending → Approved → Rejected → Closed → Expired).

### Tuần 2 - Integration, Admin & Delivery

- Mốc 6 (Ngày 8–9): Phase 8 — Application Module: nộp hồ sơ, rút hồ sơ, cập nhật trạng thái ứng viên, lịch sử ứng tuyển. Kiểm tra BR-01 (không trùng lặp) và BR-02 (tài khoản active).

- Mốc 7 (Ngày 10): Phase 9 — Administrator: duyệt doanh nghiệp, duyệt/từ chối tin tuyển dụng, quản lý tài khoản người dùng, dashboard thống kê, quản lý danh mục hệ thống (FR-AD-05).

- Mốc 8 (Ngày 11): Phase 10 + Phase 11 — Notification: email giao dịch + WebSocket real-time. Integration: cron job tự động chuyển trạng thái Expired mỗi 5 phút (FR-SYS-11), xuất CSV báo cáo, dọn dẹp file rác định kỳ.

- Mốc 9 (Ngày 12–13): Phase 12 — Testing & Security: Unit test Use Cases (coverage >= 80%), Integration test các API endpoint chính, Helmet, Rate limit, CORS.

- Mốc 10 (Ngày 14): Phase 13 — Delivery: Docker + docker-compose, smoke test toàn hệ thống, hoàn thiện api-spec.md + test-plan.md, commit toàn bộ lên GitHub, bàn giao dự án.

---

*Tài liệu được biên soạn và phê duyệt bởi Project Team.*
*Phương pháp phát triển: Specification-Driven Development (SDD).*

## Change Log

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-07-04 | Project Team | Initial Implementation Plan |
