import { Request, Response, NextFunction } from "express";
import { TokenProvider } from "../../modules/auth/domain/token-provider";
import { AuthenticatedUser } from "../types/authenticated-user";

/**
 * AuthGuard is an Express middleware that authenticates requests by verifying
 * a Bearer JWT access token from the Authorization header.
 *
 * ═══════════════════════════════════════════════════════════════════
 * FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Extract token from "Authorization: Bearer <access_token>" header.
 * 2. Verify the token using TokenProvider.verifyAccessToken().
 * 3. On success:
 *    - Extract { sub, email, role } from the verified TokenPayload.
 *    - Map sub → id, attach AuthenticatedUser to request.user.
 *    - Call next() to pass control to the next middleware.
 * 4. On failure (missing, expired, malformed, invalid signature):
 *    - Return 401 Unauthorized with a descriptive error.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMPORTANT CONSTRAINTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * AuthGuard MUST NOT:
 * - Read the database (no DB queries).
 * - Check role permissions (that's RolesGuard's job).
 * - Execute business logic rules.
 * - Expose the raw JWT payload or token string to request.user.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   // Protect a single route:
 *   app.get("/api/v1/profile", authGuard, handler);
 *
 *   // Protect all routes in a router:
 *   router.use(authGuard);
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * TODO (TSK-INF-204): Replace Error throws with BusinessException types
 * once the common exception hierarchy is implemented.
 *
 * @param tokenProvider - An instance of TokenProvider used to verify tokens.
 * @returns Express middleware function.
 */
export function createAuthGuard(tokenProvider: TokenProvider) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ── Step 1: Extract Authorization header ─────────────────
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: {
            code: "B002",
            message: "Authentication required. Missing Authorization header.",
          },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }

      // ── Step 2: Validate Bearer format ──────────────────────
      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({
          success: false,
          error: {
            code: "B002",
            message: "Invalid Authorization header format. Expected: 'Bearer <access_token>'.",
          },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }

      const token = parts[1];

      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: "B002",
            message: "Access token is missing in Authorization header.",
          },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }

      // ── Step 3: Verify the access token ─────────────────────
      let payload;
      try {
        payload = await tokenProvider.verifyAccessToken(token);
      } catch (verifyError) {
        const message =
          verifyError instanceof Error ? verifyError.message : "Access token verification failed.";

        res.status(401).json({
          success: false,
          error: {
            code: "B002",
            message: `Authentication failed: ${message}`,
          },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }

      // ── Step 4: Attach user to request ──────────────────────
      const authenticatedUser: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      req.user = authenticatedUser;

      next();
    } catch (error) {
      // Catch any unexpected errors (should not happen in normal flow)
      const message =
        error instanceof Error ? error.message : "An unexpected authentication error occurred.";

      res.status(401).json({
        success: false,
        error: {
          code: "B002",
          message: `Authentication failed: ${message}`,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    }
  };
}
