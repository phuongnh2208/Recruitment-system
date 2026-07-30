/**
 * Job Presentation — Controllers barrel exports.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER EXPORTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * This barrel file provides a single entry point for all Job Presentation
 * controllers. External modules (composition root, routes) should import
 * from this file rather than deep-importing individual controller files.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE COMPLIANCE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Only the Presentation Layer's public contract is exported:
 *   - Controllers (HTTP request handlers)
 *
 * No Application, Domain, or Infrastructure code is exposed.
 *
 * @category Presentation Layer
 */

export { JobController } from "./job-controller";
