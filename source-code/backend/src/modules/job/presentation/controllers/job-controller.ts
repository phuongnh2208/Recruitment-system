import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateJobPostingUseCase } from "../../application/use-cases/create-job-posting-use-case";
import { SubmitJobPostingUseCase } from "../../application/use-cases/submit-job-posting-use-case";
import { UpdateJobPostingUseCase } from "../../application/use-cases/update-job-posting-use-case";
import { CloseJobPostingUseCase } from "../../application/use-cases/close-job-posting-use-case";
import { SearchJobsUseCase } from "../../application/use-cases/search-jobs-use-case";

/**
 * JobController
 *
 * Handles HTTP requests for the Job module and delegates all business
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
 *   1. Extract input data from the HTTP request (body, params, query).
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
 *   - ❌ NO logging
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
export class JobController {
  constructor(
    private readonly createJobPostingUseCase: CreateJobPostingUseCase,
    private readonly submitJobPostingUseCase: SubmitJobPostingUseCase,
    private readonly updateJobPostingUseCase: UpdateJobPostingUseCase,
    private readonly closeJobPostingUseCase: CloseJobPostingUseCase,
    private readonly searchJobsUseCase: SearchJobsUseCase,
  ) {}

  // ── Zod Schemas ─────────────────────────────────────────────────

  /** Schema for creating a new job posting. */
  private readonly createJobSchema = z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1),
    requirements: z.string().min(1),
    location: z.string().min(1),
    salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
    salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
    currency: z.string().optional().default("VND"),
    expiresAt: z.coerce.date(),
  });

  /** Schema for updating a job posting (all fields optional). */
  private readonly updateJobSchema = z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().min(1).optional(),
    requirements: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
    salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
    expiresAt: z.coerce.date().optional(),
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

  // ── Endpoint Methods ────────────────────────────────────────────

  /**
   * POST /jobs
   *
   * Creates a new job posting in DRAFT state.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used as
   * the employer's userId.
   *
   * **Request body** (validated by `createJobSchema`):
   * - `title`         – required, 1-120 characters
   * - `description`   – required, non-empty string
   * - `requirements`  – required, non-empty string
   * - `location`      – required, non-empty string
   * - `salaryMin`     – optional, non-negative integer
   * - `salaryMax`     – optional, non-negative integer
   * - `currency`      – optional, defaults to "VND"
   * - `expiresAt`     – required, future date
   *
   * **Response** – `201 Created` with the job posting ID.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async createJob(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const body = this.createJobSchema.parse(req.body);
    const result = await this.createJobPostingUseCase.execute({
      employerId: req.user!.id,
      title: body.title,
      description: body.description,
      requirements: body.requirements,
      location: body.location,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      currency: body.currency,
      expiresAt: body.expiresAt,
    });
    res.status(201).json(result);
  }

  /**
   * PATCH /jobs/:jobId
   *
   * Updates an existing job posting. Only the owner can update, and only
   * if the job is in DRAFT or REJECTED state.
   *
   * **Path params:**
   * - `jobId` – the unique identifier of the job posting
   *
   * **Request body** (validated by `updateJobSchema`):
   * - `title`         – optional, 1-120 characters
   * - `description`   – optional, non-empty string
   * - `requirements`  – optional, non-empty string
   * - `location`      – optional, non-empty string
   * - `salaryMin`     – optional, non-negative integer
   * - `salaryMax`     – optional, non-negative integer
   * - `expiresAt`     – optional, future date
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async updateJob(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const body = this.updateJobSchema.parse(req.body);
    const result = await this.updateJobPostingUseCase.execute({
      employerId: req.user!.id,
      jobPostingId: req.params.jobId,
      title: body.title,
      description: body.description,
      requirements: body.requirements,
      location: body.location,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      expiresAt: body.expiresAt,
    });
    res.status(200).json(result);
  }

  /**
   * POST /jobs/:jobId/submit
   *
   * Submits a job posting for admin approval. Transitions state from
   * DRAFT to SUBMITTED. Only the owner can submit.
   *
   * **Path params:**
   * - `jobId` – the unique identifier of the job posting
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async submitJob(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.submitJobPostingUseCase.execute({
      employerId: req.user!.id,
      jobPostingId: req.params.jobId,
    });
    res.status(200).json(result);
  }

  /**
   * PATCH /jobs/:jobId/close
   *
   * Closes an approved job posting. Transitions state from APPROVED to
   * CLOSED. Only the owner can close.
   *
   * **Path params:**
   * - `jobId` – the unique identifier of the job posting
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async closeJob(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.closeJobPostingUseCase.execute({
      employerId: req.user!.id,
      jobPostingId: req.params.jobId,
    });
    res.status(200).json(result);
  }

  /**
   * GET /jobs
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
  async searchJobs(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const query = this.searchJobsQuerySchema.parse(req.query);
    const result = await this.searchJobsUseCase.execute({
      page: query.page,
      limit: query.limit,
      keyword: query.keyword,
      location: query.location,
      salaryMin: query.salaryMin ?? undefined,
      salaryMax: query.salaryMax ?? undefined,
    });
    res.status(200).json(result);
  }
}
