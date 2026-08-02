import { Request, Response, NextFunction } from "express";
import { Role } from "../types/role";
import { AuthenticationException, ForbiddenException } from "../exceptions";

/**
 * Type representing the set of roles required to access a resource.
 */
type RoleValues = `${Role}`;

/**
 * requireRoles creates an Express middleware that checks if the authenticated
 * user has one of the specified roles.
 *
 * ═══════════════════════════════════════════════════════════════════
 * FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Check that the request has been authenticated (request.user exists).
 *    This middleware MUST be used AFTER AuthGuard.
 * 2. Compare the user's role (request.user.role) against the allowed roles.
 * 3. If the user's role matches any of the allowed roles → call next().
 * 4. If no match → return 403 Forbidden.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMPORTANT CONSTRAINTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * RolesGuard MUST NOT:
 * - Verify JWT tokens (that's AuthGuard's job).
 * - Access the database.
 * - Execute business logic rules.
 * - Modify the request object.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   // Single role:
 *   app.get("/api/v1/student/profile", authGuard, requireRoles(Role.STUDENT), handler);
 *
 *   // Multiple roles (any match):
 *   app.get("/api/v1/jobs", authGuard, requireRoles(Role.STUDENT, Role.EMPLOYER), handler);
 *
 *   // Administrator only:
 *   app.get("/api/v1/admin/dashboard", authGuard, requireRoles(Role.ADMINISTRATOR), handler);
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @param allowedRoles - One or more roles that are permitted to access the resource.
 * @returns Express middleware function.
 */
export function requireRoles(
  ...allowedRoles: Role[]
): (req: Request, res: Response, next: NextFunction) => void {
  const allowedRoleSet = new Set<RoleValues>(allowedRoles.map((role) => role as RoleValues));

  return (req: Request, _res: Response, next: NextFunction): void => {
    // ── Step 1: Ensure the request is authenticated ───────────
    if (!req.user) {
      next(
        new AuthenticationException(
          "Authentication required. RolesGuard must be used after AuthGuard.",
        ),
      );
      return;
    }

    // ── Step 2: Check user role ───────────────────────────────
    const userRole = req.user.role as RoleValues;

    if (!allowedRoleSet.has(userRole)) {
      next(
        new ForbiddenException(
          `Forbidden. Required role: ${Array.from(allowedRoleSet).join(" or ")}. Your role: ${userRole}.`,
        ),
      );
      return;
    }

    // ── Step 3: Authorized — proceed ──────────────────────────
    next();
  };
}
