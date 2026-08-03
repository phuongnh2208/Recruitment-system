/**
 * CreateJobPostingUseCase
 *
 * Orchestrates the creation of a new job posting following Clean Architecture
 * principles. All dependencies are injected via the constructor – no concrete
 * implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities, factories, and repository interfaces to fulfill
 * the create job posting flow without containing business logic itself.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USE CASE ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Use Case coordinates the flow:
 *   1. Validate required fields (employerId, title, description,
 *      requirements, location, expiresAt)
 *   2. Create JobPosting entity via JobPostingFactory
 *   3. Persist entity via IJobPostingRepository
 *   4. Log success
 *   5. Return result
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * Repositories abstract away the underlying persistence mechanism.
 * The Use Case depends only on repository interfaces (abstractions),
 * not on concrete implementations (e.g. Prisma, in-memory).
 *
 * ═══════════════════════════════════════════════════════════════════
 * FACTORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Factory centralises domain entity creation, encapsulating
 * construction logic and ensuring every JobPosting entity is created
 * in a consistent, valid state (always DRAFT).
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS RULES (NOT ENFORCED HERE)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The following business rules are NOT enforced in this use case and
 * will be handled in separate tasks:
 *   - Employer existence check
 *   - Employer verified check
 *   - Duplicate job posting check
 *   - Posting quota check
 *
 * ═══════════════════════════════════════════════════════════════════
 * NO BUSINESS LOGIC IN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════
 *
 * All orchestration, validation, and error handling lives here in
 * the Application Layer. The Controller (if any) only delegates
 * to this Use Case and formats the HTTP response.
 *
 * @category Application Use Case
 */

import { IJobPostingRepository } from "../../domain/repositories/job-posting-repository";
import { IEmployerRepository } from "../../../employer/domain/repositories/employer-repository";
import { IAuditLogger } from "../../../../common/interfaces/audit-logger";
import {
  JobPostingFactory,
  CreateJobPostingInput,
} from "../../domain/factories/job-posting-factory";
import {
  ValidationException,
  AuthenticationException,
  BusinessException,
  InfrastructureException,
  NotFoundException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the create job posting use‑case.
 */
export interface CreateJobPostingCommand {
  /** The ID of the employer who owns this job posting. */
  employerId: string;
  /** The job title (max 120 characters). */
  title: string;
  /** The job description. */
  description: string;
  /** The job requirements. */
  requirements: string;
  /** Minimum salary (nullable). */
  salaryMin?: number | null;
  /** Maximum salary (nullable). */
  salaryMax?: number | null;
  /** Currency code (defaults to "VND"). */
  currency?: string;
  /** Job location. */
  location: string;
  /** The expiration date. Must be in the future. */
  expiresAt: Date;
}

/**
 * Output DTO for the create job posting use‑case.
 */
export interface CreateJobPostingResult {
  /** Indicates whether the operation was successful. */
  success: true;
  /** The ID of the created job posting. */
  jobPostingId: string;
}

export class CreateJobPostingUseCase {
  constructor(
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly employerRepository: IEmployerRepository,
    private readonly jobPostingFactory: JobPostingFactory,
    private readonly auditLogger: IAuditLogger,
  ) {}

  /**
   * Execute the create job posting flow.
   *
   * @param command - The create job posting command containing job data.
   * @returns A CreateJobPostingResult indicating successful operation.
   * @throws {ValidationException} If input validation fails.
   * @throws {BusinessException} If a business rule is violated.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: CreateJobPostingCommand): Promise<CreateJobPostingResult> {
    logger.debug({ employerId: command.employerId }, "Create Requested");

    try {
      // ── 1. Validate required fields are not empty ─────────────────
      if (!command.employerId || command.employerId.trim().length === 0) {
        logger.warn("Validation Failure – employerId is required");
        throw new ValidationException("employerId is required");
      }

      if (!command.title || command.title.trim().length === 0) {
        logger.warn("Validation Failure – title is required");
        throw new ValidationException("title is required");
      }

      if (!command.description || command.description.trim().length === 0) {
        logger.warn("Validation Failure – description is required");
        throw new ValidationException("description is required");
      }

      if (!command.requirements || command.requirements.trim().length === 0) {
        logger.warn("Validation Failure – requirements is required");
        throw new ValidationException("requirements is required");
      }

      if (!command.location || command.location.trim().length === 0) {
        logger.warn("Validation Failure – location is required");
        throw new ValidationException("location is required");
      }

      if (!command.expiresAt) {
        logger.warn("Validation Failure – expiresAt is required");
        throw new ValidationException("expiresAt is required");
      }

      const employerProfile = await this.employerRepository.findByUserId(command.employerId);

      if (!employerProfile?.id) {
        logger.warn({ userId: command.employerId }, "Employer profile not found");
        throw new NotFoundException(`Employer profile for user ${command.employerId} not found`);
      }

      // ── 1b. Verify employer is verified (BR-03) ───────────────────
      if (!employerProfile.verified) {
        logger.warn(
          { userId: command.employerId },
          "Employer not verified — cannot create job posting",
        );
        throw new AuthenticationException(
          "Doanh nghiệp chưa được xác thực, không thể đăng tin tuyển dụng",
        );
      }

      // ── 2. Create JobPosting entity via Factory ───────────────────
      const factoryInput: CreateJobPostingInput = {
        employerId: employerProfile.id,
        title: command.title,
        description: command.description,
        requirements: command.requirements,
        salaryMin: command.salaryMin ?? null,
        salaryMax: command.salaryMax ?? null,
        currency: command.currency ?? "VND",
        location: command.location,
        expiresAt: command.expiresAt,
      };

      const jobPosting = this.jobPostingFactory.create(factoryInput);

      // ── 3. Persist entity via Repository ──────────────────────────
      await this.jobPostingRepository.create(jobPosting);

      // ── 4. Log success ────────────────────────────────────────────
      logger.info(
        {
          jobPostingId: jobPosting.id,
          employerId: employerProfile.id,
        },
        "Job Created",
      );

      // ── 4b. Audit log (non-blocking) ──────────────────────────────
      this.auditLogger
        .log(command.employerId, "JOB_CREATED", "JOB_POSTING", jobPosting.id!)
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          logger.warn(
            { jobPostingId: jobPosting.id, error: errorMessage },
            "Failed to write audit log",
          );
        });

      return {
        success: true,
        jobPostingId: jobPosting.id!,
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
        "Unexpected Error during job posting creation",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Job posting creation failed", details);
    }
  }
}
