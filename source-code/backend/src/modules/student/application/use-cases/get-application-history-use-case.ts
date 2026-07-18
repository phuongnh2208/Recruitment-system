/**
 * GetApplicationHistoryUseCase
 *
 * Orchestrates retrieving a student's application history with pagination,
 * following Clean Architecture principles. All dependencies are injected
 * via the constructor – no concrete implementations are instantiated inside
 * the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * the repository to fulfill the get application history use case
 * without containing business logic itself.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGINATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * Pagination is handled at the repository level. The Use Case only
 * calculates totalPages from the total count returned by the repository.
 * This keeps the Use Case focused on orchestration rather than
 * data-access logic.
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * The repository abstracts away the underlying persistence mechanism.
 * The Use Case depends only on the repository interface (abstraction),
 * not on concrete implementations (e.g. Prisma, in-memory).
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * IApplicationRepository is injected via the constructor. The Use Case
 * has zero knowledge of how the repository is implemented or which
 * database is used.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Validate input (studentId, page, limit)
 *   2. Call repository.findByStudentIdPaginated(studentId, page, limit)
 *   3. Calculate totalPages = Math.ceil(total / limit)
 *   4. Return GetApplicationHistoryResult
 *
 * ═══════════════════════════════════════════════════════════════════
 * NO BUSINESS LOGIC IN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════
 *
 * All orchestration, validation, and business flow logic lives here in
 * the Application Layer. The Controller (if any) only delegates
 * to this Use Case and formats the HTTP response.
 *
 * @category Application Use Case
 */

import { Application } from "../../../application/domain/application";
import {
  ValidationException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Repository interface for Application entity paginated queries.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NOTE: This interface is defined here temporarily and will be moved
 * to the Application module's domain layer
 * (src/modules/application/domain/repositories/)
 * as part of TSK-APP-101. It is placed here to avoid creating
 * additional files outside the scope of this task.
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Repository Interface
 */
export interface IApplicationRepository {
  /**
   * Find applications for a student with pagination.
   *
   * @param studentId - The unique identifier of the student.
   * @param page      - The page number (1-based).
   * @param limit     - The number of items per page.
   * @returns An object containing the items array and total count.
   */
  findByStudentIdPaginated(
    studentId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Application[]; total: number }>;
}

/**
 * Input DTO for getting application history.
 */
export interface GetApplicationHistoryCommand {
  /** The unique identifier of the student. */
  studentId: string;
  /** The page number (1-based). */
  page: number;
  /** The number of items per page. */
  limit: number;
}

/**
 * Output DTO for getting application history.
 */
export interface GetApplicationHistoryResult {
  /** The list of applications for the current page. */
  items: Application[];
  /** The current page number. */
  page: number;
  /** The number of items per page. */
  limit: number;
  /** The total number of items across all pages. */
  total: number;
  /** The total number of pages. */
  totalPages: number;
}

export class GetApplicationHistoryUseCase {
  constructor(private readonly applicationRepository: IApplicationRepository) {}

  /**
   * Retrieve the application history for a student with pagination.
   *
   * @param command - The command containing studentId, page, and limit.
   * @returns A paginated list of applications.
   * @throws {ValidationException} If input validation fails.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: GetApplicationHistoryCommand): Promise<GetApplicationHistoryResult> {
    try {
      // ── 1. Validate studentId ──────────────────────────────────────
      if (!command.studentId || command.studentId.trim().length === 0) {
        logger.warn("Validation Failure – studentId is required");
        throw new ValidationException("studentId is required");
      }

      // ── 2. Validate page ───────────────────────────────────────────
      if (command.page < 1) {
        logger.warn("Validation Failure – page must be >= 1");
        throw new ValidationException("page must be >= 1");
      }

      // ── 3. Validate limit ──────────────────────────────────────────
      if (command.limit < 1) {
        logger.warn("Validation Failure – limit must be >= 1");
        throw new ValidationException("limit must be >= 1");
      }

      // ── 4. Log request ─────────────────────────────────────────────
      logger.debug(
        {
          studentId: command.studentId,
          page: command.page,
          limit: command.limit,
        },
        "History Requested",
      );

      // ── 5. Fetch paginated data from repository ────────────────────
      const { items, total } = await this.applicationRepository.findByStudentIdPaginated(
        command.studentId,
        command.page,
        command.limit,
      );

      // ── 6. Calculate total pages ───────────────────────────────────
      const totalPages = Math.ceil(total / command.limit);

      // ── 7. Log success ─────────────────────────────────────────────
      logger.info(
        {
          studentId: command.studentId,
          count: items.length,
          page: command.page,
        },
        "History Loaded",
      );

      // ── 8. Return result ───────────────────────────────────────────
      return {
        items,
        page: command.page,
        limit: command.limit,
        total,
        totalPages,
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

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during application history retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to retrieve application history", details);
    }
  }
}
