/**
 * UpdateJobPostingUseCase
 *
 * Orchestrates the update of a job posting following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities and repository interfaces to fulfill the update
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
 *   4. Check if job is editable via job.state.isEditable()
 *   5. Call entity business methods for each provided field
 *   6. Persist updated entity via IJobPostingRepository.update
 *   7. Log success
 *   8. Return result
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS RULES (ENFORCED BY ENTITY)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The following business rules are NOT enforced in this use case and
 * are delegated to the Domain Entity:
 *   - Field validation (empty check, length, range, etc.)
 *   - State transition validation (editable check)
 *
 * If the job is not editable, JobState.isEditable() will return false
 * and the use case throws ConflictException.
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
import { IEmployerRepository } from "../../../employer/domain/repositories/employer-repository";
import {
  ValidationException,
  AuthenticationException,
  NotFoundException,
  ConflictException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the update job posting use‑case.
 */
export interface UpdateJobPostingCommand {
  /** The ID of the employer updating the job posting. */
  employerId: string;
  /** The ID of the job posting to update. */
  jobPostingId: string;
  /** The new title (optional). */
  title?: string;
  /** The new description (optional). */
  description?: string;
  /** The new requirements (optional). */
  requirements?: string;
  /** The new salary minimum (optional). */
  salaryMin?: number | null;
  /** The new salary maximum (optional). */
  salaryMax?: number | null;
  /** The new location (optional). */
  location?: string;
  /** The new expiration date (optional). */
  expiresAt?: Date;
}

/**
 * Output DTO for the update job posting use‑case.
 */
export interface UpdateJobPostingResult {
  /** Indicates whether the operation was successful. */
  success: true;
}

export class UpdateJobPostingUseCase {
  constructor(
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly employerRepository: IEmployerRepository,
  ) {}

  /**
   * Execute the update job posting flow.
   *
   * @param command - The update job posting command containing employer ID,
   *                  job posting ID, and optional fields to update.
   * @returns An UpdateJobPostingResult indicating successful operation.
   * @throws {ValidationException} If input validation fails.
   * @throws {NotFoundException} If the job posting is not found.
   * @throws {AuthenticationException} If the employer does not own the job posting.
   * @throws {ConflictException} If the job posting is not in an editable state.
   * @throws {BusinessException} If a business rule is violated.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: UpdateJobPostingCommand): Promise<UpdateJobPostingResult> {
    logger.debug(
      { employerId: command.employerId, jobPostingId: command.jobPostingId },
      "Update Requested",
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

      const employerProfile = await this.employerRepository.findByUserId(command.employerId);

      if (!employerProfile?.id) {
        logger.warn({ userId: command.employerId }, "Employer profile not found");
        throw new NotFoundException(`Employer profile for user ${command.employerId} not found`);
      }

      // ── 2. Load job posting via Repository ────────────────────────
      const job = await this.jobPostingRepository.findById(command.jobPostingId);

      if (!job) {
        logger.warn({ jobPostingId: command.jobPostingId }, "Job Not Found");
        throw new NotFoundException("Job posting not found");
      }

      // ── 3. Ownership check ────────────────────────────────────────
      if (job.employerId !== employerProfile.id) {
        logger.warn(
          {
            jobPostingId: command.jobPostingId,
            employerId: employerProfile.id,
            jobOwnerId: job.employerId,
          },
          "Unauthorized Update",
        );
        throw new AuthenticationException("You are not authorized to update this job posting");
      }

      // ── 4. Check if job is editable ───────────────────────────────
      if (!job.state.isEditable()) {
        logger.warn(
          { jobPostingId: command.jobPostingId, state: job.state.toString() },
          "Job Not Editable",
        );
        throw new ConflictException(
          `Cannot update job posting: current state is ${job.state}, expected DRAFT or REJECTED`,
        );
      }

      // ── 5. Call entity business methods for each provided field ───
      // Only update fields that were explicitly provided in the command.
      // Business methods validate the values and throw ValidationException if invalid.
      if (command.title !== undefined) {
        job.updateTitle(command.title);
      }

      if (command.description !== undefined) {
        job.updateDescription(command.description);
      }

      if (command.requirements !== undefined) {
        job.updateRequirements(command.requirements);
      }

      if (command.salaryMin !== undefined || command.salaryMax !== undefined) {
        job.updateSalaryRange(command.salaryMin ?? null, command.salaryMax ?? null);
      }

      if (command.location !== undefined) {
        job.updateLocation(command.location);
      }

      if (command.expiresAt !== undefined) {
        job.updateExpiresAt(command.expiresAt);
      }

      // ── 6. Persist updated entity via Repository ──────────────────
      await this.jobPostingRepository.update(job);

      // ── 7. Log success ────────────────────────────────────────────
      logger.info(
        {
          jobPostingId: command.jobPostingId,
          employerId: employerProfile.id,
        },
        "Job Updated",
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
        error instanceof ConflictException ||
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

      throw new InfrastructureException("Job posting update failed", details);
    }
  }
}
