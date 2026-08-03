/**
 * GetJobDetailUseCase
 *
 * Orchestrates retrieving a single JobPosting by its ID for the Student
 * to view full job details, following Clean Architecture principles.
 * All dependencies are injected via the constructor – no concrete
 * implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ══════════════════════════════════════════════════════════════════
 *
 * 1. Validate jobId (must not be empty)
 * 2. Log debug "Job Detail Requested"
 * 3. Call jobPostingRepository.findById(jobId)
 * 4. If null → throw NotFoundException
 * 5. Check job.state === APPROVED
 *    - If not → throw NotFoundException (hide existence of non-approved jobs)
 * 6. Fetch employer profile using employerId from job
 * 7. Map employer details to job object
 * 8. Log info "Job Detail Loaded"
 * 9. Return enhanced job with employer details
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
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ══════════════════════════════════════════════════════════════════
 *
 * - IJobPostingRepository (Domain Interface)
 * - IEmployerRepository (Domain Interface)
 *
 * No Prisma. No concrete repository.
 *
 * @category Application Use Case
 */

import { JobPosting } from "../../../job/domain";
import {
  ValidationException,
  NotFoundException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";
import type { IEmployerRepository } from "../../../employer/domain/repositories/employer-repository";
import type { IJobPostingRepository } from "../../../job/domain/repositories/job-posting-repository";

/**
 * Repository interface for JobPosting entity queries.
 *
 * ═════════════════════════════════════════════════════════════════════
 * NOTE: This interface is defined here temporarily and will be moved
 * to the Job module's domain layer
 * (src/modules/job/domain/repositories/)
 * as part of a future task. It is placed here to avoid creating
 * additional files outside the scope of this task.
 * ═════════════════════════════════════════════════════════════════════
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
  /** The job posting entity with employer details. */
  job: JobPosting & {
    /** Company/employer name. */
    companyName: string;
    /** Company description. */
    companyDescription?: string;
    /** Company website. */
    website?: string;
    /** Company address. */
    companyAddress?: string;
    /** Company logo URL. */
    logoUrl?: string;
    /** Whether the employer is verified. */
    employerVerified: boolean;
  };
}

export class GetJobDetailUseCase {
  constructor(
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly employerRepository: IEmployerRepository,
  ) {}

  /**
   * Retrieve the full details of a job posting by its ID.
   *
   * Only returns job postings in the APPROVED state. All other states
   * (DRAFT, PENDING, REJECTED, CLOSED, EXPIRED) result in a
   * NotFoundException to hide the job's existence from Students.
   *
   * @param command - The command containing the job ID.
   * @returns The job posting details with employer information.
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
      const job = await this.jobPostingRepository.findById(command.jobId);

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
      if (!job.state.isVisible()) {
        logger.warn(
          {
            jobId: command.jobId,
          },
          "Job Not Found",
        );
        throw new NotFoundException("Job not found");
      }

      // ── 6. Fetch employer profile ─────────────────────────────────
      const employer = await this.employerRepository.findById(job.employerId);

      // ── 7. Map employer details to job object ───────────────────────
      const enhancedJob = {
        ...job,
        companyName: employer?.companyName ?? "",
        companyDescription: employer?.description ?? undefined,
        website: employer?.website ?? undefined,
        companyAddress: undefined,
        logoUrl: employer?.logoUrl ?? undefined,
        employerVerified: employer?.verified ?? false,
      };

      // ── 8. Log success ─────────────────────────────────────────────
      logger.info(
        {
          jobId: command.jobId,
        },
        "Job Detail Loaded",
      );

      // ── 9. Return result ───────────────────────────────────────────
      return {
        job: enhancedJob as JobPosting & {
          companyName: string;
          companyDescription?: string;
          website?: string;
          companyAddress?: string;
          logoUrl?: string;
          employerVerified: boolean;
        },
      };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (
        error instanceof ValidationException ||
        error instanceof NotFoundException ||
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

      throw new InfrastructureException("Failed to get job detail", details);
    }
  }
}
