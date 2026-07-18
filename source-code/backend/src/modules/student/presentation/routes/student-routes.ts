import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { StudentController } from "../controllers/student-controller";

/**
 * Student Routes
 *
 * Presentation Layer – Router that maps HTTP endpoints to StudentController
 * methods.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Define the Express Router for the Student module.
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
 * The `StudentController` is injected via the constructor. The router has
 * zero knowledge of how the controller or its use cases are
 * instantiated. A DI Container (or composition root) is responsible
 * for wiring everything together.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ROUTE TABLE
 * ═══════════════════════════════════════════════════════════════════
 *
 * | Method | Path                | Auth | Role    | Controller Method       |
 * |--------|---------------------|------|---------|-------------------------|
 * | PATCH  | /profile            | Yes  | STUDENT | controller.updateProfile |
 * | POST   | /cv/upload          | Yes  | STUDENT | controller.uploadCV      |
 * | GET    | /cv                 | Yes  | STUDENT | controller.listCV        |
 * | DELETE | /cv/:cvId           | Yes  | STUDENT | controller.deleteCV      |
 * | PATCH  | /cv/:cvId/default   | Yes  | STUDENT | controller.setDefaultCV  |
 * | GET    | /applications       | Yes  | STUDENT | controller.getApplicationHistory |
 * | GET    | /jobs/:jobId        | No   | None    | controller.getJobDetail  |
 *
 * @category Presentation Routes
 */
export function createStudentRouter(
  controller: StudentController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  roleGuard?: (req: Request, res: Response, next: NextFunction) => void,
): Router {
  const router = Router();

  // ─── Middleware ───────────────────────────────────────────────────
  // All student-specific endpoints require authentication and STUDENT role
  if (authGuard) {
    router.use(authGuard);
  } else {
    // TODO: Attach authentication middleware (e.g. createAuthGuard(tokenProvider))
    // once the DI container is wired up in the composition root.
  }

  if (roleGuard) {
    router.use(roleGuard);
  } else {
    // TODO: Attach role middleware (e.g. requireRoles(Role.STUDENT))
    // once the DI container is wired up in the composition root.
  }

  // ─── Protected Endpoints ─────────────────────────────────────────
  router.patch("/profile", controller.updateProfile.bind(controller));
  router.post("/cv/upload", controller.uploadCV.bind(controller));
  router.get("/cv", controller.listCV.bind(controller));
  router.delete("/cv/:cvId", controller.deleteCV.bind(controller));
  router.patch("/cv/:cvId/default", controller.setDefaultCV.bind(controller));
  router.get("/applications", controller.getApplicationHistory.bind(controller));

  // ─── Public / No-Auth Endpoints ──────────────────────────────────
  // GET /jobs/:jobId retrieves approved job details – no auth required
  router.get("/jobs/:jobId", controller.getJobDetail.bind(controller));

  return router;
}
