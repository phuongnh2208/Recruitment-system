/**
 * GetJobDetailUseCase
 *
 * Orchestrates retrieving a single JobPosting by its ID for the Student
 * to view full job details, following Clean Architecture principles.
 * All dependencies are injected via the constructor – no concrete
 * implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * the repository to fulfill the get job detail use case without
 * containing business logic itself.
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
 * IJobRepository is injected via the constructor. The Use Case has
 * zero knowledge of how the repository is implemented or which
 * database is used.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Validate jobId (must not be empty)
 *   2. Log debug "Job Detail Requested"
 *   3. Call repository.findById(jobId)
 *   4. If null → throw NotFoundException
 *   5. Check job.state === APPROVED
 *      - If not → throw NotFoundException (hide existence of non-approved jobs)
 *   6. Log info "Job Detail Loaded"
 *   7. Return { job }
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY ONLY APPROVED JOBS ARE RETURNED (FR-ST-07)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Per FR-ST-07, a Student must only be able to view job postings that
 * have been approved. Jobs in DRAFT, PENDING, REJECTED, CLOSED, or
 * EXPIRED states must not be visible to Students.
 *
 * To avoid leaking information about a job's existence or its current
 * state, a NotFoundException is thrown instead of a more specific
 * error (e.g. ForbiddenException). This ensures that a Student cannot
 * distinguish between "the job does not exist" and "the job exists
 * but is not approved", thereby hiding the existence of unapproved
 * jobs entirely.
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

import { JobPosting, JobPostingState } from "../../../../modules/job/domain/job-posting";
import {
  ValidationException,
  NotFoundException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Repository interface for JobPosting entity queries.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NOTE: This interface is defined here temporarily and will be moved
 * to the Job module's domain layer
 * (src/modules/job/domain/repositories/)
 * as part of a future task. It is placed here to avoid creating
 * additional files outside the scope of this task.
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Repository Interface
 */
export interface IJobRepository {
  /**
   * Find a job posting by its unique identifier.
   *
   * @param id - The unique identifier of the job posting.
   * @returns The JobPosting entity if found, or `null` if not.
   */
  findById(id: string): Promise<JobPosting | null>;
}

/**
 * Input DTO for getting job detail.
 */
export interface GetJobDetailCommand {
  /** The unique identifier of the job posting. */
  jobId: string;
}

/**
 * Output DTO for getting job detail.
 */
export interface GetJobDetailResult {
  /** The job posting entity. */
  job: JobPosting;
}

export class GetJobDetailUseCase {
  constructor(private readonly jobRepository: IJobRepository) {}

  /**
   * Retrieve the full details of a job posting by its ID.
   *
   * Only returns job postings in the APPROVED state. All other states
   * (DRAFT, PENDING, REJECTED, CLOSED, EXPIRED) result in a
   * NotFoundException to hide the job's existence from Students.
   *
   * @param command - The command containing the job ID.
   * @returns The job posting details.
   * @throws {ValidationException} If input validation fails.
   * @throws {NotFoundException} If the job is not found or not approved.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: GetJobDetailCommand): Promise<GetJobDetailResult> {
    try {
      // ── 1. Validate jobId ──────────────────────────────────────────
      if (!command.jobId || command.jobId.trim().length === 0) {
        logger.warn("Validation Failure – jobId is required");
        throw new ValidationException("jobId is required");
      }

      // ── 2. Log request ─────────────────────────────────────────────
      logger.debug(
        {
          jobId: command.jobId,
        },
        "Job Detail Requested",
      );

      // ── 3. Fetch job from repository ───────────────────────────────
      const job = await this.jobRepository.findById(command.jobId);

      // ── 4. Check existence ─────────────────────────────────────────
      if (!job) {
        logger.warn(
          {
            jobId: command.jobId,
          },
          "Job Not Found",
        );
        throw new NotFoundException("Job not found");
      }

      // ── 5. Verify job is APPROVED (FR-ST-07) ───────────────────────
      // Throw NotFoundException to hide the existence of non-approved jobs
      if (job.state !== JobPostingState.APPROVED) {
        logger.warn(
          {
            jobId: command.jobId,
          },
          "Job Not Found",
        );
        throw new NotFoundException("Job not found");
      }

      // ── 6. Log success ─────────────────────────────────────────────
      logger.info(
        {
          jobId: command.jobId,
        },
        "Job Detail Loaded",
      );

      // ── 7. Return result ───────────────────────────────────────────
      return { job };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (
        error instanceof ValidationException ||
        error instanceof NotFoundException ||
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
        "Unexpected Error during job detail retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to retrieve job detail", details);
    }
  }
}
