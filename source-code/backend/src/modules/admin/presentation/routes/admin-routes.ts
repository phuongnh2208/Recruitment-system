import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AdminController } from "../controllers/admin-controller";

/**
 * Admin Routes
 *
 * Presentation Layer – Router that maps HTTP endpoints to AdminController
 * methods.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Define the Express Router for the Admin module.
 *   2. Map each URL + HTTP verb to the corresponding controller method.
 *   3. Attach middleware (authentication guard, roles guard) where the
 *      project already provides it.
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
 * The `AdminController` is injected via the constructor. The router has
 * zero knowledge of how the controller or its use cases are
 * instantiated. A DI Container (or composition root) is responsible
 * for wiring everything together.
 *
 * ═══════════════════════════════════════════════════════════════════
 * GUARDS
 * ═══════════════════════════════════════════════════════════════════
 *
 * All admin endpoints require:
 *   - AuthGuard (valid JWT)
 *   - RoleGuard (ADMIN role)
 *
 * If either guard is missing, the router throws an Error to prevent
 * fail‑open security.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ROUTE TABLE
 * ═══════════════════════════════════════════════════════════════════
 *
 * | Method | Path                           | Auth | Role  | Controller Method          |
 * |--------|--------------------------------|------|-------|----------------------------|
 * | GET    | /dashboard                     | Yes  | ADMIN | controller.getDashboardStats|
 * | PATCH  | /employers/:employerId/verify  | Yes  | ADMIN | controller.verifyEmployer  |
 * | PATCH  | /jobs/:jobId/approve           | Yes  | ADMIN | controller.approveJobPosting|
 * | PATCH  | /jobs/:jobId/reject            | Yes  | ADMIN | controller.rejectJobPosting |
 * | PATCH  | /users/:userId/status          | Yes  | ADMIN | controller.manageUserAccount|
 *
 * @category Presentation Routes
 */
export function createAdminRouter(
  controller: AdminController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  roleGuard?: (req: Request, res: Response, next: NextFunction) => void,
): Router {
  const router = Router();

  // ─── Guards ─────────────────────────────────────────────────────
  // All admin-specific endpoints require authentication and ADMIN role.
  // If guards are missing, throw to prevent fail‑open.
  if (!authGuard) {
    throw new Error(
      "[AdminRouter] authGuard is required. " +
        "All admin endpoints must be protected by authentication.",
    );
  }

  if (!roleGuard) {
    throw new Error(
      "[AdminRouter] roleGuard is required. " +
        "All admin endpoints must be protected by ADMIN role guard.",
    );
  }

  router.use(authGuard);
  router.use(roleGuard);

  // ─── Endpoints ──────────────────────────────────────────────────
  router.get("/dashboard", controller.getDashboardStats.bind(controller));
  router.patch("/employers/:employerId/verify", controller.verifyEmployer.bind(controller));
  router.patch("/jobs/:jobId/approve", controller.approveJobPosting.bind(controller));
  router.patch("/jobs/:jobId/reject", controller.rejectJobPosting.bind(controller));
  router.patch("/users/:userId/status", controller.manageUserAccount.bind(controller));

  return router;
}
