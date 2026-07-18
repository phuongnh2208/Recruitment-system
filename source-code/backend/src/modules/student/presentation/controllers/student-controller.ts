import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateProfileUseCase } from "../../../student/application/use-cases/update-profile-use-case";
import { UploadCVUseCase } from "../../../student/application/use-cases/upload-cv-use-case";
import { ManageCVListUseCase } from "../../../student/application/use-cases/manage-cv-list-use-case";
import { GetApplicationHistoryUseCase } from "../../../student/application/use-cases/get-application-history-use-case";
import { GetJobDetailUseCase } from "../../../student/application/use-cases/get-job-detail-use-case";

/**
 * StudentController
 *
 * Handles HTTP requests for the Student module and delegates all business
 * logic to the corresponding Use Cases.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER
 * ═══════════════════════════════════════════════════════════════════
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
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 * This controller contains:
 *   - ❌ NO business logic
 *   - ❌ NO database access
 *   - ❌ NO repository calls
 *   - ❌ NO Prisma queries
 *   - ❌ NO try/catch blocks
 *
 * It is pure orchestration: validate → call use case → respond.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
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
    private readonly uploadCVUseCase: UploadCVUseCase,
    private readonly manageCVListUseCase: ManageCVListUseCase,
    private readonly getApplicationHistoryUseCase: GetApplicationHistoryUseCase,
    private readonly getJobDetailUseCase: GetJobDetailUseCase,
  ) {}

  // ── Zod Schemas ─────────────────────────────────────────────────

  /** Schema for updating student profile. */
  private readonly updateProfileSchema = z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    school: z.string().min(1),
    major: z.string().min(1),
    graduationYear: z.string().min(1),
    avatarUrl: z.string().optional().default(""),
  });

  /** Schema for application history pagination query. */
  private readonly historyQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  });

  // ── Endpoint Methods ────────────────────────────────────────────

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
   * - `address`        – required, non-empty string
   * - `school`         – required, non-empty string
   * - `major`          – required, non-empty string
   * - `graduationYear` – required, non-empty string
   *
   * **Response** – `200 OK` with the update result.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async updateProfile(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const body = this.updateProfileSchema.parse(req.body);
    const result = await this.updateProfileUseCase.execute({
      userId: req.user!.id,
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
      school: body.school,
      major: body.major,
      graduationYear: body.graduationYear,
      avatarUrl: body.avatarUrl,
    });
    res.status(200).json(result);
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
  async uploadCV(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const file = (req as any).file!;
    const result = await this.uploadCVUseCase.execute({
      studentId: req.user!.id,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    });
    res.status(201).json(result);
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
  async listCV(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.manageCVListUseCase.list({
      studentId: req.user!.id,
    });
    res.status(200).json(result);
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
  async deleteCV(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.manageCVListUseCase.delete({
      studentId: req.user!.id,
      cvId: req.params.cvId,
    });
    res.status(200).json(result);
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
  async setDefaultCV(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.manageCVListUseCase.setDefault({
      studentId: req.user!.id,
      cvId: req.params.cvId,
    });
    res.status(200).json(result);
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
  async getApplicationHistory(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const query = this.historyQuerySchema.parse(req.query);
    const result = await this.getApplicationHistoryUseCase.execute({
      studentId: req.user!.id,
      page: query.page,
      limit: query.limit,
    });
    res.status(200).json(result);
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
  async getJobDetail(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.getJobDetailUseCase.execute({
      jobId: req.params.jobId,
    });
    res.status(200).json(result);
  }
}
