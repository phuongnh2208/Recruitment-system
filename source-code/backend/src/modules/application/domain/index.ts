/**
 * Application Domain — barrel exports.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DOMAIN LAYER EXPORTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * This barrel file provides a single entry point for all Application
 * Domain types. External modules (Application, Presentation,
 * Infrastructure) should import from this file rather than
 * deep-importing individual files.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE COMPLIANCE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Only the Domain Layer's public contract is exported:
 *   - Entities (Rich Domain Model)
 *   - Value Objects
 *   - Repository Interfaces
 *   - Factories
 *
 * No Infrastructure, Prisma, or framework-specific code is exposed.
 *
 * @category Domain Layer
 */

// ── Entities ───────────────────────────────────────────────────────
export { Application } from "./entities/application";
export type { ApplicationProps } from "./entities/application";

// ── Value Objects ──────────────────────────────────────────────────
export { ApplicationState } from "./value-objects/application-state";
export type { ApplicationStateValue } from "./value-objects/application-state";

// ── Repository Interfaces ──────────────────────────────────────────
export { IApplicationRepository } from "./repositories/application-repository";

// ── Factories ──────────────────────────────────────────────────────
export { ApplicationFactory } from "./factories/application-factory";
export type { CreateApplicationInput } from "./factories/application-factory";
