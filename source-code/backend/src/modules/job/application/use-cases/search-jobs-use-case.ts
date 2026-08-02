/**
 * SearchJobsUseCase
 *
 * Orchestrates the search for approved job postings following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities and repository interfaces to fulfill the search
 * jobs flow without containing business logic itself.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USE CASE ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Use Case coordinates the flow:
 *   1. Validate pagination parameters (page >= 1, limit >= 1)
 *   2. Create SearchCriteria with state = APPROVED (enforced business rule)
 *   3. Execute repository.search(criteria)
 *   4. Log success
 *   5. Return result
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS RULES (ENFORCED BY USE CASE)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The following business rules are enforced in this use case:
 *   - Only APPROVED jobs are searchable (BR-04)
 *   - Students cannot search Draft, Submitted, Rejected, or Closed jobs
 *   - State is always set to APPROVED regardless of client input
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * Repositories abstract away the underlying persistence mechanism.
 * The Use Case depends only on repository interfaces (abstractions),
 * not on concrete implementations (e.g. PrismaJobPostingRepository).
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * Only IJobPostingRepository is injected. No Factory is injected.
 *
 * @category Application Use Case
 */

import {
  IJobPostingRepository,
  JobSearchCriteria,
} from "../../domain/repositories/job-posting-repository";
import {
  ValidationException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the search jobs use‑case.
 */
export interface SearchJobsCommand {
  /** Page number (1-based). */
  page: number;
  /** Number of items per page. */
  limit: number;
  /** Free-text search keyword (optional). */
  keyword?: string;
  /** Location filter (optional). */
  location?: string;
  /** Employer ID filter (optional). */
  employerId?: string;
  /** Minimum salary filter (optional). */
  salaryMin?: number;
  /** Maximum salary filter (optional). */
  salaryMax?: number;
}

/**
 * Output DTO for the search jobs use‑case.
 */
export interface SearchJobsResult {
  /** Array of matching job postings. */
  jobs: {
    id: string;
    employerId: string;
    title: string;
    description: string;
    requirements: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    state: string;
    expiresAt: Date;
    createdAt: Date;
  }[];
}

export class SearchJobsUseCase {
  constructor(private readonly jobPostingRepository: IJobPostingRepository) {}

  /**
   * Execute the search jobs flow.
   *
   * @param command - The search command containing pagination and filter parameters.
   * @returns A SearchJobsResult containing matching job postings.
   * @throws {ValidationException} If input validation fails (page < 1, limit < 1).
   * @throws {BusinessException} If a business rule is violated.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: SearchJobsCommand): Promise<SearchJobsResult> {
    logger.debug(
      {
        page: command.page,
        limit: command.limit,
        keyword: command.keyword,
        location: command.location,
        salaryMin: command.salaryMin,
        salaryMax: command.salaryMax,
      },
      "Search Requested",
    );

    try {
      // ── 1. Validate pagination parameters ───────────────────────────
      if (command.page < 1) {
        logger.warn("Validation Failure – page must be >= 1");
        throw new ValidationException("page must be >= 1");
      }

      if (command.limit < 1) {
        logger.warn("Validation Failure – limit must be >= 1");
        throw new ValidationException("limit must be >= 1");
      }

      // ── 2. Create SearchCriteria with enforced state = APPROVED ─────
      // Business Rule: Students can only search for APPROVED jobs (BR-04)
      // State is always set to APPROVED regardless of client input
      const criteria: JobSearchCriteria = {
        keyword: command.keyword,
        location: command.location,
        employerId: command.employerId,
        salaryMin: command.salaryMin,
        salaryMax: command.salaryMax,
        state: "APPROVED",
      };

      // ── 3. Execute repository search with pagination ────────────────
      const result = await this.jobPostingRepository.search(criteria, command.page, command.limit);

      // ── 4. Log success ──────────────────────────────────────────────
      logger.info(
        {
          page: command.page,
          limit: command.limit,
          resultCount: result.items.length,
          total: result.total,
        },
        "Search Completed",
      );

      // ── 5. Return result ────────────────────────────────────────────
      return {
        jobs: result.items.map((job) => ({
          id: job.id!,
          employerId: job.employerId,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.currency,
          state: job.state.value,
          expiresAt: job.expiresAt,
          createdAt: job.createdAt,
        })),
      };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (
        error instanceof ValidationException ||
        error instanceof BusinessException ||
        error instanceof InfrastructureException
      ) {
        throw error;
      }

      // Unknown errors are wrapped in InfrastructureException
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Job search failed", details);
    }
  }
}
