/**
 * Job Module Composition — Barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Provides a single entry point for importing the Job Module's
 * Composition Root. Consumers (e.g. main.ts) import from this barrel
 * rather than reaching into individual files.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import { createJobModule } from "./modules/job/composition";
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Composition Root
 */

export { createJobModule } from "./job-module";
export type { JobModule } from "./job-module";
