import { Request, Response, NextFunction } from "express";
import { TokenProvider } from "../../modules/auth/domain/token-provider";
import { AuthenticatedUser } from "../types/authenticated-user";
import { Role } from "../types/role";
import { AuthenticationException, InfrastructureException } from "../exceptions";

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
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // ── Step 1: Extract Authorization header ─────────────────
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        next(new AuthenticationException("Authentication required. Missing Authorization header."));
        return;
      }

      // ── Step 2: Validate Bearer format ──────────────────────
      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        next(
          new AuthenticationException(
            "Invalid Authorization header format. Expected: 'Bearer <access_token>'.",
          ),
        );
        return;
      }

      const token = parts[1];

      if (!token) {
        next(new AuthenticationException("Access token is missing in Authorization header."));
        return;
      }

      // ── Step 3: Verify the access token ─────────────────────
      let payload;
      try {
        payload = await tokenProvider.verifyAccessToken(token);
      } catch (verifyError) {
        // JwtTokenProvider already throws AuthenticationException for
        // invalid/expired tokens. If a raw Error escapes, wrap it so the
        // global exception filter always receives a typed exception.
        next(
          verifyError instanceof AuthenticationException
            ? verifyError
            : new AuthenticationException(
                verifyError instanceof Error ? verifyError.message : "Token verification failed",
              ),
        );
        return;
      }

      // ── Step 4: Attach user to request ──────────────────────
      const authenticatedUser: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role as Role,
      };

      req.user = authenticatedUser;

      next();
    } catch (error) {
      // Never leak raw Error instances — always forward typed exceptions.
      next(
        error instanceof AuthenticationException
          ? error
          : new InfrastructureException(
              "Authentication guard failed",
              error instanceof Error ? { message: error.message } : undefined,
            ),
      );
    }
  };
}
