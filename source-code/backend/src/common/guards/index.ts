/**
 * Guards barrel export.
 *
 * Re-exports all guard-related types and functions for convenient imports.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import { createAuthGuard, requireRoles, Role } from "../common/guards";
 *
 *   const authGuard = createAuthGuard(tokenProvider);
 *   app.get("/api/v1/profile", authGuard, requireRoles(Role.STUDENT), handler);
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export { createAuthGuard } from "./auth-guard";
export { requireRoles } from "./roles-guard";
export { Role } from "../types/role";
export type { AuthenticatedUser } from "../types/authenticated-user";
