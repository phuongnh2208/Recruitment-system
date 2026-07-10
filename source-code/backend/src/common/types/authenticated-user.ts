/**
 * AuthenticatedUser represents the user information extracted from a verified
 * JWT token and attached to the Express request object by AuthGuard.
 *
 * This type is used throughout the application to identify the current user
 * without exposing the raw JWT payload. It follows the principle of least
 * privilege — only the fields needed for authorization and identification
 * are exposed.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   // In a controller or middleware:
 *   const user: AuthenticatedUser = request.user;
 *   console.log(user.id, user.email, user.role);
 *
 * ═══════════════════════════════════════════════════════════════════
 * SECURITY
 * ═══════════════════════════════════════════════════════════════════
 *
 * - This type MUST NOT contain sensitive fields like passwordHash.
 * - The `id` field is extracted from JWT `sub` claim.
 * - The `role` field is used by RolesGuard for RBAC checks.
 * - No raw JWT payload is exposed to controllers or use cases.
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export interface AuthenticatedUser {
  /** Unique identifier of the user (extracted from JWT `sub` claim). */
  readonly id: string;

  /** Email address of the authenticated user. */
  readonly email: string;

  /** Role assigned to the user (STUDENT | EMPLOYER | ADMINISTRATOR). */
  readonly role: string;
}
