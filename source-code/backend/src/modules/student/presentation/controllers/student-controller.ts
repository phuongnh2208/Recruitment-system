import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateProfileUseCase } from "../../../student/application/use-cases/update-profile-use-case";
import { GetProfileUseCase } from "../../../student/application/use-cases/get-profile-use-case";
import { UploadCVUseCase } from "../../../student/application/use-cases/upload-cv-use-case";
import { ManageCVListUseCase } from "../../../student/application/use-cases/manage-cv-list-use-case";
import { GetApplicationHistoryUseCase } from "../../../student/application/use-cases/get-application-history-use-case";
import { GetJobDetailUseCase } from "../../../student/application/use-cases/get-job-detail-use-case";
import { SearchJobsUseCase } from "../../../job/application/use-cases/search-jobs-use-case";
import { AuthenticationException } from "../../../../common/exceptions";
import { StudentProfile } from "../../domain/entities/student-profile";
import { CVMetadata } from "../../domain/entities/cv-metadata";
import { Application } from "../../../application/domain/entities/application";

/**
 * Map a StudentProfile domain entity to a flat DTO for HTTP serialization.
 *
 * Domain entities use private fields + getters, so JSON.stringify would
 * emit `_fullName` instead of `fullName`. This mapper ensures the wire
 * format matches what the frontend expects.
 */
function toProfileDto(profile: StudentProfile) {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    phone: profile.phone,
    address: profile.address,
    university: profile.university,
    major: profile.major,
    graduationYear: profile.graduationYear !== null ? String(profile.graduationYear) : "",
    avatarUrl: profile.avatarUrl,
    defaultCvId: profile.defaultCvId,
  };
}

/**
 * Map a CVMetadata domain entity to a flat DTO for HTTP serialization.
 *
 * Domain entities use private fields + getters, so JSON.stringify would
 * emit `_fileSize` instead of `fileSize`. This mapper ensures the wire
 * format matches what the frontend expects.
 */
function toCvDto(cv: CVMetadata) {
  return {
    id: cv.id,
    studentId: cv.studentId,
    fileName: cv.fileName,
    originalFileName: cv.originalFileName,
    mimeType: cv.mimeType,
    fileSize: cv.fileSize,
    filePath: `/uploads/${cv.storagePath.replace(/\\/g, "/")}`,
    isDefault: cv.isDefault,
    uploadedAt: cv.uploadedAt.toISOString(),
  };
}

/**
 * Map an Application domain entity to a flat DTO for HTTP serialization.
 *
 * Domain entities use private fields + getters, so JSON.stringify would
 * emit `_studentId` instead of `studentId`. This mapper ensures the wire
 * format matches what the frontend expects.
 */
function toApplicationDto(application: Application) {
  return {
    id: application.id,
    studentId: application.studentId,
    jobPostingId: application.jobPostingId,
    cvId: application.cvId,
    state: application.state.value,
    rejectionReason: application.rejectionReason,
    appliedAt: application.appliedAt.toISOString(),
    reviewedAt: application.reviewedAt ? application.reviewedAt.toISOString() : null,
    reviewedBy: application.reviewedBy,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

/**
 * StudentController
 *
 * Handles HTTP requests for the Student module and delegates all business
 * logic to the corresponding Use Cases.
 *
 * PRESENTATION LAYER
 *
 * This controller sits at the outermost layer (Presentation / Interface
 * Adapters). Its sole purpose is to translate between HTTP and the
 * application layer:
 *
 *   1. Extract input data from the HTTP request (body, params, query,
 *      file).
 *   2. Validate the input using Zod schemas — NO manual validation.
 *   3. Call the appropriate Use Case method.
 *   4. Return a standardised HTTP response with the result.
 *   5. Forward any exception to the Global Error Middleware via
 *      `next(error)` — this controller does NOT handle errors itself.
 *
 * CLEAN ARCHITECTURE BOUNDARY
 *
 * This controller contains:
 *   - NO business logic
 *   - NO database access
 *   - NO repository calls
 *   - NO Prisma queries
 *   - NO try/catch blocks
 *
 * It is pure orchestration: validate -> call use case -> respond.
 *
 * DEPENDENCY INJECTION
 *
 * All five use cases are injected via the constructor. The controller
 * has zero knowledge of how use cases are instantiated, which
 * repositories they depend on, or how their dependencies are resolved.
 * The DI Container (or the composition root) is responsible for wiring
 * everything together.
 *
 * @category Presentation Controller
 */
export class StudentController {
  constructor(
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly uploadCVUseCase: UploadCVUseCase,
    private readonly manageCVListUseCase: ManageCVListUseCase,
    private readonly getApplicationHistoryUseCase: GetApplicationHistoryUseCase,
    private readonly getJobDetailUseCase: GetJobDetailUseCase,
    private readonly searchJobsUseCase: SearchJobsUseCase,
  ) {}

  // Zod Schemas

  /** Schema for updating student profile. */
  private readonly updateProfileSchema = z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().optional().default(""),
    university: z.string().optional().default(""),
    major: z.string().optional().default(""),
    graduationYear: z.string().optional().default(""),
    avatarUrl: z.string().optional().default(""),
  });

  /** Schema for application history pagination query. */
  private readonly historyQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  });

  /** Schema for job search query parameters. */
  private readonly searchJobsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    keyword: z.string().optional().default(""),
    location: z.string().optional().default(""),
    salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
    salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
  });

  // Endpoint Methods

  /**
   * PATCH /student/profile
   *
   * Updates the authenticated student's profile information.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used as
   * the student's userId.
   *
   * **Request body** (validated by `updateProfileSchema`):
   * - `fullName`       – required, non-empty string
   * - `phone`          – required, non-empty string
   * - `address`        – optional, defaults to empty string
   * - `university`     – optional, defaults to empty string
   * - `major`          – optional, defaults to empty string
   * - `graduationYear` – optional, defaults to empty string (null when empty)
   *
   * **Response** – `200 OK` with the update result.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const body = this.updateProfileSchema.parse(req.body);
      const result = await this.updateProfileUseCase.execute({
        userId: req.user.id,
        fullName: body.fullName,
        phone: body.phone,
        address: body.address,
        university: body.university,
        major: body.major,
        graduationYear: body.graduationYear,
        avatarUrl: body.avatarUrl,
      });
      res.status(200).json({
        success: true,
        data: { studentProfileId: result.studentProfileId },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /student/profile
   *
   * Retrieves the authenticated student's profile information.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used as
   * the student's userId.
   *
   * **Response** – `200 OK` with the profile data or null if not found.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.getProfileUseCase.execute({
        userId: req.user.id,
      });
      res.status(200).json({
        success: true,
        data: {
          profile: result.profile ? toProfileDto(result.profile) : null,
          exists: result.exists,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /student/cv/upload
   *
   * Uploads a CV file (PDF) for the authenticated student.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used as
   * the student's userId.
   *
   * **Multipart file** (`req.file`):
   * - `originalname` – original file name
   * - `mimetype`     – must be `application/pdf`
   * - `buffer`       – file content
   * - `size`         – file size in bytes (max 5 MB)
   *
   * **Response** – `201 Created` with the upload result.
   *
   * @param req  - Express Request (with `req.file` from Multer)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async uploadCV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        next(new AuthenticationException("File is required."));
        return;
      }
      const result = await this.uploadCVUseCase.execute({
        studentId: req.user.id,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      });
      res.status(201).json({ success: true, data: toCvDto(result.cv) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /student/cv
   *
   * Lists all CVs belonging to the authenticated student.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used
   * as the student's userId.
   *
   * **Response** – `200 OK` with the list of CV metadata.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async listCV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.manageCVListUseCase.list({
        studentId: req.user.id,
      });
      // Frontend expects CVMetadata[] directly, not { cvs: CVMetadata[] }
      res.status(200).json({
        success: true,
        data: result.cvs.map(toCvDto),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /student/cv/:cvId
   *
   * Deletes a specific CV belonging to the authenticated student.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used
   * as the student's userId.
   *
   * **Path params:**
   * - `cvId` – the unique identifier of the CV to delete
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async deleteCV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.manageCVListUseCase.delete({
        studentId: req.user.id,
        cvId: req.params.cvId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /student/cv/:cvId/default
   *
   * Sets a specific CV as the default CV for the authenticated student.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used
   * as the student's userId.
   *
   * **Path params:**
   * - `cvId` – the unique identifier of the CV to set as default
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async setDefaultCV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.manageCVListUseCase.setDefault({
        studentId: req.user.id,
        cvId: req.params.cvId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /student/applications
   *
   * Retrieves the authenticated student's application history with
   * pagination.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used
   * as the student's userId.
   *
   * **Query params:**
   * - `page`  – page number (1-based, default: 1)
   * - `limit` – items per page (default: 10, max: 100)
   *
   * **Response** – `200 OK` with paginated application list.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async getApplicationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const query = this.historyQuerySchema.parse(req.query);
      const result = await this.getApplicationHistoryUseCase.execute({
        studentId: req.user.id,
        page: query.page,
        limit: query.limit,
      });
      res.status(200).json({
        success: true,
        data: {
          items: result.items.map(toApplicationDto),
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /student/jobs/:jobId
   *
   * Retrieves the full details of a job posting by its ID. Only returns
   * APPROVED jobs per FR-ST-07.
   *
   * **Path params:**
   * - `jobId` – the unique identifier of the job posting
   *
   * **Response** – `200 OK` with the job detail.
   *
   * @param req  - Express Request
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async getJobDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getJobDetailUseCase.execute({
        jobId: req.params.jobId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /student/jobs
   *
   * Searches for approved job postings with optional filters.
   * Only APPROVED jobs are returned (enforced by the use case).
   *
   * **Query params:**
   * - `page`      – page number (1-based, default: 1)
   * - `limit`     – items per page (default: 10, max: 100)
   * - `keyword`   – free-text search keyword (optional)
   * - `location`  – location filter (optional)
   * - `salaryMin` – minimum salary filter (optional)
   * - `salaryMax` – maximum salary filter (optional)
   *
   * **Response** – `200 OK` with array of matching job postings.
   *
   * @param req  - Express Request
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async searchJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = this.searchJobsQuerySchema.parse(req.query);
      const result = await this.searchJobsUseCase.execute({
        page: query.page,
        limit: query.limit,
        keyword: query.keyword,
        location: query.location,
        salaryMin: query.salaryMin ?? undefined,
        salaryMax: query.salaryMax ?? undefined,
      });

      // Standardized DTO — pagination metadata comes straight from the
      // use case (sourced from the repository's PaginatedJobResult).
      res.status(200).json({
        success: true,
        data: {
          items: result.items,
          page: result.page,
          size: result.limit,
          totalPages: result.totalPages,
          totalItems: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
