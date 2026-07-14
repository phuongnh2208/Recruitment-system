/**
 * Infrastructure Repositories — Barrel export.
 *
 * ══════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═════════════════════════════════════════════════════════════════════
 *
 * Provides a single entry point for importing infrastructure-level
 * repository implementations. Consumers (e.g., Composition Root,
 * Use Case factories) import from this barrel rather than reaching
 * into individual files.
 *
 * ═════════════════════════════════════════════════════════════════════
 * USAGE
 * ═════════════════════════════════════════════════════════════════════
 *
 *   import { PrismaUserRepository, PrismaRefreshTokenRepository } from "./infrastructure/repositories";
 *
 * ═════════════════════════════════════════════════════════════════════
 *
 * @category Infrastructure Repository
 */

export { PrismaUserRepository } from "./prisma-user-repository";
export { PrismaRefreshTokenRepository } from "./prisma-refresh-token-repository";
