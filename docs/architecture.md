# Architecture Document

**Project:** TrustHire – Student Recruitment Support System  
**Version:** 1.1  
**Status:** Draft  
**Methodology:** Specification-Driven Development (SDD)  
**Last Updated:** 2026-07-20

---

# 1. Architecture Overview

## 1.1 Mục tiêu kiến trúc

Xây dựng một hệ thống tuyển dụng sinh viên **TrustHire** với kiến trúc:
- **Clean Architecture** – Tách biệt rõ ràng các tầng, dễ bảo trì, dễ test, dễ mở rộng
- **Modular Monolith** – MVP chạy như một ứng dụng đơn, nhưng module độc lập, sẵn sàng tách Microservices khi tích hợp AI
- **AI-Ready** – Thiết kế sẵn điểm mở rộng (Extension Points) cho các mô-đun AI mà không làm thay đổi kiến trúc cốt lõi
- **Security-First** – JWT, RBAC, BCrypt, Audit Log, Validation, Rate Limiting tích hợp sẵn
- **Scalable** – Hỗ trợ 100+ concurrent users, response time < 3s, pagination, caching strategy

## 1.2 Phạm vi

Áp dụng cho toàn bộ hệ thống TrustHire MVP bao gồm:
- Frontend: React + Vite (SPA)
- Backend: Node.js + Express.js (RESTful API)
- Database: MySQL 8+ với Prisma ORM
- Authentication: JWT + Refresh Token
- File Storage: Local filesystem (uploads/cv/) – chuẩn bị cho Object Storage

## 1.3 Nguyên tắc thiết kế

| Nguyên tắc                 | Mô tả                                                                    |
| -------------------------- | ------------------------------------------------------------------------ |
| **Separation of Concerns** | Mỗi tầng chỉ lo một trách nhiệm duy nhất                                 |
| **Dependency Inversion**   | Tầng cao (Domain/Application) không phụ thuộc tầng thấp (Infrastructure) |
| **Low Coupling**           | Module giao tiếp qua Interface/Event, không chia sẻ implementation       |
| **High Cohesion**          | Các chức năng liên quan gom chung trong một module                       |
| **Single Responsibility**  | Mỗi class/module chỉ có một lý do để thay đổi                            |
| **Open/Closed**            | Mở rộng bằng cách thêm mới, không sửa code hiện có                       |
| **Interface Segregation**  | Interface nhỏ, chuyên biệt thay vì interface lớn                         |
| **AI Ready**               | AI modules giao tiếp qua Adapter/Interface, không can thiệp Domain core  |

## 1.4 Các tiêu chí đánh giá

| Tiêu chí            | Mục tiêu                                                             |
| ------------------- | -------------------------------------------------------------------- |
| **Performance**     | API response < 3s, Search < 2s, Pagination hỗ trợ large dataset      |
| **Security**        | OWASP Top 10 mitigated, JWT + RBAC, BCrypt, Audit Log immutable      |
| **Maintainability** | Clean Architecture, Repository Pattern, DI, Unit test coverage > 80% |
| **Extensibility**   | Module mới thêm vào không sửa core, AI integration via Adapter       |
| **Reliability**     | Data consistency, Backup/Recovery, Error handling, Logging           |
| **Usability**       | Responsive UI, Vietnamese language, Clear error messages             |

---

# 2. Overall System Architecture

## 2.1 Sơ đồ kiến trúc tổng thể

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser / React + Vite SPA"]
    end

    subgraph API_Gateway["API Gateway / Reverse Proxy"]
        Nginx["Nginx / Cloudflare"]
    end

    subgraph Backend["Backend Application (Modular Monolith)"]
        Express["Express.js Server"]
        
        subgraph Presentation["Presentation Layer (Controllers)"]
            AuthCtrl["AuthController"]
            StudentCtrl["StudentController"]
            EmployerCtrl["EmployerController"]
            JobCtrl["JobController"]
            AppCtrl["ApplicationController"]
            AdminCtrl["AdminController"]
            NotifCtrl["NotificationController"]
        end

        subgraph Application["Application Layer (Use Cases)"]
            AuthUC["AuthUseCases"]
            StudentUC["StudentUseCases"]
            EmployerUC["EmployerUseCases"]
            JobUC["JobUseCases"]
            AppUC["ApplicationUseCases"]
            AdminUC["AdminUseCases"]
            NotifUC["NotificationUseCases"]
            AuditUC["AuditUseCases"]
        end

        subgraph Domain["Domain Layer"]
            AuthDom["Auth Domain"]
            StudentDom["Student Domain"]
            EmployerDom["Employer Domain"]
            JobDom["Job Domain"]
            AppDom["Application Domain"]
            AdminDom["Admin Domain"]
            NotifDom["Notification Domain"]
            AuditDom["Audit Domain"]
            AIDom["AI Extension Interfaces"]
        end

        subgraph Infrastructure["Infrastructure Layer"]
            Prisma["Prisma ORM"]
            MySQL["MySQL Database"]
            JWT["JWT Provider"]
            BCrypt["BCrypt Hasher"]
            Multer["Multer / File Storage"]
            Email["Email Service"]
            Logger["Logger (Pino)"]
            Scheduler["Cron Scheduler"]
            AIAdapter["AI Service Adapters (Future)"]
        end
    end

    Browser --> Nginx
    Nginx --> Express
    Express --> Presentation
    Presentation --> Application
    Application --> Domain
    Application --> Infrastructure
    Domain --> Infrastructure
    Infrastructure --> Prisma
    Prisma --> MySQL
    Infrastructure --> JWT
    Infrastructure --> BCrypt
    Infrastructure --> Multer
    Infrastructure --> Email
    Infrastructure --> Logger
    Infrastructure --> Scheduler
    Infrastructure -.-> AIAdapter
```

## 2.2 Giải thích vai trò từng thành phần

| Thành phần                           | Vai trò                                                                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Browser / React + Vite**           | Single Page Application, giao tiếp với backend qua REST API                                                                         |
| **Nginx / Cloudflare**               | Reverse proxy, SSL termination, rate limiting, static file serving, compression                                                     |
| **Express.js Server**                | HTTP server, middleware pipeline, routing, error handling                                                                           |
| **Presentation Layer (Controllers)** | Nhận HTTP request, validate input DTO, gọi Use Case, trả về HTTP response                                                           |
| **Application Layer (Use Cases)**    | Chứa business logic orchestration, điều phối Domain objects, gọi Repository, phát Domain Events                                     |
| **Domain Layer**                     | Chứa Entities, Value Objects, Domain Services, Repository Interfaces, Domain Events, Business Rules – **không phụ thuộc framework** |
| **Infrastructure Layer**             | Implementations: Prisma Repository, JWT, BCrypt, File Storage, Email, Logger, Scheduler, AI Adapters                                |
| **Prisma ORM**                       | Type-safe database access, migrations, query builder                                                                                |
| **MySQL Database**                   | Persistent storage, ACID transactions                                                                                               |
| **JWT Provider**                     | Access/Refresh token generation, validation, revocation                                                                             |
| **BCrypt Hasher**                    | Password hashing với cost factor configurable                                                                                       |
| **Multer / File Storage**            | Multipart file upload, local storage, chuẩn bị S3 adapter                                                                           |
| **Email Service**                    | Transactional email (SMTP/SendGrid), template, retry                                                                                |
| **Logger (Pino)**                    | Structured JSON logging, log levels, correlation ID                                                                                 |
| **Cron Scheduler**                   | Scheduled jobs (job expiry, cleanup, reports)                                                                                       |
| **AI Service Adapters**              | Interface implementations cho AI services (future microservices)                                                                    |

---

# 3. Core Technology Stack

## 3.1 Frontend

| Technology                       | Lý do lựa chọn                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------- |
| **React 18+**                    | Component-based, large ecosystem, concurrent features, TypeScript support        |
| **Vite**                         | Fast dev server (ESM), instant HMR, optimized production build, plugin ecosystem |
| **TypeScript**                   | Type safety, better DX, refactoring confidence, catches bugs at compile time     |
| **React Router v6**              | Declarative routing, nested routes, data loading APIs                            |
| **TanStack Query (React Query)** | Server state management, caching, deduplication, pagination, optimistic updates  |
| **Zod + React Hook Form**        | Schema validation, type inference, performant form handling                      |
| **Tailwind CSS**                 | Utility-first, responsive design, dark mode, small bundle, customizable          |
| **Axios**                        | HTTP client với interceptors, request/response transformation, error handling    |
| **Socket.io Client**             | Real-time notifications (WebSocket)                                              |

## 3.2 Backend

| Technology                              | Lý do lựa chọn                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| **Node.js 20+ (LTS)**                   | JavaScript runtime, non-blocking I/O, large ecosystem, TypeScript native support   |
| **Express.js**                          | Minimalist, flexible, middleware ecosystem, mature, easy to customize              |
| **TypeScript**                          | Type safety across stack, shared types with frontend, better maintainability       |
| **Prisma ORM**                          | Type-safe database access, auto-generated types, migrations, relation handling, DX |
| **MySQL 8+**                            | ACID compliance, JSON support, CTE, window functions, mature, cost-effective       |
| **JWT (jsonwebtoken)**                  | Stateless auth, scalable, industry standard, access + refresh token pattern        |
| **BCrypt (bcryptjs)**                   | Adaptive hashing, configurable cost, battle-tested, timing attack resistant        |
| **Multer**                              | Multipart/form-data handling, file size/type limits, disk/memory storage           |
| **Zod**                                 | Runtime validation, TypeScript inference, composable schemas                       |
| **Pino**                                | Fast structured JSON logging, child loggers, redaction, pretty print dev mode      |
| **Helmet**                              | Security headers (CSP, HSTS, X-Frame-Options, etc.)                                |
| **CORS (cors)**                         | Configurable Cross-Origin Resource Sharing                                         |
| **express-rate-limit**                  | Rate limiting middleware, Redis store support for scaling                          |
| **class-validator / class-transformer** | Decorator-based DTO validation (optional, Zod preferred)                           |
| **node-cron**                           | Scheduled jobs (job expiry, cleanup, reports)                                      |
| **Socket.io**                           | Real-time WebSocket communication for notifications                                |

## 3.3 Infrastructure & DevOps

| Technology                  | Lý do lựa chọn                                                |
| --------------------------- | ------------------------------------------------------------- |
| **Docker / Docker Compose** | Containerization, consistent environments, easy deployment    |
| **GitHub Actions**          | CI/CD pipeline, lint, test, build, deploy                     |
| **GitHub Spec Kit**         | Specification-driven development, AI-assisted spec generation |
| **Cline**                   | AI coding agent for implementation                            |
| **OpenRouter**              | LLM API gateway for AI features                               |
| **ESLint + Prettier**       | Code quality, consistent formatting                           |
| **Jest + Supertest**        | Unit & integration testing                                    |
| **Husky + lint-staged**     | Pre-commit hooks                                              |

---

# 4. Architectural Principles

## 4.1 Clean Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  Controllers, DTOs, Middleware, Route Guards                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Depends on (Use Case Interfaces)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  Use Cases, Application Services, DTOs, Validation          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Depends on (Domain Interfaces)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  Entities, Value Objects, Domain Services,                  │
│  Repository Interfaces, Domain Events, Business Rules       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Implemented by
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│  Repository Implementations, ORM, External Services,        │
│  File Storage, Email, JWT, Logging, Scheduler, AI Adapters  │
└─────────────────────────────────────────────────────────────┘
```

**Dependency Rule:** Inner layers không biết outer layers. Dependencies chỉ đi hướng trong (inward).

## 4.2 SOLID Principles

| Principle                 | Application                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **S**ingle Responsibility | Mỗi class/module một trách nhiệm: Controller chỉ handle HTTP, Use Case chỉ orchestrate, Repository chỉ data access |
| **O**pen/Closed           | Mở rộng bằng Interface/Adapter: thêm AI provider mới không sửa Use Case, thêm storage backend không sửa Domain     |
| **L**iskov Substitution   | Repository implementations thay thế lẫn nhau được, AI Adapters implement common interface                          |
| **I**nterface Segregation | `IUserRepository`, `IJobRepository`, `IResumeAnalyzer` – nhỏ, chuyên biệt                                          |
| **D**ependency Inversion  | Use Case depend trên `IUserRepository` (Domain), không depend `PrismaUserRepository` (Infrastructure)              |

## 4.3 Separation of Concerns

| Layer              | Concern                                                                             |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Presentation**   | HTTP protocol, serialization, validation, auth middleware                           |
| **Application**    | Use case orchestration, transaction boundary, authorization check, event publishing |
| **Domain**         | Business logic, invariants, rules, state transitions, domain events                 |
| **Infrastructure** | Database, external APIs, file system, email, scheduling, logging                    |

## 4.4 Dependency Inversion

```typescript
// Domain Layer - Interface
interface IStudentRepository {
  findById(id: StudentId): Promise<StudentProfile | null>;
  save(student: StudentProfile): Promise<void>;
}

// Infrastructure Layer - Implementation
class PrismaStudentRepository implements IStudentRepository {
  constructor(private prisma: PrismaClient) {}
  async findById(id: StudentId) { /* ... */ }
  async save(student: StudentProfile) { /* ... */ }
}

// Application Layer - Use Case depends on Interface
class UpdateProfileUseCase {
  constructor(private studentRepo: IStudentRepository) {}
  async execute(input: UpdateProfileInput) { /* ... */ }
}
```

## 4.5 Low Coupling, High Cohesion

- **Module boundaries** rõ ràng: Auth, Student, Employer, Job, Application, Admin, Notification, Audit, AI
- **Communication**: Use Case → Domain Events → Event Handlers (async) hoặc Direct Interface calls (sync)
- **Shared Kernel**: Chỉ `common/` (guards, pipes, filters, exceptions, events base classes)

## 4.6 AI Ready

- AI capabilities định nghĩa dưới dạng **Interfaces** trong Domain Layer (`IResumeAnalyzer`, `ITrustScoreEngine`, `IRecommendationEngine`, `IFraudDetector`, `ISkillMatcher`)
- **Adapter Pattern**: Infrastructure cung cấp implementation (Stub/NoOp cho MVP, HTTP/gRPC client cho Microservice AI)
- **Event-driven**: Domain Events (`ApplicationSubmitted`, `JobPosted`, `CVUploaded`) trigger AI processing async
- **No AI in MVP Core**: MVP chạy độc lập, AI modules có thể bật/tắt bằng feature flag

## 4.7 Module Independence

- Mỗi module có thể develop, test, deploy độc lập (trong monolith)
- Database schema per module (prefix table names), shared tables chỉ qua Foreign Key
- Module communication qua **Use Case interfaces** hoặc **Domain Events**, không import internal classes

## 4.8 Factory Pattern

Factory Pattern được áp dụng để tạo các đối tượng domain phức tạp, đảm bảo Business Rules được thực thi ngay tại điểm khởi tạo và tách logic tạo đối tượng khỏi Use Case.

| Factory                  | Vị trí                        | Mục đích                                                                                              |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `UserFactory`            | `modules/auth/domain/`        | Tạo `User` với role hợp lệ, hash password, set `isActive = false`                                     |
| `StudentProfileFactory`  | `modules/student/domain/`     | Tạo `StudentProfile` gắn với `userId`, kiểm tra role = Student                                        |
| `EmployerProfileFactory` | `modules/employer/domain/`    | Tạo `EmployerProfile` gắn với `userId`, set `verified = false`                                        |
| `JobPostingFactory`      | `modules/job/domain/`         | Tạo `JobPosting` với state khởi tạo = `Draft`, validate title/description                             |
| `ApplicationFactory`     | `modules/application/domain/` | Tạo `Application` với state = `Applied`, kiểm tra BR-01 (ứng tuyển 1 lần) và BR-02 (tài khoản active) |

```typescript
// Ví dụ: ApplicationFactory trong Domain Layer
class ApplicationFactory {
  static create(
    job: JobPosting,
    student: StudentProfile,
    cv: CV,
    coverLetter?: string
  ): Application {
    // BR-01: kiểm tra không trùng lặp ứng tuyển (do Use Case gọi trước)
    // BR-02: kiểm tra student.isActive
    if (!student.isActive) throw new ForbiddenException('B003');
    return new Application({
      jobId: job.id,
      studentId: student.userId,
      cvId: cv.id,
      coverLetter,
      state: ApplicationState.Applied,
      appliedAt: new Date(),
    });
  }
}
```

## 4.9 Strategy Pattern

Strategy Pattern được áp dụng cho các hành vi có thể thay đổi implementation mà không ảnh hưởng Use Case. Interface định nghĩa tại Domain Layer, implementation tại Infrastructure Layer.

| Interface               | Implementations                                                                               | Mục đích                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `IFileStorageStrategy`  | `LocalFileStorageStrategy` (MVP), `S3FileStorageStrategy` (future)                            | Lưu trữ CV, Avatar — dễ chuyển đổi sang S3/MinIO |
| `INotificationStrategy` | `EmailNotificationStrategy`, `WebSocketNotificationStrategy`, `CompositeNotificationStrategy` | Gửi thông báo qua email, WebSocket hoặc cả hai   |
| `IPasswordHashStrategy` | `BcryptHashStrategy`                                                                          | Mã hóa mật khẩu, cost factor configurable        |
| `ITokenStrategy`        | `JwtAccessTokenStrategy`, `JwtRefreshTokenStrategy`                                           | Tạo và xác thực JWT với cấu hình khác nhau       |

```typescript
// Ví dụ: IFileStorageStrategy trong Domain Layer
interface IFileStorageStrategy {
  save(file: Buffer, path: string, mimeType: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

// Infrastructure Layer — MVP
class LocalFileStorageStrategy implements IFileStorageStrategy {
  async save(file: Buffer, path: string): Promise<string> { /* lưu local */ }
  getUrl(path: string): string { return `/uploads/${path}`; }
}

// Infrastructure Layer — Future
class S3FileStorageStrategy implements IFileStorageStrategy {
  async save(file: Buffer, path: string): Promise<string> { /* upload S3 */ }
  getUrl(path: string): string { return `https://s3.amazonaws.com/.../${path}`; }
}

// Use Case chỉ phụ thuộc Interface, không biết implementation
class UploadCVUseCase {
  constructor(private fileStorage: IFileStorageStrategy) {}
  async execute(input: UploadCVInput): Promise<CVMetadata> {
    const url = await this.fileStorage.save(input.buffer, `cv/${input.studentId}/${uuid()}.pdf`, 'application/pdf');
    // ...
  }
}
```

---

# 5. Clean Architecture - Layer Details

## 5.1 Presentation Layer

### Vai trò
- Entry point cho HTTP requests
- Chuyển đổi HTTP request → Use Case Input DTO
- Chuyển đổi Use Case Output/Error → HTTP Response
- Authentication/Authorization middleware
- Request validation (Zod schemas)
- Rate limiting, CORS, Security headers

### Thành phần
| Component                   | Trách nhiệm                                                   |
| --------------------------- | ------------------------------------------------------------- |
| **Controllers**             | Route handlers, gọi Use Case, map response                    |
| **DTOs (Request/Response)** | Data transfer objects với validation schemas                  |
| **Guards**                  | JWT Auth Guard, RBAC Guard, Rate Limit Guard                  |
| **Pipes**                   | Validation Pipe (Zod), Transform Pipe                         |
| **Filters**                 | Global Exception Filter, HTTP Exception Filter                |
| **Interceptors**            | Logging Interceptor, Transform Interceptor, Cache Interceptor |

### Luồng xử lý
```
HTTP Request
    │
    ▼
Middleware (CORS, Helmet, RateLimit, Logger)
    │
    ▼
Route Guard (Auth → RBAC)
    │
    ▼
Validation Pipe (Zod Schema)
    │
    ▼
Controller Method
    │
    ▼
Use Case Execute(inputDTO)
    │
    ▼
Use Case Returns OutputDTO / Throws DomainException
    │
    ▼
Exception Filter (map to HTTP status + error format)
    │
    ▼
Response Interceptor (wrap format)
    │
    ▼
HTTP Response
```

## 5.2 Application Layer

### Use Cases
Mỗi Use Case = một business operation đơn lẻ (Single Responsibility).

| Module           | Use Cases (Ví dụ)                                                                                                                                                                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**         | `RegisterUseCase`, `LoginUseCase`, `LogoutUseCase`, `RefreshTokenUseCase`, `ChangePasswordUseCase`, `VerifyEmailUseCase`, `RequestPasswordResetUseCase`, `ResetPasswordUseCase`                                                                                                                    |
| **Student**      | `UpdateProfileUseCase`, `UploadCVUseCase`, `DeleteCVUseCase`, `SetDefaultCVUseCase`, `SearchJobsUseCase`, `GetJobDetailsUseCase`, `ApplyJobUseCase`, `WithdrawApplicationUseCase`, `GetApplicationHistoryUseCase`, `GetApplicationStatusUseCase`                                                   |
| **Employer**     | `UpdateCompanyProfileUseCase`, `CreateJobPostingUseCase`, `UpdateJobPostingUseCase`, `CloseJobPostingUseCase`, `ReopenJobPostingUseCase`, `GetMyJobPostingsUseCase`, `GetJobApplicantsUseCase`, `GetApplicantDetailsUseCase`, `UpdateApplicationStatusUseCase`, `GenerateRecruitmentReportUseCase` |
| **Job (Public)** | `SearchJobsUseCase`, `GetJobDetailsUseCase`, `FilterJobsUseCase`                                                                                                                                                                                                                                   |
| **Application**  | `SubmitApplicationUseCase`, `UpdateApplicationStatusUseCase`, `WithdrawApplicationUseCase`, `GetApplicationHistoryUseCase`                                                                                                                                                                         |
| **Admin**        | `VerifyEmployerUseCase`, `ApproveJobPostingUseCase`, `RejectJobPostingUseCase`, `ManageUserAccountUseCase`, `GetDashboardStatsUseCase`, `ExportAuditLogsUseCase`, `ManageCategoriesUseCase`                                                                                                        |
| **Notification** | `SendNotificationUseCase`, `GetUserNotificationsUseCase`, `MarkAsReadUseCase`                                                                                                                                                                                                                      |
| **Audit**        | `GetAuditLogsUseCase`, `ExportAuditLogsUseCase`                                                                                                                                                                                                                                                    |

### Services
- **Application Services**: Orchestration logic phức tạp, cross-use-case (ví dụ: `EmailNotificationService` gửi email cho nhiều use case)
- **Domain Services**: Business logic không thuộc về một Entity cụ thể (ví dụ: `JobMatchingService`, `ApplicationStateMachine`)

### DTOs
- **Input DTOs**: Validate bằng Zod schema, map từ Controller
- **Output DTOs**: Serializable, không chứa business logic
- **Shared DTOs**: Pagination, Sorting, Filter params

### Validation
- **Input Validation**: Zod schema tại Pipe level (Presentation) + Use Case level (defensive)
- **Business Rule Validation**: Trong Domain Entities/Value Objects (invariant enforcement)
- **Cross-field Validation**: Trong Use Case hoặc Domain Service

## 5.3 Domain Layer

### Entities (Aggregate Roots)
| Entity              | Aggregate Root      | Key Invariants                                                                           |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| **User**            | Yes                 | Email unique, password hashed, role immutable after creation                             |
| **StudentProfile**  | Yes (owned by User) | One per User, required fields, CV list management                                        |
| **EmployerProfile** | Yes (owned by User) | One per User, verified flag controlled by Admin                                          |
| **JobPosting**      | Yes                 | State machine (Draft→Pending→Approved/Rejected→Closed/Expired), owner only edit          |
| **Application**     | Yes                 | State machine (Applied→UnderReview→Accepted/Rejected/Withdrawn), one per student per job |
| **AuditLog**        | Yes                 | Immutable, append-only, tamper-evident                                                   |

### Value Objects
| Value Object                                       | Mô tả                                                         |
| -------------------------------------------------- | ------------------------------------------------------------- |
| **Email**                                          | Value object với validation RFC-5322, equality by value       |
| **Password**                                       | Value object, never exposed plain, hashed on creation         |
| **StudentId / EmployerId / JobId / ApplicationId** | Branded types (TypeScript nominal typing)                     |
| **JobState**                                       | Enum-like VO với transition validation                        |
| **ApplicationState**                               | Enum-like VO với transition validation                        |
| **CVMetadata**                                     | fileName, filePath, fileSize, mimeType, uploadedAt, isDefault |
| **Money / SalaryRange**                            | Value object cho salary min/max, currency                     |
| **PaginationParams / PaginatedResult**             | Reusable pagination VO                                        |

### Repository Interfaces (Domain Layer)
```typescript
// Domain/Repositories/IUserRepository.ts
interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

// Domain/Repositories/IJobPostingRepository.ts
interface IJobPostingRepository {
  findById(id: JobId): Promise<JobPosting | null>;
  findApproved(filters: JobFilters, pagination: PaginationParams): Promise<PaginatedResult<JobPosting>>;
  findByEmployer(employerId: EmployerId, pagination: PaginationParams): Promise<PaginatedResult<JobPosting>>;
  save(job: JobPosting): Promise<void>;
  delete(id: JobId): Promise<void>;
}
```

### Business Rules (Domain Invariants)
- **BR-01**: Student chỉ ứng tuyển 1 lần cho 1 job (Application unique constraint studentId+jobId)
- **BR-02**: Student chỉ ứng tuyển khi account active + email verified
- **BR-03**: Employer phải verified mới được tạo job
- **BR-04**: Job phải approved mới hiển thị cho student search
- **BR-05**: Chỉ owner mới edit job posting
- **BR-06**: Chỉ owner profile mới edit profile
- **BR-07**: Admin full access
- **BR-08**: Job expired tự chuyển state (scheduled job)
- **BR-09**: Employer chỉ xem CV của student đã apply job của họ
- **BR-10**: Mọi action quan trọng ghi AuditLog

### Domain Events
| Event                      | Triggered By                   | Consumers                                                    |
| -------------------------- | ------------------------------ | ------------------------------------------------------------ |
| `UserRegistered`           | RegisterUseCase                | EmailVerificationSender, AuditLogger                         |
| `UserLoggedIn`             | LoginUseCase                   | AuditLogger, SecurityMonitor                                 |
| `EmployerVerified`         | VerifyEmployerUseCase          | NotificationService, AuditLogger                             |
| `JobPostingCreated`        | CreateJobPostingUseCase        | AdminNotification, AuditLogger                               |
| `JobPostingApproved`       | ApproveJobPostingUseCase       | EmployerNotification, SearchIndexer, AuditLogger             |
| `JobPostingRejected`       | RejectJobPostingUseCase        | EmployerNotification, AuditLogger                            |
| `ApplicationSubmitted`     | ApplyJobUseCase                | EmployerNotification, AuditLogger, AIResumeAnalysis (future) |
| `ApplicationStatusChanged` | UpdateApplicationStatusUseCase | StudentNotification, AuditLogger                             |
| `CVUploaded`               | UploadCVUseCase                | AuditLogger, AIResumeAnalysis (future)                       |
| `UserAccountLocked`        | ManageUserAccountUseCase       | NotificationService, AuditLogger                             |

## 5.4 Infrastructure Layer

### Repository Implementations
| Repository                | Implementation                 | Technology    |
| ------------------------- | ------------------------------ | ------------- |
| `IUserRepository`         | `PrismaUserRepository`         | Prisma Client |
| `IStudentRepository`      | `PrismaStudentRepository`      | Prisma Client |
| `IEmployerRepository`     | `PrismaEmployerRepository`     | Prisma Client |
| `IJobPostingRepository`   | `PrismaJobPostingRepository`   | Prisma Client |
| `IApplicationRepository`  | `PrismaApplicationRepository`  | Prisma Client |
| `IAuditLogRepository`     | `PrismaAuditLogRepository`     | Prisma Client |
| `INotificationRepository` | `PrismaNotificationRepository` | Prisma Client |

### Database
- **Prisma ORM**: Type-safe queries, migrations, relation handling
- **MySQL 8+**: InnoDB, UTF8MB4, Foreign Keys, Indexes
- **Connection Pool**: Configured via Prisma datasource

### Authentication & Security
| Component           | Implementation                                                                |
| ------------------- | ----------------------------------------------------------------------------- |
| **JWT Provider**    | `JwtTokenProvider` – sign/verify access & refresh tokens, JWKS support future |
| **Password Hasher** | `BcryptPasswordHasher` – cost factor 12, timing-safe compare                  |
| **Token Blacklist** | `RedisTokenBlacklist` (or DB table) – revoked refresh tokens                  |
| **Rate Limiter**    | `express-rate-limit` với Redis store cho production                           |

### File Storage
| Component                | Implementation                                                             |
| ------------------------ | -------------------------------------------------------------------------- |
| **File Storage Adapter** | `FileStorageAdapter` interface                                             |
| **Local Storage**        | `LocalFileStorage` – `uploads/cv/{studentId}/`, `uploads/avatar/{userId}/` |
| **S3 Storage (Future)**  | `S3FileStorage` – implements same interface                                |

### External Services
| Service                  | Adapter                                                                   |
| ------------------------ | ------------------------------------------------------------------------- |
| **Email**                | `EmailServiceAdapter` – Nodemailer/SendGrid, template engine, retry queue |
| **AI Services (Future)** | `AIServiceAdapter` – HTTP/gRPC client cho AI microservices                |

### Logging
- **Pino Logger**: Structured JSON, levels (trace, debug, info, warn, error, fatal)
- **Correlation ID**: Request-scoped logger với `requestId`
- **Redaction**: Auto-redact sensitive fields (password, token, PII)

### Scheduler
- **node-cron**: Jobs định kỳ
- **Jobs**: `JobExpiryJob` (mỗi 5 phút), `AuditLogCleanupJob` (hàng ngày), `ReportGenerationJob` (tuần)

---

## 5.5 Dependency Rule Summary

```
Presentation Layer
       │
       ▼ (depends on Use Case Interfaces)
Application Layer
       │
       ▼ (depends on Domain Interfaces)
Domain Layer ◄──────────────────┐
       │                         │
       ▼ (implemented by)        │
Infrastructure Layer ────────────┘
```

**Không được:**
- Controller import Prisma Client
- Use Case import Repository Implementation
- Domain import Infrastructure
- Entity chứa business logic gọi external service

---

# 6. Project Structure

## 6.1 Backend Structure (`source-code/backend/`) — Implementation Status

```
source-code/backend/
├── src/
│   ├── main.ts                      # Application entry point [✅ Implemented]
│   ├── common/                      # Shared Kernel [✅ Implemented]
│   │   ├── decorators/              # Custom decorators (CurrentUser, Roles, Public)
│   │   ├── guards/                  # AuthGuard, RolesGuard, RateLimitGuard
│   │   ├── pipes/                   # ValidationPipe (Zod), TransformPipe
│   │   ├── filters/                 # HttpExceptionFilter, AllExceptionsFilter
│   │   ├── interceptors/            # LoggingInterceptor, TransformInterceptor
│   │   ├── dto/                     # PaginationDto, PaginatedResultDto, BaseResponseDto
│   │   ├── exceptions/              # BusinessException, ValidationException, AuthException, ForbiddenException, NotFoundException, ConflictException
│   │   ├── events/                  # DomainEventPublisher, EventBus, DomainEvent base class
│   │   └── utils/                   # Date, String, Crypto helpers
│   ├── config/                      # Configuration [✅ Implemented]
│   │   ├── database.config.ts       # Prisma config
│   │   ├── jwt.config.ts            # JWT secret, expiry
│   │   ├── storage.config.ts        # Local/S3 config
│   │   ├── email.config.ts          # SMTP config
│   │   └── app.config.ts            # App-wide config
│   ├── modules/                     # Feature modules (Clean Architecture per module)
│   │   ├── auth/                    # [✅ Fully Implemented]
│   │   │   ├── presentation/        # Controllers, DTOs, Guards
│   │   │   ├── application/         # Use Cases (Register, Login, Logout, ChangePassword, VerifyEmail)
│   │   │   ├── domain/              # Entities (User), ValueObjects (Email, Password), Repository Interfaces, Domain Services, Events, Factories
│   │   │   ├── infrastructure/      # PrismaUserRepository, JwtTokenProvider, BcryptPasswordHasher
│   │   │   └── composition/         # AuthModule DI wiring
│   │   ├── student/                 # [✅ Fully Implemented]
│   │   │   ├── presentation/        # StudentController, routes
│   │   │   ├── application/         # UpdateProfile, UploadCV, ManageCVList, GetApplicationHistory, GetJobDetail
│   │   │   ├── domain/              # StudentProfile, CV, Repository Interfaces, Factories
│   │   │   ├── infrastructure/      # PrismaStudentRepository
│   │   │   └── composition/         # StudentModule DI wiring
│   │   ├── employer/                # [✅ Fully Implemented]
│   │   │   ├── presentation/        # EmployerController, routes
│   │   │   ├── application/         # UpdateCompanyProfile, GetMyApplicants, ViewApplicantDetails
│   │   │   ├── domain/              # EmployerProfile, EmployerProfileFactory, Repository Interfaces
│   │   │   ├── infrastructure/      # PrismaEmployerRepository
│   │   │   └── composition/         # EmployerModule DI wiring
│   │   ├── job/                     # [✅ Fully Implemented]
│   │   │   ├── domain/              # JobPosting (Aggregate), JobState VO, Repository Interface
│   │   │   ├── presentation/        # [✅ Implemented] JobController, routes
│   │   │   ├── application/         # [✅ Implemented] 7 use cases
│   │   │   └── infrastructure/      # [✅ Implemented] PrismaJobPostingRepository
│   │   ├── application/             # [✅ Fully Implemented]
│   │   │   ├── domain/              # Application (Aggregate), ApplicationState VO, Repository Interface
│   │   │   ├── presentation/        # [✅ Implemented] ApplicationController, routes
│   │   │   ├── application/         # [✅ Implemented] ApplyJob, UpdateStatus, Withdraw
│   │   │   └── infrastructure/      # [✅ Implemented] PrismaApplicationRepository
│   │   ├── admin/                   # [✅ Fully Implemented]
│   │   ├── notification/            # [✅ Fully Implemented]
│   │   ├── audit/                   # [✅ Fully Implemented]
│   │   └── ai/                      # [❌ Not Implemented]
│   └── infrastructure/              # Cross-cutting infrastructure [✅ Implemented]
│       ├── database/                # PrismaClient provider, migrations
│       ├── security/                # JwtProvider, BcryptHasher, TokenBlacklist
│       ├── storage/                 # FileStorageAdapter (Local/S3)
│       ├── email/                   # EmailServiceAdapter
│       ├── logging/                 # Logger provider (Pino)
│       └── scheduler/               # Cron jobs setup
├── prisma/
│   ├── schema.prisma                # Database schema [✅ Implemented]
│   └── migrations/                  # Migration files [✅ Implemented]
├── package.json                     # [✅ Implemented]
├── tsconfig.json                    # [✅ Implemented]
├── .env.example                     # [✅ Implemented]
└── jest.config.ts                   # [✅ Implemented]
```

## 6.2 Frontend Structure (`source-code/frontend/`) — Implementation Status

```
source-code/frontend/
├── public/                          # Static assets [✅ Implemented]
├── src/
│   ├── app/                         # App-level setup [✅ Implemented]
│   │   ├── providers/               # Context providers (Auth, Theme, Query)
│   │   ├── routes/                  # Route definitions, lazy loading
│   │   └── layout/                  # Layout components
│   ├── features/                    # Feature-based modules (Domain-driven)
│   │   ├── auth/                    # [✅ Fully Implemented] Login, Register
│   │   ├── student/                 # [✅ Fully Implemented] Profile, CV, Applications
│   │   │   ├── components/          # StudentProfilePage, StudentCvPage, CvUploadZone, CvListItem, CvEmptyState, NoDefaultCvBanner, ApplicationHistoryPage, ApplicationHistoryItem, ApplicationHistoryPagination, ApplicationHistoryEmptyState, ApplicationHistorySkeleton
│   │   │   ├── hooks/               # useProfileForm, useCvUpload, useCvList, useApplicationHistory
│   │   │   ├── services/            # student.service, application-history.service
│   │   │   ├── schemas/             # profile.schema, cv.schema
│   │   │   └── types/               # student.types, cv.types, application-history.types
│   │   ├── employer/                # [✅ Fully Implemented] Company Profile, Applicants, Applicant Detail
│   │   │   ├── components/          # CompanyProfilePage, ApplicantsPage, ApplicantRow, ApplicantsPagination, ApplicantsEmptyState, ApplicantsSkeleton, ApplicantDetailPage
│   │   │   ├── hooks/               # useCompanyProfileForm, useApplicants
│   │   │   ├── services/            # employer.service, applicants.service
│   │   │   ├── schemas/             # company-profile.schema
│   │   │   └── types/               # company-profile.types, applicants.types
│   │   ├── admin/                   # [✅ Fully Implemented] Dashboard, Pending Approvals, Users, Audit Log
│   │   └── shared/                  # [❌ Not Implemented]
│   ├── core/                        # Core infrastructure [✅ Implemented]
│   │   ├── api/                     # Axios instance, interceptors, endpoints
│   │   ├── auth/                    # Token management, auth state
│   │   ├── ui/                      # Design system components (Button, Input, Table, Modal)
│   │   ├── hooks/                   # Shared hooks (useQuery, useMutation, useAuth)
│   │   ├── utils/                   # Formatters, validators, constants
│   │   └── types/                   # Shared TypeScript types
│   ├── styles/                      # Global styles, theme, CSS variables [✅ Implemented]
│   └── main.tsx                     # Entry point [✅ Implemented]
├── index.html                       # [✅ Implemented]
├── package.json                     # [✅ Implemented]
├── tsconfig.json                    # [✅ Implemented]
├── vite.config.ts                   # [✅ Implemented]
└── .env.example                     # [✅ Implemented]
```

**Trách nhiệm từng thư mục:**
- `features/` – Mỗi feature độc lập, chứa components, hooks, types, api calls riêng
- `core/` – Shared infrastructure, không chứa business logic
- `app/` – App composition, routing, providers

---

# 7. Module Architecture

## 7.1 Module Overview

```mermaid
graph TB
    subgraph Core["Core Modules"]
        Auth["Authentication"]
        Student["Student"]
        Employer["Employer"]
        Job["Job Posting"]
        Application["Application"]
        Admin["Administrator"]
        Notification["Notification"]
        Audit["Audit Log"]
    end
    
    subgraph AI["AI Extension Modules (Future)"]
        AIResume["Resume Analysis"]
        AITrust["Trust Score Engine"]
        AIRec["Recommendation Engine"]
        AIFraud["Fraud Detection"]
        AISkill["Skill Matching"]
    end
    
    Auth --> Student
    Auth --> Employer
    Auth --> Admin
    Student --> Job
    Student --> Application
    Employer --> Job
    Employer --> Application
    Admin --> Employer
    Admin --> Job
    Admin --> Student
    Application --> Notification
    Job --> Notification
    Employer --> Notification
    Student --> Notification
    Auth --> Audit
    Student --> Audit
    Employer --> Audit
    Admin --> Audit
    Job --> Audit
    Application --> Audit
    
    AIResume -.-> Student
    AITrust -.-> Employer
    AITrust -.-> Student
    AIRec -.-> Student
    AIRec -.-> Employer
    AIFraud -.-> Job
    AIFraud -.-> Employer
    AISkill -.-> Student
    AISkill -.-> Job
```

## 7.2 Module Details

### 7.2.1 Authentication Module

| Aspect            | Description                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Mục tiêu**      | Xác thực và phân quyền người dùng                                                                       |
| **Trách nhiệm**   | Đăng ký, đăng nhập, đăng xuất, refresh token, đổi mật khẩu, xác thực email, quên mật khẩu               |
| **Use Cases**     | Register, Login, Logout, RefreshToken, ChangePassword, VerifyEmail, RequestPasswordReset, ResetPassword |
| **Main Entities** | User, RefreshToken                                                                                      |
| **Repository**    | IUserRepository, IRefreshTokenRepository                                                                |
| **Services**      | JwtTokenProvider, BcryptPasswordHasher, EmailVerificationService                                        |
| **Quan hệ**       | Cung cấp User context cho tất cả module khác; phát Domain Events (UserRegistered, UserLoggedIn)         |

### 7.2.2 Student Module

| Aspect            | Description                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mục tiêu**      | Quản lý hồ sơ sinh viên, CV, tìm kiếm và ứng tuyển việc làm                                                                                            |
| **Trách nhiệm**   | Profile management, CV upload/management, job search/filter, application submission/tracking                                                           |
| **Use Cases**     | UpdateProfile, UploadCV, DeleteCV, SetDefaultCV, SearchJobs, GetJobDetails, ApplyJob, WithdrawApplication, GetApplicationHistory, GetApplicationStatus |
| **Main Entities** | StudentProfile, CV                                                                                                                                     |
| **Repository**    | IStudentRepository, ICVRepository                                                                                                                      |
| **Services**      | FileStorageAdapter (CV), JobSearchService                                                                                                              |
| **Quan hệ**       | Depends on Auth (User), Job (search), Application (submit), Notification (receive)                                                                     |

### 7.2.3 Employer Module

| Aspect            | Description                                                                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục tiêu**      | Quản lý doanh nghiệp, đăng tin tuyển dụng, quản lý ứng viên                                                                                                                                              |
| **Trách nhiệm**   | Company profile, job posting CRUD, applicant review, status updates, reports                                                                                                                             |
| **Use Cases**     | UpdateCompanyProfile, CreateJobPosting, UpdateJobPosting, CloseJobPosting, ReopenJobPosting, GetMyJobPostings, GetJobApplicants, GetApplicantDetails, UpdateApplicationStatus, GenerateRecruitmentReport |
| **Main Entities** | EmployerProfile, JobPosting                                                                                                                                                                              |
| **Repository**    | IEmployerRepository, IJobPostingRepository                                                                                                                                                               |
| **Services**      | JobStateMachine, ApplicationStateMachine                                                                                                                                                                 |
| **Quan hệ**       | Depends on Auth (User), Job (own), Application (review), Admin (verification), Notification (send/receive)                                                                                               |

### 7.2.4 Job Module (Public)

| Aspect            | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| **Mục tiêu**      | Cung cấp chức năng tìm kiếm, xem chi tiết tin tuyển dụng công khai           |
| **Trách nhiệm**   | Search, filter, pagination, view details cho approved jobs                   |
| **Use Cases**     | SearchJobs, GetJobDetails, FilterJobs                                        |
| **Main Entities** | JobPosting (read-only view)                                                  |
| **Repository**    | IJobPostingRepository (read methods)                                         |
| **Services**      | SearchService, FilterService                                                 |
| **Quan hệ**       | Independent read access; data từ Employer module; consumed by Student module |

### 7.2.5 Application Module

| Aspect            | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Mục tiêu**      | Quản lý vòng đời hồ sơ ứng tuyển                                                       |
| **Trách nhiệm**   | Submit, status transitions, withdrawal, history                                        |
| **Use Cases**     | SubmitApplication, UpdateApplicationStatus, WithdrawApplication, GetApplicationHistory |
| **Main Entities** | Application (Aggregate Root)                                                           |
| **Repository**    | IApplicationRepository                                                                 |
| **Services**      | ApplicationStateMachine (validates transitions)                                        |
| **Quan hệ**       | Bridge giữa Student và Employer; phát Domain Events cho Notification, Audit, AI        |

### 7.2.6 Administrator Module

| Aspect            | Description                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Mục tiêu**      | Quản trị hệ thống: duyệt doanh nghiệp, duyệt tin, quản lý user, dashboard, audit                                             |
| **Trách nhiệm**   | Employer verification, Job approval, User management, System categories, Dashboard stats, Audit log                          |
| **Use Cases**     | VerifyEmployer, ApproveJobPosting, RejectJobPosting, ManageUserAccount, GetDashboardStats, ExportAuditLogs, ManageCategories |
| **Main Entities** | (uses User, EmployerProfile, JobPosting, AuditLog)                                                                           |
| **Repository**    | IAdminRepository (composite queries)                                                                                         |
| **Services**      | DashboardService, AuditExportService                                                                                         |
| **Quan hệ**       | Full read/write access đến tất cả module; phát Domain Events cho Notification, Audit                                         |

### 7.2.7 Notification Module

| Aspect            | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| **Mục tiêu**      | Hệ thống thông báo real-time và in-app                                         |
| **Trách nhiệm**   | Gửi thông báo (email, in-app, push), quản lý notification center, mark as read |
| **Use Cases**     | SendNotification, GetUserNotifications, MarkAsRead                             |
| **Main Entities** | Notification                                                                   |
| **Repository**    | INotificationRepository                                                        |
| **Services**      | EmailServiceAdapter, WebSocketGateway (Socket.io)                              |
| **Quan hệ**       | Consumed by tất cả module qua Domain Events; async processing                  |

### 7.2.8 Audit Module

| Aspect            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| **Mục tiêu**      | Ghi log bảo mật và tuân thủ (compliance)             |
| **Trách nhiệm**   | Immutable audit trail, query, export                 |
| **Use Cases**     | GetAuditLogs, ExportAuditLogs                        |
| **Main Entities** | AuditLog                                             |
| **Repository**    | IAuditLogRepository                                  |
| **Services**      | AuditLogger (auto-called từ Domain Events)           |
| **Quan hệ**       | Receive events từ tất cả module; read-only cho Admin |

### 7.2.9 AI Extension Modules (Future)

| Module                    | Interface               | Mục đích                                                    |
| ------------------------- | ----------------------- | ----------------------------------------------------------- |
| **Resume Analysis**       | `IResumeAnalyzer`       | Phân tích CV, trích xuất skills, experience, scoring        |
| **Trust Score Engine**    | `ITrustScoreEngine`     | Tính điểm uy tín Employer/Student dựa trên hành vi, lịch sử |
| **Recommendation Engine** | `IRecommendationEngine` | Gợi ý việc làm cho Student, gợi ý ứng viên cho Employer     |
| **Fraud Detection**       | `IFraudDetector`        | Phát hiện job fake, employer giả mạo, application spam      |
| **Skill Matching**        | `ISkillMatcher`         | Match skills giữa CV và Job requirements                    |

**Tích hợp:** 
- Định nghĩa Interface trong `modules/ai/domain/`
- MVP: Stub/NoOp implementation trong `modules/ai/infrastructure/`

--- 

# 8. High-level Domain Model

## 8.1 Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--|| STUDENT_PROFILE : "has"
    USER ||--|| EMPLOYER_PROFILE : "has"
    USER ||--o{ REFRESH_TOKEN : "owns"
    USER ||--o{ AUDIT_LOG : "acts"
    
    EMPLOYER_PROFILE ||--o{ JOB_POSTING : "posts"
    JOB_POSTING ||--o{ APPLICATION : "receives"
    STUDENT_PROFILE ||--o{ APPLICATION : "submits"
    STUDENT_PROFILE ||--o{ CV : "uploads"
    
    APPLICATION }|--|| NOTIFICATION : "triggers"
    JOB_POSTING }|--|| NOTIFICATION : "triggers"
    USER }|--|| NOTIFICATION : "receives"
    
    USER {
        uuid id PK
        string email UK
        string passwordHash
        enum role "Student|Employer|Admin"
        boolean isActive
        boolean emailVerified
        int failedLoginAttempts
        datetime lockedUntil
        datetime createdAt
        datetime updatedAt
    }
    
    STUDENT_PROFILE {
        uuid userId PK,FK
        string fullName
        string phone
        string address
        string university
        string major
        datetime graduationYear
        uuid defaultCvId FK
        datetime createdAt
        datetime updatedAt
    }
    
    EMPLOYER_PROFILE {
        uuid userId PK,FK
        string companyName
        string companyDescription
        string website
        string address
        string logoUrl
        boolean verified
        datetime verifiedAt
        uuid verifiedBy FK
        datetime createdAt
        datetime updatedAt
    }
    
    JOB_POSTING {
        uuid id PK
        uuid employerId FK
        string title
        text description
        text requirements
        string location
        enum jobType "FullTime|PartTime|Internship|Contract"
        json salaryRange
        enum state "Draft|Pending|Approved|Rejected|Closed|Expired"
        datetime expiresAt
        datetime approvedAt
        uuid approvedBy FK
        string rejectionReason
        datetime createdAt
        datetime updatedAt
    }
    
    APPLICATION {
        uuid id PK
        uuid jobId FK
        uuid studentId FK
        uuid cvId FK
        text coverLetter
        enum state "Applied|UnderReview|Accepted|Rejected|Withdrawn"
        datetime appliedAt
        datetime reviewedAt
        uuid reviewedBy FK
        string rejectionReason
        datetime createdAt
        datetime updatedAt
    }
    
    CV {
        uuid id PK
        uuid studentId FK
        string fileName
        string filePath
        int fileSize
        string mimeType
        boolean isDefault
        datetime uploadedAt
    }
    
    REFRESH_TOKEN {
        uuid id PK
        uuid userId FK
        string tokenHash
        datetime expiresAt
        boolean revoked
        datetime createdAt
    }
    
    AUDIT_LOG {
        uuid id PK
        uuid actorId FK
        string action
        string entity
        uuid entityId
        json metadata
        datetime timestamp
    }
    
    NOTIFICATION {
        uuid id PK
        uuid userId FK
        string type
        string title
        string message
        json data
        boolean isRead

```

## 8.2 Entity Descriptions

| Entity              | Description                                                                   | Key Relationships                                                                         |
| ------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **User**            | Core identity, authentication & authorization                                 | 1-1 StudentProfile, 1-1 EmployerProfile, 1-* RefreshToken, 1-* AuditLog, 1-* Notification |
| **StudentProfile**  | Extended profile for students, includes personal info and CV references       | 1-1 User, 1-* CV, 1-* Application                                                         |
| **EmployerProfile** | Extended profile for employers, includes company info and verification status | 1-1 User, 1-* JobPosting                                                                  |
| **JobPosting**      | Job advertisement created by an employer                                      | *-1 EmployerProfile, 1-* Application, 1-* Notification                                    |
| **Application**     | Student’s application to a job posting, references a CV                       | *-1 JobPosting, *-1 StudentProfile, *-1 CV, 1-* Notification                              |
| **CV**              | Uploaded resume file metadata                                                 | *-1 StudentProfile, 1-1 Application (when used)                                           |
| **RefreshToken**    | JWT refresh token for session management                                      | *-1 User                                                                                  |
| **AuditLog**        | Immutable security/compliance log entry                                       | *-1 User (actor)                                                                          |
| **Notification**    | In-app or email notification sent to a user                                   | *-1 User (recipient)                                                                      |

# 9. Core Business Flow

## 9.1 Đăng ký tài khoản (Registration)

```mermaid
flowchart TD
    A["Client: POST /auth/register"] --> B{"Validate Input"}
    B -->|Invalid| C["Return 400 ValidationError"]
    B -->|Valid| D{"Check Email Exists"}
    D -->|Exists| E["Return 409 Conflict"]
    D -->|Not Exists| F["Hash Password (BCrypt)"]
    F --> G["Create User (isActive=false, emailVerified=false)"]
    G --> H["Generate Verification Token"]
    H --> I["Save User & Token"]
    I --> J["Send Verification Email"]
    J --> K["Return 201 Created"]
```

## 9.2 Đăng nhập (Login)

```mermaid
flowchart TD
    A["Client: POST /auth/login"] --> B{"Validate Input"}
    B -->|Invalid| C["Return 400"]
    B -->|Valid| D["Find User by Email"]
    D -->|Not Found| E["Return 401"]
    D -->|Found| F{"Check isActive & emailVerified"}
    F -->|No| G["Return 403 Forbidden"]
    F -->|Yes| H["Verify Password (BCrypt)"]
    H -->|Fail| I["Increment Failed Counter"]
    I -->|">=5"| J["Lock Account 15min"]
    I -->|"<5"| K["Return 401"]
    H -->|Success| L["Generate Access Token (15 min)"]
    L --> M["Generate Refresh Token (7 days)"]
    M --> N["Save Refresh Token Hash"]
    N --> O["Log Audit: UserLoggedIn"]
    O --> P["Return 200 + Tokens"]
```

## 9.3 Đăng tin tuyển dụng (Job Posting Creation)

```mermaid
flowchart TD
    A["Employer: POST /jobs"] --> B{"Auth + RBAC Employer"}
    B -->|Fail| C["Return 401/403"]
    B -->|Pass| D{"Check Employer Verified"}
    D -->|No| E["Return 403 EmployerNotVerified"]
    D -->|Yes| F["Validate Input"]
    F -->|Invalid| G["Return 400"]
    F -->|Valid| H["Create JobPosting (state=Draft)"]
    H --> I["Save JobPosting"]
    I --> J["Return 201 Created"]

    J --> K["Employer: POST /jobs/{id}/submit"]
    K --> L{"Validate Owner"}
    L -->|No| M["Return 403 Forbidden"]
    L -->|Yes| N["Transition Draft -> Pending"]
    N --> O["Save JobPosting (state=Pending)"]
    O --> P["Notify Admin for approval"]
    P --> Q["Return 202 Accepted (Pending Review)"]
```

## 9.4 Duyệt doanh nghiệp (Employer Verification)

```mermaid
flowchart TD
    A["Admin: GET /admin/employers/pending"] --> B["Select employer"]
    B --> C{"Approve?"}
    C -->|Yes| D["Set verified=true, verifiedAt=now"]
    D --> E["Send approval email"]
    E --> F["Audit Log: EmployerVerified"]
    C -->|No| G["Set verified=false, add rejectionReason"]
    G --> H["Send rejection email"]
    H --> I["Audit Log: EmployerRejected"]
```

## 9.5 Duyệt tin tuyển dụng (Job Approval)

```mermaid
flowchart TD
    A["Admin: GET /admin/jobs/pending"] --> B["Select job"]
    B --> C{"Approve?"}
    C -->|Yes| D["Set state=Approved, approvedAt=now, approvedBy=adminId"]
    D --> E["Send approval email to employer"]
    E --> F["Job becomes searchable for students"]
    F --> G["Audit Log: JobApproved"]
    C -->|No| H["Set state=Rejected, rejectionReason"]
    H --> I["Send rejection email with feedback"]
    I --> J["Audit Log: JobRejected"]
```

## 9.6 Ứng tuyển (Application Submission)

```mermaid
flowchart TD
    A["Student: POST /applications"] --> B{"Validate CV ownership"}
    B -->|Invalid| C["Return 400"]
    B -->|Valid| D{"Check duplicate application"}
    D -->|Exists| E["Return 409 Conflict"]
    D -->|Not exists| F["Create Application (state=Applied)"]
    F --> G["Save Application"]
    G --> H["Notify Employer (in-app & email)"]
    H --> I["Audit Log: ApplicationSubmitted"]
    I --> J["Return 201 Created"]
```

## 9.7 Cập nhật trạng thái ứng tuyển (Application Status Update)

```mermaid
flowchart TD
    A["Employer: PATCH /applications/{id}"] --> B{"Validate ownership"}
    B -->|No| C["Return 403"]
    B -->|Yes| D{"Validate state transition"}
    D -->|Invalid| E["Return 400"]
    D -->|Valid| F["Update Application state"]
    F --> G["Notify Student"]
    G --> H["Audit Log: ApplicationStatusChanged"]
    H --> I["Return 200 OK"]
```

## 9.8 Quản trị hệ thống (Admin Operations)

```mermaid
flowchart TD
    A["Admin logs in"] --> B["Dashboard"]
    B --> C{"Select action"}
    C -->|Verify Employer| D["Employer verification flow (see 9.4)"]
    C -->|Approve Job| E["Job approval flow (see 9.5)"]
    C -->|Manage Users| F["User CRUD + lock/unlock"]
    C -->|View Audit Logs| G["Audit log query & export"]
    C -->|Export Reports| H["Generate CSV/Excel reports"]
```


# 10. API Architecture

## 10.1 RESTful Design Principles

| Principle               | Implementation                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __Resource-based URLs__ | `/api/v1/jobs`, `/api/v1/applications/{id}`                                                                                                                   |
| __HTTP Methods__        | GET (read), POST (create), PUT/PATCH (update), DELETE (remove)                                                                                                |
| __Status Codes__        | 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests, 500 Internal Error |
| __Versioning__          | URL path versioning (`/api/v1/`)                                                                                                                              |
| __Naming__              | Plural nouns, kebab-case (`/job-postings`, `/application-statuses`)                                                                                           |

## 10.2 API Versioning

- __Strategy__: URL path versioning (`/api/v1/…`).
- __Current version__: `v1`.
- __Deprecation policy__: Minimum 6 months notice, `Sunset` header in responses.

## 10.3 Resource Naming Conventions

| Resource          | Endpoint pattern                           |
| ----------------- | ------------------------------------------ |
| Collection        | `GET /api/v1/jobs`                         |
| Single item       | `GET /api/v1/jobs/{id}`                    |
| Sub-resource      | `GET /api/v1/jobs/{id}/applications`       |
| Action (non-CRUD) | `POST /api/v1/jobs/{id}/submit-for-review` |

## 10.4 HTTP Method Mapping

| Operation      | Method | Idempotent |
| -------------- | ------ | ---------- |
| List / Search  | GET    | Yes        |
| Retrieve       | GET    | Yes        |
| Create         | POST   | No         |
| Full update    | PUT    | Yes        |
| Partial update | PATCH  | No         |
| Delete         | DELETE | Yes        |
| Custom action  | POST   | No         |

## 10.5 Response Format

### Success

```json
{
  "success": true,
  "data": { /* payload */ },
  "meta": {
    "timestamp": "2026-07-29T10:00:00Z",
    "requestId": "c1a2b3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### Paginated

```json
{
  "success": true,
  "data": [ /* items */ ],
  "meta": {
    "timestamp": "2026-07-29T10:00:00Z",
    "requestId": "c1a2b3d4-e5f6-7890-abcd-ef1234567890",
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 124,
      "totalPages": 13
    }
  }
}
```

## 10.6 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "B001",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2026-07-29T10:00:00Z",
    "requestId": "c1a2b3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### Standard Error Codes (from spec)

| Code | Meaning                                      | HTTP |
| ---- | -------------------------------------------- | ---- |
| B001 | Validation failed                            | 400  |
| B002 | Authentication required                      | 401  |
| B003 | Forbidden – insufficient role                | 403  |
| B004 | Resource not found                           | 404  |
| B005 | Conflict – duplicate or illegal state change | 409  |
| B006 | Too many requests (rate limit)               | 429  |
| B999 | Unexpected server error                      | 500  |


# 11. Security Architecture

## 11.1 Authentication (JWT)

| Token             | Expiry | Storage                 | Usage                                 |
| ----------------- | ------ | ----------------------- | ------------------------------------- |
| __Access Token__  | 15 min | In-memory (React state) | Authorization header `Bearer <token>` |
| __Refresh Token__ | 7 days | HttpOnly Secure cookie  | `/auth/refresh` endpoint              |

- __Claims__: `sub`, `email`, `role`, `iat`, `exp`, `jti`.
- __Rotation__: Refresh token is revoked on use; new pair issued.
- __Revocation list__: Stored in Redis (or DB) for immediate invalidation.

## 11.2 Password Security

- __Algorithm__: BCrypt, cost factor 12.
- __Policy__: 8-32 chars, ≥1 upper, ≥1 lower, ≥1 digit, ≥1 special.
- __Breach check__ (optional): Integrate with HaveIBeenPwned API.

## 11.3 Authorization (RBAC)

| Role              | Permissions                                           |
| ----------------- | ----------------------------------------------------- |
| __Student__       | Own profile, CVs, applications, job search            |
| __Employer__      | Company profile, own job postings, own applicants     |
| __Administrator__ | Full system access, user management, approvals, audit |

Implemented via:

- `AuthGuard` (JWT validation)
- `RolesGuard` (metadata-based role check)
- Resource-level checks inside Use Cases.

## 11.4 Input Validation & Sanitization

- __Zod schemas__ for all request DTOs (pipe-level validation).
- __Prisma__ parameterised queries → SQL injection protection.
- __Helmet__ security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- __File upload__: MIME type `application/pdf`, size ≤ 5 MB, filename sanitisation.

## 11.5 Rate Limiting

| Endpoint group          | Limit                |
| ----------------------- | -------------------- |
| Auth (login / register) | 5 req/min per IP     |
| Auth (refresh)          | 30 req/min per user  |
| Public API (search)     | 30 req/min per user  |
| Authenticated API       | 100 req/min per user |
| File upload             | 10 req/min per user  |

Implemented with `express-rate-limit` + Redis store for distributed rate limiting.
path: docs/architecture.md

## 11.6 CORS & Security Headers

- __CORS__: Whitelisted origins (production domains), `credentials: true`, allowed methods `GET,POST,PUT,PATCH,DELETE,OPTIONS`.
- __Helmet__: Enforces CSP (`default-src 'self'`), HSTS (max-age 31536000), disables `X-Powered-By`.

## 11.7 Audit Logging

- __Logged actions__: Authentication events, CRUD on core entities, role changes, state transitions, admin approvals/rejections.
- __Structure__ (see `AuditLog` entity). Immutable, indexed on `actorId`, `action`, `timestamp`.
- __Storage__: Separate MySQL table, write-only via `AuditLogRepository`.


# 12. File Storage Architecture

## 12.1 CV & Avatar Upload

- __Path pattern__: `uploads/cv/{studentId}/{uuid}.pdf` and `uploads/avatar/{userId}/{uuid}.png`.
- __Validation__: MIME type (`application/pdf` for CV, `image/png|jpeg` for avatar), max size 5 MB (CV) / 2 MB (avatar).
- __Naming__: UUID filename to avoid collisions; original filename stored in metadata.
- __Access control__: Files served through authenticated endpoint; signed URLs for temporary public access if needed.

## 12.2 Temporary Storage & Cleanup

- Files are stored on the local filesystem in `uploads/` (MVP).
- A nightly cron job (`FileCleanupJob`) removes orphaned files (no DB reference) older than 30 days.
- Configuration allows swapping to S3/MinIO by providing `S3FileStorage` implementation of `IFileStorage`.

## 12.3 Security Considerations

- Directory traversal protection (`path.normalize` + whitelist).
- Virus scanning placeholder (e.g., ClamAV) can be added in future.
- Files are never executable; served with `Content-Disposition: attachment`.


# 13. Logging & Monitoring

## 13.1 Application Logging (Pino)

- __Levels__: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
- __Structure__: JSON lines, includes `timestamp`, `level`, `requestId`, `userId` (if authenticated), `message`, `context`.
- __Correlation ID__: Generated per request (`X-Request-ID`) and propagated to all logs.

## 13.2 Audit Logging

- Immutable entries (see `AuditLog` entity).
- Separate table, indexed for fast queries.
- Exportable via admin API (`/admin/audit/export`).

## 13.3 Access & Error Logs

- __Access log__: HTTP method, URL, status, response time, requestId.
- __Error log__: Stack trace, error code, user context (if any).
## 14. Error Handling

### Global Exception Layer

- Express error-handling middleware captures all thrown errors.
- Maps domain exceptions to HTTP status codes using a lookup table.

### Exception Types

| Type                        | Description                       | HTTP |
| --------------------------- | --------------------------------- | ---- |
| __ValidationException__     | Input fails Zod schema            | 400  |
| __AuthenticationException__ | Missing/invalid JWT               | 401  |
| __AuthorizationException__  | Insufficient role                 | 403  |
| __NotFoundException__       | Entity not found                  | 404  |
| __ConflictException__       | Duplicate or illegal state change | 409  |
| __RateLimitException__      | Exceeded rate limit               | 429  |
| __InternalServerError__     | Unexpected error                  | 500  |

### Response Format

Same as the error response format defined in __10.6__ (code, message, details).

# 15. AI Extension Architecture

## 15.1 Extension Points

| Module                    | Interface                                                           | Trigger                             |
| ------------------------- | ------------------------------------------------------------------- | ----------------------------------- |
| **Resume Analysis**       | `IResumeAnalyzer.analyze(cv: CV): ResumeInsights`                   | On CV upload or application submit  |
| **Trust Score Engine**    | `ITrustScoreEngine.evaluate(userId: UUID): TrustScore`              | Periodic batch job or on-demand     |
| **Recommendation Engine** | `IRecommendationEngine.recommend(userId: UUID): RecommendationList` | After successful login or on demand |
| **Fraud Detection**       | `IFraudDetector.checkJob(job: JobPosting): FraudResult`             | When a job is created/updated       |
| **Skill Matching**        | `ISkillMatcher.match(cv: CV, job: JobPosting): MatchScore`          | During job search or application    |

### Integration Strategy
- **Interface-first**: All AI modules expose a TypeScript interface in `modules/ai/domain/`.
- **Adapter Layer**: `modules/ai/infrastructure/` provides concrete adapters:
  - **StubAdapter** – No-op implementation for MVP (returns empty results, logs call).
  - **HttpAdapter** – Calls external AI micro-service via REST/GraphQL.
  - **GrpcAdapter** – Calls external AI micro-service via gRPC (future).
- **Event-driven hooks**: Domain events such as `CVUploaded`, `ApplicationSubmitted`, `JobPostingCreated` are published to an internal event bus. AI adapters subscribe and process asynchronously, storing results in dedicated tables (`ResumeInsights`, `TrustScore`, `Recommendations`).

### Data Persistence (Future)
- Separate tables for AI results, linked by foreign keys to the originating entity.
- TTL (time-to-live) columns to allow periodic cleanup of stale AI data.

# 16. Deployment Architecture

## 16.1 Deployment Diagram

```mermaid
graph TB
    subgraph Client["Client Devices"]
        Browser["Browser (React + Vite SPA)"]
    end

    subgraph Cloud["Cloud Infrastructure"]
        LB["Load Balancer / Reverse Proxy (NGINX)"]
        API["Backend API (Node.js/Express)"]
        DB["Database (MySQL 8.0)"]
        Cache["In-Memory Cache & Rate Limiting (Redis)"]
        Storage["Object Storage (AWS S3 / Local Storage)"]
        AI["AI Services Adapter (Future Microservices)"]
        Monitoring["Monitoring Suite (Prometheus + Grafana)"]
    end

    Browser --> LB
    LB --> API
    API --> DB
    API --> Cache
    API --> Storage
    API --> AI
    API --> Monitoring
```

## 16.2 Infrastructure Components

- **Frontend**: React 18 + Vite (SPA) compile thành các tệp tin tĩnh (HTML, JS, CSS, Assets). Các tệp tĩnh này được lưu trữ và phân phối thông qua CDN (Cloudflare Pages, Vercel) hoặc Web Server (NGINX) được cấu hình nén Gzip/Brotli tối ưu dung lượng và bật HTTP/2 để tăng tốc độ tải trang cực nhanh.
- **Backend**: Node.js v20 (LTS) chạy framework Express.js, đóng gói thành Docker Container độc lập. Triển khai theo cụm VM (AWS EC2 / GCP Compute) sử dụng PM2 Cluster Mode để chạy multi-core tận dụng tối đa tài nguyên phần cứng, hoặc phân phối tự động thông qua Kubernetes (K8s).
- **Database**: Hệ quản trị cơ sở dữ liệu MySQL 8.0, thiết kế cấu hình Master-Replica để đảm bảo tính sẵn sàng cao (High Availability). Kết nối qua connection pooling tối ưu hóa bởi Prisma ORM, tự động backup định kỳ hàng ngày vào Cloud Storage bảo mật.
- **File Storage**: MVP sử dụng hệ thống tệp cục bộ (Local Filesystem) được gắn kết qua Docker Volumes lưu trữ tại đường dẫn `/uploads/cv`. Kiến trúc sử dụng FileStorageAdapter giúp hệ thống sẵn sàng chuyển đổi cấu hình sang AWS S3 hoặc MinIO Object Storage trong các giai đoạn phát triển tiếp theo mà không cần chỉnh sửa Core Logic của ứng dụng.
- **Reverse Proxy**: Sử dụng NGINX hoặc Cloudflare đảm nhận nhiệm vụ SSL/TLS Termination, bảo mật Header, chống tấn công DDoS cơ bản, Caching tài nguyên tĩnh, xử lý CORS pre-flight, cấu hình Rate Limiting và định tuyến (Routing) request thông minh: `/api/v1` chuyển tiếp đến Backend API, các request khác phục vụ Frontend static files.

## 16.3 Deployment Stages

| Stage           | Components                                       | Description                                                                                             |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Development** | Docker Compose (frontend, backend, MySQL, Redis) | Hot-reload, local DB, mock AI stubs, file storage local                                                 |
| **Staging**     | Kubernetes / VM Deployment                       | Phân tách môi trường riêng biệt, CI pipeline tự động deploy, kiểm thử integration test tự động          |
| **Production**  | Kubernetes Cluster / AWS EC2 clusters            | Tự động mở rộng (Autoscaling), rolling updates, SSL/TLS Termination, bảo mật bí mật (secrets) qua Vault |

## 16.4 Environment Variables

| Variable                 | Description                                | Example Value                              |
| ------------------------ | ------------------------------------------ | ------------------------------------------ |
| `NODE_ENV`               | Môi trường chạy ứng dụng                   | `production` / `development` / `test`      |
| `PORT`                   | Cổng HTTP lắng nghe                        | `3000`                                     |
| `DATABASE_URL`           | Chuỗi kết nối cơ sở dữ liệu MySQL (Prisma) | `mysql://user:pass@host:3306/trusthire_db` |
| `JWT_SECRET`             | Khóa bí mật ký mã token JWT                | `super-secret-key-change-in-production`    |
| `JWT_ACCESS_EXPIRES_IN`  | Thời gian hết hạn của Access Token         | `15m`                                      |
| `JWT_REFRESH_EXPIRES_IN` | Thời gian hết hạn của Refresh Token        | `7d`                                       |
| `FILE_STORAGE`           | Cấu hình loại hình lưu trữ file            | `local` / `s3`                             |
| `FILE_STORAGE_DEST`      | Thư mục lưu trữ file cục bộ                | `./uploads`                                |
| `REDIS_URL`              | Chuỗi kết nối Redis Cache                  | `redis://localhost:6379`                   |
| `SMTP_HOST`              | Địa chỉ mail server                        | `smtp.gmail.com`                           |
| `SMTP_PORT`              | Cổng kết nối SMTP                          | `587`                                      |
| `SMTP_USER`              | Tài khoản gửi email                        | `recruitment@trusthire.vn`                 |
| `SMTP_PASS`              | Mật khẩu tài khoản email                   | `email-app-password`                       |

## 16.5 CI/CD Pipeline (GitHub Actions)

1. **Lint & Test**: Chạy `npm run lint` và `npm test` độc lập trên cả Frontend và Backend để đảm bảo chất lượng code.
2. **Build Docker images**: Tự động build và đóng gói các Docker image mới nhất cho Frontend và Backend.
3. **Push to registry**: Đẩy Docker images lên GitHub Container Registry (GHCR) hoặc AWS ECR.
4. **Deploy**: Tự động kích hoạt deploy lên Staging; yêu cầu phê duyệt thủ công (Manual Approval) trước khi deploy lên Production.

# 17. Architectural Constraints

- **Bắt buộc sử dụng Clean Architecture**: Cấu trúc thư mục phân tách tuyệt đối 4 tầng độc lập (`Presentation`, `Application`, `Domain`, `Infrastructure`). Quy tắc dependency duy nhất: Các tầng ngoài chỉ phụ thuộc vào tầng trong, tuyệt đối không có chiều ngược lại.
- **Không truy cập Database trực tiếp từ Controller**: Controller (Presentation Layer) chỉ nhận request, thực hiện chuyển đổi kiểu dữ liệu (Data mapping), gọi thực thi Use Case tương ứng và trả về Response. Mọi thao tác persistence dữ liệu bắt buộc thông qua Use Case và Repository.
- **Repository Interface thuộc Domain Layer**: Interface định nghĩa các giao thức lưu trữ dữ liệu thuộc về Domain Layer (chứa nghiệp vụ cốt lõi), trong khi implementation thực tế (Prisma, MySQL) nằm tại Infrastructure Layer để đạt sự lỏng lẻo (Loose Coupling).
- **Dependency Injection bắt buộc**: Toàn bộ lớp Controller, Use Case, Service và Repository phải sử dụng DI (hoặc Manual Dependency Injection trong app.module) để truyền dependencies qua constructor, không tự khởi tạo thực thể (new Instance) bên trong lớp để dễ dàng viết Unit Test với Mocking.
- **RESTful API**: API thiết kế tuân thủ nghiêm ngặt nguyên tắc RESTful (Sử dụng danh từ số nhiều, phân cấp quan hệ tài nguyên, HTTP Methods GET, POST, PUT, PATCH, DELETE rõ ràng, trạng thái HTTP Status Code chuẩn OWASP, JSON Response Format nhất quán).
- **Không sử dụng Business Logic trong Controller**: Controller không chứa bất kỳ logic nghiệp vụ nào, chỉ chịu trách nhiệm kiểm tra định dạng dữ liệu đầu vào (Validation qua Zod DTO) và điều phối kết quả trả về.
- **MVP không phụ thuộc AI**: Phiên bản tối thiểu (MVP) vận hành hoàn toàn độc lập và ổn định khi tắt hoặc không tích hợp mô-đun AI.
- **AI chỉ giao tiếp qua Interface hoặc Adapter**: Các mô-đun AI trong tương lai được kết nối dưới dạng Adapter triển khai các Interface được định nghĩa sẵn trong Domain Layer của Module AI. Không sửa đổi Domain Core của các module nghiệp vụ cơ bản (Student, Employer, Job) khi tích hợp AI.
- **Mọi module phải độc lập và dễ mở rộng**: Tổ chức mã nguồn dạng Modular Monolith, các module nghiệp vụ tự đóng gói trong thư mục riêng biệt (`modules/auth`, `modules/student`...), tương tác chéo thông qua Use Case Interfaces hoặc các sự kiện bất đồng bộ (Domain Events / Event Bus).

# 18. Architectural Decisions

Tổng hợp các quyết định kiến trúc quan trọng cho dự án TrustHire:

| Quyết định (Decision)   | Lý do lựa chọn (Reason)                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React + Vite**        | Tối ưu thời gian build và Hot Module Replacement (HMR), mang lại trải nghiệm phát triển mượt mà nhất cho ứng dụng Single Page Application.                                                        |
| **Prisma ORM**          | Cung cấp khả năng Type-safe tối ưu cho TypeScript, tự động tạo migrations chính xác, giảm thiểu rủi ro lỗi truy vấn cơ sở dữ liệu.                                                                |
| **Clean Architecture**  | Giúp tách biệt hoàn toàn Logic nghiệp vụ cốt lõi khỏi Database, Framework và các tác nhân bên ngoài, tạo điều kiện thuận lợi cho việc viết Unit Tests độc lập và nâng cao tính bảo trì.           |
| **JWT + Refresh Token** | Đảm bảo tính Stateless cho hệ thống xác thực, tối ưu hiệu năng scale ngang đồng thời đảm bảo bảo mật qua cơ chế thu hồi token (token revocation) linh hoạt.                                       |
| **Repository Pattern**  | Tạo lớp trừu tượng (Abstraction Layer) ngăn chặn sự phụ thuộc trực tiếp của Business Logic vào Prisma ORM hay MySQL, cho phép dễ dàng chuyển đổi hoặc mock khi viết Test.                         |
| **Zod**                 | Thực hiện schema validation mạnh mẽ ở runtime cho cả Request DTOs, tự động suy luận kiểu dữ liệu (Type Inference) đồng bộ hoàn hảo với TypeScript.                                                |
| **Pino Logger**         | Thư viện Logging có hiệu năng cực cao, ghi nhận log dạng cấu trúc JSON, giúp tích hợp tốt với các công cụ phân tích log tập trung.                                                                |
| **Modular Monolith**    | Phù hợp với mô hình MVP của TrustHire, giảm bớt sự phức tạp của hạ tầng Microservices ban đầu nhưng vẫn đảm bảo tính module độc lập để dễ dàng phân tách dịch vụ trong tương lai khi tích hợp AI. |

---

# 19. Change Log

| Date       | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| 2026-07-20 | Khởi tạo phiên bản 1.1                                         |
| 2026-08-03 | Cập nhật trạng thái triển khai sau đợt sửa lỗi TSK-FIX-601→610 |
