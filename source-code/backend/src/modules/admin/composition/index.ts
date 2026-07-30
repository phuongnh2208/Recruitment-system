/**
 * Admin Composition barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Composition Root is the single entry point where all dependencies
 * for the Admin module are wired together. It is the **only** place
 * permitted to use the `new` keyword to instantiate concrete classes.
 *
 * @category Composition
 */
export { createAdminModule } from "./admin-module";
export type { AdminModuleDependencies, AdminModuleOutput } from "./admin-module";
