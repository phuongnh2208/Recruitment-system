/**
 * Role enum defines the available user roles in the system.
 *
 * This enum is used for Role-Based Access Control (RBAC) across the
 * application. It is consumed by RolesGuard to authorize endpoints
 * based on the authenticated user's role.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMPORTANT
 * ═══════════════════════════════════════════════════════════════════
 *
 * This TypeScript enum MUST stay in sync with the Prisma Role enum
 * defined in `prisma/schema.prisma`:
 *
 *   enum Role {
 *     STUDENT
 *     EMPLOYER
 *     ADMINISTRATOR
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   requireRoles(Role.ADMINISTRATOR)
 *   requireRoles(Role.EMPLOYER)
 *   requireRoles(Role.STUDENT)
 *   requireRoles(Role.ADMINISTRATOR, Role.EMPLOYER)  // multiple roles
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * TODO (TSK-INF-204): Consider switching to a string literal union type
 * if runtime enum values are not needed. Currently kept as const enum
 * for type safety and IDE autocompletion.
 */
export enum Role {
  STUDENT = "STUDENT",
  EMPLOYER = "EMPLOYER",
  ADMINISTRATOR = "ADMINISTRATOR",
}
