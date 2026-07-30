/**
 * SubmitJobPostingUseCase
 *
 * Orchestrates the submission of a job posting for approval following
 * Clean Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside
 * the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities and repository interfaces to fulfill the submit
 * job posting flow without containing business logic itself.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USE CASE ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Use Case coordinates the flow:
 *   1. Validate required fields (employerId, jobPostingId)
 *   2. Load job posting via IJobPostingRepository.findById
 *   3. Ownership check (job.employerId === command.employerId)
 *   4. Call entity.submit() business method
 *   5. Persist updated entity via IJobPostingRepository.update
 *   6. Log success
 *   7. Return result
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS RULES (ENFORCED BY ENTITY)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The following business rules are NOT enforced in this use case and
 * are delegated to the Domain Entity:
 *   - State transition validation (DRAFT → SUBMITTED only)
 *
 * If the current state is not DRAFT, JobPosting.submit() will throw
 * ConflictException automatically.
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

import { IJobPostingRepository } from "../../domain/repositories/job-posting-repository";
import {
  ValidationException,
  AuthenticationException,
  NotFoundException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the submit job posting use‑case.
 */
export interface SubmitJobPostingCommand {
  /** The ID of the employer submitting the job posting. */
  employerId: string;
  /** The ID of the job posting to submit. */
  jobPostingId: string;
}

/**
 * Output DTO for the submit job posting use‑case.
 */
export interface SubmitJobPostingResult {
  /** Indicates whether the operation was successful. */
  success: true;
}

export class SubmitJobPostingUseCase {
  constructor(private readonly jobPostingRepository: IJobPostingRepository) {}

  /**
   * Execute the submit job posting flow.
   *
   * @param command - The submit job posting command containing employer and job IDs.
   * @returns A SubmitJobPostingResult indicating successful operation.
   * @throws {ValidationException} If input validation fails.
   * @throws {NotFoundException} If the job posting is not found.
   * @throws {AuthenticationException} If the employer does not own the job posting.
   * @throws {BusinessException} If a business rule is violated (e.g. invalid state transition).
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: SubmitJobPostingCommand): Promise<SubmitJobPostingResult> {
    logger.debug(
      { employerId: command.employerId, jobPostingId: command.jobPostingId },
      "Submit Requested",
    );

    try {
      // ── 1. Validate required fields are not empty ─────────────────
      if (!command.employerId || command.employerId.trim().length === 0) {
        logger.warn("Validation Failure – employerId is required");
        throw new ValidationException("employerId is required");
      }

      if (!command.jobPostingId || command.jobPostingId.trim().length === 0) {
        logger.warn("Validation Failure – jobPostingId is required");
        throw new ValidationException("jobPostingId is required");
      }

      // ── 2. Load job posting via Repository ────────────────────────
      const job = await this.jobPostingRepository.findById(command.jobPostingId);

      if (!job) {
        logger.warn({ jobPostingId: command.jobPostingId }, "Job Not Found");
        throw new NotFoundException("Job posting not found");
      }

      // ── 3. Ownership check ────────────────────────────────────────
      if (job.employerId !== command.employerId) {
        logger.warn(
          {
            jobPostingId: command.jobPostingId,
            employerId: command.employerId,
            jobOwnerId: job.employerId,
          },
          "Unauthorized Submit",
        );
        throw new AuthenticationException("You are not authorized to submit this job posting");
      }

      // ── 4. Call entity business method ────────────────────────────
      // JobPosting.submit() validates state transition (DRAFT → SUBMITTED)
      // and throws ConflictException if the current state is not DRAFT.
      job.submit();

      // ── 5. Persist updated entity via Repository ──────────────────
      await this.jobPostingRepository.update(job);

      // ── 6. Log success ────────────────────────────────────────────
      logger.info(
        {
          jobPostingId: command.jobPostingId,
          employerId: command.employerId,
        },
        "Job Submitted",
      );

      return {
        success: true,
      };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException ||
        error instanceof NotFoundException ||
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

      throw new InfrastructureException("Job posting submission failed", details);
    }
  }
}
