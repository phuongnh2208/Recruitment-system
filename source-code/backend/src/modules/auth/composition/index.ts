/**
 * Auth Module Composition — Barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Provides a single entry point for importing the Auth Module's
 * Composition Root. Consumers (e.g. main.ts) import from this barrel
 * rather than reaching into individual files.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import { createAuthModule } from "./modules/auth/composition";
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Composition Root
 */

export { createAuthModule } from "./auth-module";
export type { AuthModule } from "./auth-module";
