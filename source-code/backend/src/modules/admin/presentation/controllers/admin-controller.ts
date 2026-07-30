import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { VerifyEmployerUseCase } from "../../application/use-cases/verify-employer-use-case";
import { ApproveJobPostingUseCase } from "../../application/use-cases/approve-job-posting-use-case";
import { RejectJobPostingUseCase } from "../../application/use-cases/reject-job-posting-use-case";
import { ManageUserAccountUseCase } from "../../application/use-cases/manage-user-account-use-case";
import { GetDashboardStatsUseCase } from "../../application/use-cases/get-dashboard-stats-use-case";

/**
 * AdminController
 *
 * Handles HTTP requests for the Admin module and delegates all business
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
export class AdminController {
  constructor(
    private readonly verifyEmployerUseCase: VerifyEmployerUseCase,
    private readonly approveJobPostingUseCase: ApproveJobPostingUseCase,
    private readonly rejectJobPostingUseCase: RejectJobPostingUseCase,
    private readonly manageUserAccountUseCase: ManageUserAccountUseCase,
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
  ) {}

  // ── Zod Schemas ─────────────────────────────────────────────────

  /** Schema for verifying an employer. */
  private readonly verifyEmployerSchema = z.object({
    employerId: z.string().min(1),
  });

  /** Schema for approving a job posting. */
  private readonly approveJobSchema = z.object({
    jobId: z.string().min(1),
  });

  /** Schema for rejecting a job posting. */
  private readonly rejectJobSchema = z.object({
    jobId: z.string().min(1),
    rejectionReason: z.string().min(1),
  });

  /** Schema for managing a user account. */
  private readonly manageUserSchema = z.object({
    isActive: z.boolean(),
  });

  // ── Endpoint Methods ────────────────────────────────────────────

  /**
   * GET /admin/dashboard
   *
   * Retrieves the admin dashboard statistics.
   *
   * **Authentication:** Requires a valid JWT with ADMIN role.
   *
   * **Response** – `200 OK` with dashboard statistics.
   *
   * @param req  - Express Request
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async getDashboardStats(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.getDashboardStatsUseCase.execute();
    res.status(200).json(result);
  }

  /**
   * PATCH /admin/employers/:employerId/verify
   *
   * Verifies an employer account.
   *
   * **Authentication:** Requires a valid JWT with ADMIN role.
   *
   * **Path params:**
   * - `employerId` – the unique identifier of the employer to verify
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async verifyEmployer(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const params = this.verifyEmployerSchema.parse(req.params);
    const result = await this.verifyEmployerUseCase.execute({
      employerId: params.employerId,
      adminId: req.user!.id,
    });
    res.status(200).json(result);
  }

  /**
   * PATCH /admin/jobs/:jobId/approve
   *
   * Approves a job posting.
   *
   * **Authentication:** Requires a valid JWT with ADMIN role.
   *
   * **Path params:**
   * - `jobId` – the unique identifier of the job posting to approve
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async approveJobPosting(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const params = this.approveJobSchema.parse(req.params);
    const result = await this.approveJobPostingUseCase.execute({
      jobId: params.jobId,
      adminId: req.user!.id,
    });
    res.status(200).json(result);
  }

  /**
   * PATCH /admin/jobs/:jobId/reject
   *
   * Rejects a job posting with a reason.
   *
   * **Authentication:** Requires a valid JWT with ADMIN role.
   *
   * **Path params:**
   * - `jobId` – the unique identifier of the job posting to reject
   *
   * **Request body:**
   * - `rejectionReason` – required, non-empty string
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async rejectJobPosting(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const params = this.rejectJobSchema.parse({
      jobId: req.params.jobId,
      rejectionReason: req.body.rejectionReason,
    });
    const result = await this.rejectJobPostingUseCase.execute({
      jobId: params.jobId,
      adminId: req.user!.id,
      rejectionReason: params.rejectionReason,
    });
    res.status(200).json(result);
  }

  /**
   * PATCH /admin/users/:userId/status
   *
   * Activates or deactivates a user account.
   *
   * **Authentication:** Requires a valid JWT with ADMIN role.
   *
   * **Path params:**
   * - `userId` – the unique identifier of the user to manage
   *
   * **Request body:**
   * - `isActive` – required boolean indicating the new active status
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async manageUserAccount(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const body = this.manageUserSchema.parse(req.body);
    const result = await this.manageUserAccountUseCase.execute({
      userId: req.params.userId,
      isActive: body.isActive,
    });
    res.status(200).json(result);
  }
}
