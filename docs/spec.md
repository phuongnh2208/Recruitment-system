# 1. Overview

## 1.1 Project Summary
TrustHire is a **Student Recruitment Support System** that connects students, employers and administrators. It provides online job posting, CV management, application tracking and prepares extension points for AI-driven features.

## 1.2 Purpose of this Specification
This AI-friendly specification is the source for the next SDD steps (Design → Code). It describes **what** the system must do, not **how** it is implemented, enabling automatic generation of Clean-Architecture layers (Controller → Use-Case → Repository → Infrastructure).

---

# 2. Actors

| Role | Description |
|------|-------------|
| Student | Searches jobs, uploads CVs, applies, tracks status |
| Employer | Publishes jobs, reviews applicants, updates status |
| Administrator | Verifies employers, approves jobs, manages users, audits |
| University | Monitors recruitment outcomes (read-only) |
| Development Team | Builds and maintains the system (technical stakeholder) |

---

# 3. Domain Model

## 3.1 Entities
* **User** – `id`, `email`, `passwordHash`, `role`, `isActive`, `createdAt`
* **StudentProfile** – `userId`, `fullName`, `phone`, `address`, `cvList[]`
* **EmployerProfile** – `userId`, `companyName`, `companyInfo`, `verified`
* **JobPosting** – `id`, `employerId`, `title`, `description`, `requirements`, `state`, `createdAt`, `expiresAt`
* **Application** – `id`, `jobId`, `studentId`, `coverLetter`, `state`, `appliedAt`
* **AuditLog** – `id`, `actorId`, `action`, `entity`, `entityId`, `timestamp`

## 3.2 Relationships
* User 1-1 StudentProfile (role = Student)
* User 1-1 EmployerProfile (role = Employer)
* EmployerProfile 1-* JobPosting
* JobPosting 1-* Application
* StudentProfile 1-* Application

---

# 4. Functional Requirements (AI-Specification Format)

## 4.1 Authentication

### FR-AUTH-01 Register Account
* **Description**: A new user creates an account with email and password.
* **Preconditions**: Email not already registered; password meets policy.
* **Main Flow**:
  1. Submit registration request.
  2. System validates input, hashes password, stores User with `isActive = false`.
  3. Send verification email with token.
* **Alternative Flow**:
  - *A1*: Email already exists → return 409 Conflict.
  - *A2*: Password fails policy → return 400 Bad Request.
* **Postconditions**: User record persisted; verification email dispatched.
* **Validation Rules**: Password 8-32 chars, upper, lower, digit, special; email format RFC-5322.
* **Acceptance Criteria**: Registration succeeds with 201 Created; duplicate email yields 409; invalid password yields 400.

### FR-AUTH-02 Login
* **Ref**: BR-02
* **Description**: Authenticated user obtains JWT access & refresh tokens.
* **Preconditions**: User exists, `isActive = true`, email verified.
* **Main Flow**:
  1. Submit email & password.
  2. System verifies credentials, issues tokens.
* **Alternative Flow**:
  - *A1*: Wrong password → 401 Unauthorized, increment failed-login counter.
  - *A2*: Account locked after 5 attempts → 403 Forbidden.
* **Postconditions**: Tokens returned; login audit logged.
* **Validation Rules**: Email format, password non-empty.
* **Acceptance Criteria**: Valid credentials → 200 with tokens; invalid → appropriate error codes.

### FR-AUTH-03 Logout
* **Description**: Invalidate refresh token.
* **Preconditions**: Valid refresh token presented.
* **Main Flow**: Mark token as revoked in DB, return 204 No Content.
* **Postconditions**: Token cannot be used to obtain new access token.

### FR-AUTH-04 Change Password
* **Description**: Authenticated user changes password.
* **Preconditions**: User authenticated, old password correct.
* **Main Flow**: Verify old password, validate new password, update hash, invalidate existing refresh tokens.
* **Postconditions**: Password updated, all sessions revoked.

---

## 4.2 Student Module

### FR-ST-01 Manage Personal Profile
* **Ref**: BR-06
* **Description**: Student creates/updates personal information.
* **Preconditions**: Authenticated as Student.
* **Main Flow**: Submit profile data → system upserts StudentProfile.
* **Alternative Flow**: Missing required fields → 400.
* **Postconditions**: Profile persisted.
* **Validation Rules**: Required fields – fullName, phone.
* **Acceptance Criteria**: 200 OK with updated profile.

### FR-ST-02 Upload CV
* **Description**: Student uploads a PDF CV (max 5 MB).
* **Preconditions**: Authenticated Student, file meets type/size.
* **Main Flow**: Receive multipart file → store in `uploads/cv/{studentId}/` → store metadata.
* **Alternative Flow**: Invalid file → 400.
* **Postconditions**: CV metadata added to `cvList`.
* **Validation Rules**: MIME type `application/pdf`, size ≤ 5 MB.
* **Acceptance Criteria**: 201 Created, CV appears in profile list.

### FR-ST-03 Manage Multiple CVs
* **Description**: Student can upload, list, set default, and delete multiple CV files.
* **Preconditions**: Authenticated Student; each CV complies with validation rules.
* **Main Flow**:
  1. Student selects "Add CV" → uploads PDF.
  2. System stores file, updates `cvList`.
  3. Student can mark one CV as default.
  4. Student can delete any CV.
* **Alternative Flow**:
  - *A1*: Exceeds storage quota → 409 Conflict.
  - *A2*: Invalid file → 400 Bad Request.
* **Postconditions**: `cvList` reflects current CVs; default CV flag updated.
* **Validation Rules**: Same as FR-ST-02 (PDF, ≤ 5 MB).
* **Acceptance Criteria**: Student can have ≥ 1 and ≤ 10 CVs; default CV is correctly returned in profile.

### FR-ST-04 Set Default CV
* **Description**: Student selects one of their uploaded CVs as the default for applications.
* **Preconditions**: At least one CV exists; authenticated Student.
* **Main Flow**: Student chooses a CV → system updates `defaultCvId` in profile.
* **Alternative Flow**: Selected CV does not belong to student → 403 Forbidden.
* **Postconditions**: Default CV is stored and used for future applications.
* **Acceptance Criteria**: API returns 200 and subsequent applications use the selected CV automatically.

### FR-ST-05 Search Jobs
* **Ref**: BR-04
* **Description**: Student searches job postings with filters.
* **Preconditions**: Authenticated Student.
* **Main Flow**: Provide query parameters (keyword, location, pagination) → system returns paginated list of `JobPosting` in state `Approved`.
* **Alternative Flow**: No results → empty list with 200.
* **Postconditions**: No state change.
* **Validation Rules**: `pageSize` allowed values 10,20,50.
* **Acceptance Criteria**: Response time < 2 s for typical queries.

### FR-ST-06 Filter Jobs
* **Description**: Student refines job search results using filters (location, salary range, job type).
* **Preconditions**: Authenticated Student.
* **Main Flow**: Provide filter parameters → system returns filtered `JobPosting` list.
* **Alternative Flow**: Invalid filter values → 400 Bad Request.
* **Postconditions**: No state change.
* **Acceptance Criteria**: Filtered results returned within 2 s; invalid filters produce clear error messages.

### FR-ST-07 View Job Details
* **Description**: Student views full details of a selected job posting.
* **Preconditions**: Authenticated Student; job state = `Approved`.
* **Main Flow**: GET `/jobs/{id}` → returns all job fields.
* **Postconditions**: Read-only.
* **Acceptance Criteria**: All fields are present; response time < 1 s.

### FR-ST-08 Apply for Job
* **Ref**: BR-01, BR-02
* **Description**: Student submits an application to an approved job.
* **Preconditions**: Student has at least one verified CV; job state = `Approved`.
* **Main Flow**:
  1. Select CV, optional cover letter.
  2. System checks duplicate application.
  3. Creates `Application` with state `Applied`.
* **Alternative Flow**: Duplicate application → 409 Conflict.
* **Postconditions**: Application persisted; employer notified.
* **Validation Rules**: CV must belong to student.
* **Acceptance Criteria**: 201 Created, email notification sent.

### FR-ST-09 Track Application Status
* **Description**: Student views current state of each application.
* **Preconditions**: Authenticated Student.
* **Main Flow**: Query `/applications` → returns list with `state` field.
* **Postconditions**: Read-only operation.
* **Acceptance Criteria**: Returns correct status for each application; includes timestamps; response < 500 ms.

### FR-ST-10 Cancel Application
* **Description**: Student withdraws a previously submitted application.
* **Preconditions**: Application state = `Applied` or `Under Review`.
* **Main Flow**: Student issues cancel request → system sets application state to `Withdrawn`.
* **Alternative Flow**: Application already `Accepted`/`Rejected` → 409 Conflict.
* **Postconditions**: Application marked `Withdrawn`; employer notified.
* **Acceptance Criteria**: Withdrawal succeeds with 200 OK; prohibited states return 409.

### FR-ST-11 Manage Application History
* **Description**: Student can view a chronological list of all past applications with statuses.
* **Preconditions**: Authenticated Student.
* **Main Flow**: GET `/applications/history` → returns ordered list.
* **Acceptance Criteria**: History includes at least last 12 months; pagination works.

---

## 4.3 Employer Module

### FR-EM-01 Register Employer Account
* **Description**: Mirrors FR-AUTH-01 but role = Employer and requires company information.

### FR-EM-02 Manage Employer Profile
* **Description**: Employer can create and update company information.
* **Preconditions**: Authenticated Employer.
* **Main Flow**: Submit profile data → system upserts `EmployerProfile`.
* **Alternative Flow**: Missing required fields → 400.
* **Postconditions**: Profile persisted.
* **Acceptance Criteria**: 200 OK with updated profile data.

### FR-EM-03 Create Job Posting
* **Ref**: BR-03
* **Description**: Employer creates a new job posting.
* **Preconditions**: Authenticated Employer, company verified.
* **Main Flow**: Submit job data → system creates `JobPosting` with state `Draft`.
* **Alternative Flow**: Missing required fields → 400.
* **Postconditions**: Draft persisted; admin review pending.
* **Validation Rules**: Title ≤ 120 chars, description ≤ 2000 chars.
* **Acceptance Criteria**: 201 Created, job appears in employer dashboard.

### FR-EM-04 Edit Job Posting
* **Ref**: BR-05, BR-10
* **Description**: Employer edits a job posting that is in `Draft` or `Approved` state.
* **Preconditions**: Owner of the posting; posting not `Closed` or `Expired`.
* **Main Flow**: Submit changes → system updates fields.
* **Alternative Flow**: Attempt to edit `Closed` posting → 403 Forbidden.
* **Postconditions**: Changes saved; audit log recorded.
* **Acceptance Criteria**: 200 OK; modifications reflected in subsequent reads.

### FR-EM-05 Close or Reopen Job Posting
* **Description**: Employer can close an approved job or reopen a closed one (re-enters `Pending` for re-approval).
* **Preconditions**: Owner of posting.
* **Main Flow**: Issue close/reopen command → state transitions accordingly.
* **Alternative Flow**: Reopen without admin approval → moves to `Pending`.
* **Acceptance Criteria**: State changes follow the diagram; notifications sent.

### FR-EM-06 Manage Job Posting List
* **Description**: Employer can list, filter, and paginate their own job postings.
* **Preconditions**: Authenticated Employer.
* **Main Flow**: GET `/employer/{id}/jobs` with filters.
* **Acceptance Criteria**: Pagination works; response time < 2 s.

### FR-EM-07 View Applicants
* **Description**: Employer lists applications submitted for a given job posting.
* **Preconditions**: Owner of the job.
* **Main Flow**: GET `/jobs/{id}/applications` → returns applicant summaries.
* **Acceptance Criteria**: Applicant list includes name, CV link, current application state; pagination works.

### FR-EM-08 View Applicant Details
* **Ref**: BR-09
* **Description**: Employer views full profile and CV of a specific applicant.
* **Preconditions**: Owner of job; applicant has applied.
* **Main Flow**: GET `/applications/{id}` → returns applicant data.
* **Postconditions**: Read-only operation.
* **Acceptance Criteria**: All CV data accessible; privacy enforced.

### FR-EM-09 Update Application Status
* **Description**: Employer changes application state (e.g., `Under Review` → `Accepted`).
* **Preconditions**: Owner of job, valid transition.
* **Main Flow**: PATCH with new state → system validates transition, updates, notifies student.
* **Validation Rules**: Allowed transitions defined in Section 8.
* **Acceptance Criteria**: State transition respects allowed diagram; invalid transition returns 400.

### FR-EM-10 Generate Recruitment Report
* **Description**: Employer can export a CSV report of applications for a job.
* **Preconditions**: Owner of job; job state `Closed` or `Expired`.
* **Main Flow**: Request report → system generates CSV and returns download link.
* **Acceptance Criteria**: CSV includes applicant name, status, applied date.

---

## 4.4 Administrator Module

### FR-AD-01 Admin Login
* **Description**: Administrator authenticates to the admin portal.
* **Preconditions**: Admin account exists and is active.
* **Main Flow**: Same as FR-AUTH-02 but role check for Administrator.
* **Acceptance Criteria**: 200 OK with admin JWT; non-admin credentials return 403.

### FR-AD-02 Approve/Reject Employers
* **Ref**: BR-03
* **Description**: Admin reviews employer registration, sets `verified` flag.
* **Preconditions**: Authenticated Administrator.
* **Main Flow**: GET pending employers → approve/reject → system updates `verified` and notifies employer.
* **Acceptance Criteria**: Employer verification updates `verified` flag and sends email within 2 seconds.

### FR-AD-03 Approve/Reject Job Postings
* **Ref**: BR-04
* **Description**: Admin moves job from `Pending` to `Approved` or `Rejected`.
* **Preconditions**: Job state = `Pending`.
* **Main Flow**: Review → set state, optional feedback → notification.
* **Acceptance Criteria**: Job posting state changes to `Approved` or `Rejected` with admin comment; notification sent.

### FR-AD-04 Manage User Accounts
* **Ref**: BR-10
* **Description**: Admin can lock, unlock, or deactivate any user account.
* **Preconditions**: Authenticated Administrator.
* **Main Flow**: Select user → change `isActive` flag or lock status.
* **Acceptance Criteria**: Changes persisted; affected user receives notification.

### FR-AD-05 Manage System Categories
* **Description**: Admin can create, edit, or delete system-wide categories (e.g., job types, industries).
* **Preconditions**: Authenticated Administrator.
* **Main Flow**: CRUD operations on category entities.
* **Acceptance Criteria**: Category list updates instantly across the system.

### FR-AD-06 View Dashboard Statistics
* **Description**: Admin accesses aggregated metrics (user count, job count, application rates).
* **Preconditions**: Authenticated Administrator.
* **Main Flow**: GET `/admin/dashboard` → returns metrics.
* **Acceptance Criteria**: Data refreshed within 5 minutes; response < 1 s.

### FR-AD-07 Export Audit Log
* **Description**: Admin can export audit logs as CSV for compliance.
* **Preconditions**: Authenticated Administrator.
* **Main Flow**: Request export with date range → system streams CSV.
* **Acceptance Criteria**: CSV includes all fields defined in AuditLog entity.

### FR-AD-08 View Audit Log
* **Description**: Admin queries audit entries with filters (date, actor, action).
* **Acceptance Criteria**: Audit log query returns results matching filters; supports export.

---

## 4.5 System Module

### FR-SYS-01 JWT Authentication
* **Description**: All protected endpoints require a valid JWT access token.
* **Preconditions**: User logged in.
* **Main Flow**: Middleware validates token signature and expiry.
* **Acceptance Criteria**: Invalid token → 401; expired token → 401 with specific error code.

### FR-SYS-02 Role-Based Access Control (RBAC)
* **Description**: Authorization checks based on user role for each use-case.
* **Acceptance Criteria**: Unauthorized role → 403.

### FR-SYS-03 CV Storage Management
* **Description**: Store CV files securely; support future migration to object storage.
* **Acceptance Criteria**: Files saved under `uploads/cv/`; access restricted to owner and admin.

### FR-SYS-04 Search Engine
* **Description**: Provide fast full-text search over job postings.
* **Acceptance Criteria**: Search latency < 2 s for typical queries.

### FR-SYS-05 Data Filtering
* **Description**: Support server-side filtering on job listings.
* **Acceptance Criteria**: Filters applied correctly; no performance degradation.

### FR-SYS-06 Pagination
* **Description**: All list endpoints support pagination with `page` and `pageSize`.
* **Acceptance Criteria**: Consistent pagination metadata returned.

### FR-SYS-07 Email Notification Service
* **Description**: Centralised service to send transactional emails.
* **Acceptance Criteria**: Emails delivered within 5 seconds; retry on failure.

### FR-SYS-08 System Logging
* **Description**: Log all system events to a structured log store.
* **Acceptance Criteria**: Logs include timestamp, level, context; searchable.

### FR-SYS-09 Audit Logging
* **Ref**: BR-10
* **Description**: Record security-relevant actions as defined in the AuditLog entity.
* **Acceptance Criteria**: Immutable, tamper-evident records.

### FR-SYS-10 Notification Management
* **Description**: In-app notification center for users.
* **Acceptance Criteria**: Real-time push via WebSocket; persisted for 30 days.

### FR-SYS-11 Automatic Job Expiry
* **Ref**: BR-08
* **Description**: A scheduled process automatically transitions `JobPosting` from `Approved` to `Expired` when `expiresAt` is reached.
* **Preconditions**: JobPosting in state `Approved`; `expiresAt` timestamp has passed.
* **Main Flow**: Scheduled job scans postings with `expiresAt <= now()` and state `Approved`, transitions them to `Expired`, logs the action.
* **Postconditions**: Posting no longer visible in search results; audit log recorded.
* **Acceptance Criteria**: Job state updates within 5 minutes of expiry time; no manual trigger required.

---

# 5. Business Workflows

1. **Employer Onboarding** – Register → Admin verifies → `EmployerProfile.verified = true` → employer can create jobs.
2. **Job Posting Lifecycle** – Draft → (Employer submits) → Pending → (Admin approves) → Approved → (Students apply) → Closed/Expired.
3. **Student Application Flow** – Search → View → Apply → Application state transitions (Applied → Under Review → Accepted/Rejected → Withdrawn).
4. **Password Reset** – Request → Email token → Verify → Set new password.

---

# 6. Validation Rules (centralised)
* Email format RFC-5322, unique.
* Password 8-32 chars, at least 1 upper, 1 lower, 1 digit, 1 special.
* CV file: PDF, ≤ 5 MB.
* Job title ≤ 120 chars, description ≤ 2000 chars.
* Pagination `pageSize` ∈ {10,20,50}.

---

# 7. State Transition Diagrams

## 7.1 JobPosting
```
Draft → Pending → Approved → Rejected → Closed → Expired
```
*Transitions*: Draft→Pending (submit for review), Pending→Approved/Rejected (admin), Approved→Closed (employer closes), Approved→Expired (`expiresAt` reached, see FR-SYS-11).

## 7.2 Application
```
Applied → Under Review → Accepted
Applied → Under Review → Rejected
Applied → Withdrawn
```
*Transitions* are driven by employer actions or student withdrawal.

---

# 8. RBAC Permission Matrix

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Student | Profile, Application | Own profile, Approved jobs | Profile, Application (withdraw) | Application (withdraw) |
| Employer | JobPosting | Own postings, Applications | JobPosting, Application state | JobPosting |
| Administrator | Any | Any | Any | Any |

> **Ref**: BR-07 — Administrator has full system access per business rule.

---

# 9. Business Error Codes & HTTP Mapping

| Code | Meaning | HTTP |
|------|---------|------|
| B001 | Validation failed | 400 |
| B002 | Authentication required | 401 |
| B003 | Forbidden – insufficient role | 403 |
| B004 | Resource not found | 404 |
| B005 | Conflict – duplicate or illegal state change | 409 |
| B006 | Too many requests (rate limit) | 429 |
| B999 | Unexpected server error | 500 |

Each error response includes `{ "code": "Bxxx", "message": "..." }` for AI-consumable handling.

---

# 10. AI-Friendly Design Notes

* **Use-Case Granularity** – One use-case per functional requirement above; controllers map 1:1 to use-cases.
* **Input/Output DTOs** – Defined by the fields in each Main Flow; AI can generate validation schemas automatically.
* **Repository Interfaces** – Entities listed in Section 3 become repository contracts (e.g., `JobPostingRepository.save`).
* **Infrastructure Concerns** – File storage for CVs, email service, JWT provider are external adapters; keep use-cases pure.
* **Extensibility** – AI Extension Points (Resume Analysis, Trust Score, Recommendation) are declared as separate use-cases that consume the domain model.

---

# 11. Document Metadata

| Version | Status | Last Updated |
|---------|--------|---------------|
| 1.1 | Draft | 2026-06-29 |

---

# 12. Change Log

| Date | Author | Description |
|------|--------|-------------|
| 2026-06-27 | Project Team | Initial requirements document |
| 2026-06-28 | Cline | Created AI-friendly spec.md with core sections |
| 2026-06-28 | Cline | Added missing functional requirements (round 1) |
| 2026-06-29 | Cline | Attempted hyphen/Open/BR fixes (rounds 2–3) — introduced duplicate/missing FR sections and flattened heading hierarchy as side effects |
| 2026-06-29 | Claude | Reconstructed spec.md from verified content across all review rounds: restored strict H1→H4 heading hierarchy; removed all duplicate/orphaned FR headings (FR-ST-09, FR-EM-09 restored; duplicate FR-ST-08/FR-EM-07 content removed); replaced all U+2011 hyphens with ASCII; replaced "Open" job state with "Approved" throughout; merged Acceptance Criteria directly into FR-ST-09, FR-EM-07, FR-EM-09, FR-AD-02, FR-AD-03, FR-AD-08; added FR-SYS-11 (Automatic Job Expiry); added BR-01→BR-10 traceability references |