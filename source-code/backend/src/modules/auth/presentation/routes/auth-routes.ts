import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/auth-controller";

/**
 * Auth Routes
 *
 * Presentation Layer – Router that maps HTTP endpoints to AuthController
 * methods.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Define the Express Router for the Authentication module.
 *   2. Map each URL + HTTP verb to the corresponding controller method.
 *   3. Attach middleware (e.g. authentication guard) where the project
 *      already provides it.
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
 * The `AuthController` is injected via the constructor. The router has
 * zero knowledge of how the controller or its use cases are
 * instantiated. A DI Container (or composition root) is responsible
 * for wiring everything together.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ROUTE TABLE
 * ═══════════════════════════════════════════════════════════════════
 *
 * | Method | Path             | Auth | Controller Method   |
 * |--------|------------------|------|---------------------|
 * | POST   | /register        | No   | controller.register |
 * | POST   | /login           | No   | controller.login    |
 * | POST   | /logout          | No   | controller.logout   |
 * | POST   | /change-password | Yes  | controller.changePassword |
 * | GET    | /verify-email    | No   | controller.verifyEmail |
 *
 * @category Presentation Routes
 */
export function createAuthRouter(
  controller: AuthController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): Router {
  const router = Router();

  // ─── Public Endpoints ────────────────────────────────────────────
  router.post("/register", controller.register.bind(controller));
  router.post("/login", controller.login.bind(controller));
  router.post("/refresh-token", controller.refreshToken.bind(controller));
  router.post("/logout", controller.logout.bind(controller));
  router.get("/verify-email", controller.verifyEmail.bind(controller));

  // ─── Protected Endpoints ─────────────────────────────────────────
  if (authGuard) {
    router.post("/change-password", authGuard, controller.changePassword.bind(controller));
  } else {
    // TODO: Attach authentication middleware (e.g. createAuthGuard(tokenProvider))
    // once the DI container is wired up in the composition root.
    router.post("/change-password", controller.changePassword.bind(controller));
  }

  return router;
}
