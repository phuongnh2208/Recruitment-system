/**
 * Job Presentation — Routes barrel exports.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER EXPORTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * This barrel file provides a single entry point for all Job Presentation
 * routes. External modules (composition root, app setup) should import
 * from this file rather than deep-importing individual route files.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE COMPLIANCE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Only the Presentation Layer's public contract is exported:
 *   - Route factory functions
 *
 * No Application, Domain, or Infrastructure code is exposed.
 *
 * @category Presentation Layer
 */

export { createJobRouter } from "./job-routes";
