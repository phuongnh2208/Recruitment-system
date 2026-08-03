import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { JobController } from "../controllers/job-controller";
import { Role } from "../../../../common/types/role";

/**
 * Job Routes
 *
 * Presentation Layer – Router that maps HTTP endpoints to JobController
 * methods.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Define the Express Router for the Job module.
 *   2. Map each URL + HTTP verb to the corresponding controller method.
 *   3. Attach middleware (authentication guard, roles guard) where
 *      required.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THIS FILE DOES NOT CONTAIN
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - No business logic.
 *   - No validation (schemas are called inside the controller).
 *   - No try/catch blocks – errors are forwarded to the global error
 *     middleware via `next(error)` within the controller.
 *   - No direct database access or repository usage.
 *   - No instantiation of Use Cases, Repositories, or any
 *     infrastructure classes.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * The `JobController` is injected via the constructor. The router has
 * zero knowledge of how the controller or its use cases are
 * instantiated. A DI Container (or composition root) is responsible
 * for wiring everything together.
 *
 * ═══════════════════════════════════════════════════════════════════
 * MIDDLEWARE STRATEGY
 * ═══════════════════════════════════════════════════════════════════
 *
 * This router does NOT fail-open. If `authGuard` or `roleGuard` are not
 * provided, an Error is thrown. There is no public fallback for
 * protected routes.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ROUTE TABLE
 * ═══════════════════════════════════════════════════════════════════
 *
 * | Method | Path                | Auth | Role       | Controller Method       |
 * |--------|---------------------|------|------------|-------------------------|
 * | POST   | /jobs               | Yes  | EMPLOYER   | controller.createJob    |
 * | PATCH  | /jobs/:jobId        | Yes  | EMPLOYER   | controller.updateJob    |
 * | POST   | /jobs/:jobId/submit | Yes  | EMPLOYER   | controller.submitJob    |
 * | PATCH  | /jobs/:jobId/close  | Yes  | EMPLOYER   | controller.closeJob     |
 * | GET    | /jobs               | No   | Public     | controller.searchJobs   |
 *
 * @category Presentation Routes
 */
export function createJobRouter(
  controller: JobController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  roleGuard?: (
    ...allowedRoles: Role[]
  ) => (req: Request, res: Response, next: NextFunction) => void,
): Router {
  const router = Router();

  // ─── Middleware Validation ────────────────────────────────────────
  // This router does not fail-open. Guards must be provided.
  if (!authGuard) {
    throw new Error("createJobRouter: authGuard is required but was not provided.");
  }

  if (!roleGuard) {
    throw new Error("createJobRouter: roleGuard is required but was not provided.");
  }

  // ─── Public Endpoints ─────────────────────────────────────────────
  // GET / is public – search approved jobs without authentication
  router.get("/", controller.searchJobs.bind(controller));

  // ─── Public Job Detail Endpoint ───────────────────────────────────
  // GET /:jobId retrieves approved job details – no auth required
  router.get("/:jobId", controller.getJobDetail.bind(controller));

  // ─── Employer Jobs Endpoint ───────────────────────────────────────
  // GET /employer retrieves all jobs created by the authenticated employer
  router.get("/employer", authGuard, controller.getEmployerJobs.bind(controller));

  // ─── Protected Endpoints (EMPLOYER only) ──────────────────────────
  // Apply authentication and role guard only to mutation routes
  router.post("/", authGuard, roleGuard(Role.EMPLOYER), controller.createJob.bind(controller));
  router.patch(
    "/:jobId",
    authGuard,
    roleGuard(Role.EMPLOYER),
    controller.updateJob.bind(controller),
  );
  router.post(
    "/:jobId/submit",
    authGuard,
    roleGuard(Role.EMPLOYER),
    controller.submitJob.bind(controller),
  );
  router.patch(
    "/:jobId/close",
    authGuard,
    roleGuard(Role.EMPLOYER),
    controller.closeJob.bind(controller),
  );
  router.post(
    "/:jobId/reopen",
    authGuard,
    roleGuard(Role.EMPLOYER),
    controller.reopenJob.bind(controller),
  );

  return router;
}
