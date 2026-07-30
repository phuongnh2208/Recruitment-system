/**
 * Job Domain — barrel exports.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DOMAIN LAYER EXPORTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * This barrel file provides a single entry point for all Job Domain
 * types. External modules (Application, Presentation, Infrastructure)
 * should import from this file rather than deep-importing individual
 * files.
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
export { JobPosting } from "./entities/job-posting";
export type { JobPostingProps } from "./entities/job-posting";

// ── Value Objects ──────────────────────────────────────────────────
export { JobState } from "./value-objects/job-state";
export type { JobStateValue } from "./value-objects/job-state";

// ── Repository Interfaces ──────────────────────────────────────────
export { IJobPostingRepository } from "./repositories/job-posting-repository";
export type { JobSearchCriteria, PaginatedJobResult } from "./repositories/job-posting-repository";

// ── Factories ──────────────────────────────────────────────────────
export { JobPostingFactory } from "./factories/job-posting-factory";
export type { CreateJobPostingInput } from "./factories/job-posting-factory";
