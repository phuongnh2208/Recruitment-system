/**
 * Admin Presentation Layer barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This module belongs to the outermost layer (Presentation / Interface
 * Adapters). Controllers translate HTTP requests into use‑case
 * invocations and format responses — they contain zero business logic,
 * zero repository calls, and zero database access.
 *
 * @category Presentation
 */
export { AdminController } from "./controllers";
export { createAdminRouter } from "./routes";
