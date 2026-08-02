import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { StudentController } from "../controllers/student-controller";
import { ValidationException } from "../../../../common/exceptions";

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
  // All student-specific endpoints require authentication and STUDENT role.
  // The public GET /jobs/:jobId route is registered BEFORE the guards so
  // it remains accessible without authentication.
  router.get("/jobs/:jobId", controller.getJobDetail.bind(controller));

  if (authGuard) {
    router.use(authGuard);
  }

  if (roleGuard) {
    router.use(roleGuard);
  }

  // ─── Job Search (protected) ───────────────────────────────────────
  router.get("/jobs", controller.searchJobs.bind(controller));

  // ─── Multer for CV Upload ─────────────────────────────────────────
  const cvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
      if (file.mimetype !== "application/pdf") {
        cb(new Error("Only PDF files are allowed"));
        return;
      }
      cb(null, true);
    },
  });

  // ─── Multer error handler ─────────────────────────────────────────
  // Forward errors to the global exception filter instead of building
  // manual responses. This keeps the response shape consistent.
  const handleMulterError = (err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(new ValidationException("File too large. Maximum size is 5MB."));
        return;
      }
      next(new ValidationException(err.message));
      return;
    }
    if (err) {
      next(new ValidationException(err instanceof Error ? err.message : "File upload failed"));
      return;
    }
    next();
  };

  // ─── Protected Endpoints ─────────────────────────────────────────
  router.get("/profile", controller.getProfile.bind(controller));
  router.patch("/profile", controller.updateProfile.bind(controller));
  router.post(
    "/cv/upload",
    cvUpload.single("file"),
    handleMulterError,
    controller.uploadCV.bind(controller),
  );
  router.get("/cv", controller.listCV.bind(controller));
  router.delete("/cv/:cvId", controller.deleteCV.bind(controller));
  router.patch("/cv/:cvId/default", controller.setDefaultCV.bind(controller));
  router.get("/applications", controller.getApplicationHistory.bind(controller));

  return router;
}
