/**
 * RejectJobPostingUseCase
 *
 * Orchestrates the job posting rejection flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Validate jobId, rejectionReason must not be empty.
 * 2. Find the job posting by jobId.
 * 3. Verify the job posting exists.
 * 4. Verify the job posting state is SUBMITTED.
 * 5. Update job approval status to REJECTED with rejection reason.
 * 6. Log success.
 * 7. Return { success: true }.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - IAdminRepository (Domain Interface)
 *
 * No Prisma. No concrete repository.
 *
 * @category Application Use Case
 */

import { IAdminRepository } from "../../domain/repositories/admin-repository";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input command for rejecting a job posting.
 */
export interface RejectJobPostingCommand {
  /** The ID of the job posting to reject. */
  jobId: string;
  /** The ID of the admin performing the rejection. */
  adminId: string;
  /** The reason for rejection. */
  rejectionReason: string;
}

/**
 * Result returned after a successful job posting rejection.
 */
export interface RejectJobPostingResult {
  success: true;
}

export class RejectJobPostingUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(command: RejectJobPostingCommand): Promise<RejectJobPostingResult> {
    try {
      // ── Step 1: Validate input ──────────────────────────────────────────
      this.validateInput(command);

      logger.debug(
        {
          jobId: command.jobId,
          adminId: command.adminId,
        },
        "Job Posting Rejection Requested",
      );

      // ── Step 2: Find the job posting ────────────────────────────────────
      const job = await this.adminRepository.findJobById(command.jobId);

      // ── Step 3: Verify job posting exists ───────────────────────────────
      if (!job) {
        logger.warn(
          {
            jobId: command.jobId,
          },
          "Job Posting Not Found",
        );
        throw new NotFoundException(`Job posting ${command.jobId} not found`);
      }

      // ── Step 4: Verify job posting state is SUBMITTED ───────────────────
      if (job.state !== "SUBMITTED") {
        logger.warn(
          {
            jobId: command.jobId,
            currentState: job.state,
          },
          "Job Posting Not in SUBMITTED State",
        );
        throw new ConflictException(
          `Job posting ${command.jobId} is in state ${job.state}, expected SUBMITTED`,
        );
      }

      // ── Step 5: Update job approval status to REJECTED ──────────────────
      await this.adminRepository.updateJobApproval(
        command.jobId,
        "REJECTED",
        command.adminId,
        command.rejectionReason,
      );

      // ── Step 6: Log success ─────────────────────────────────────────────
      logger.info(
        {
          jobId: command.jobId,
          adminId: command.adminId,
        },
        "Job Posting Rejected",
      );

      // ── Step 7: Return result ───────────────────────────────────────────
      return {
        success: true,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BusinessException
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
        "Unexpected Error during job posting rejection",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Job posting rejection failed", details);
    }
  }

  /**
   * Validate that the required fields are not empty.
   *
   * @param command - The input command to validate.
   * @throws {ValidationException} If any required field is empty.
   */
  private validateInput(command: RejectJobPostingCommand): void {
    if (!command.jobId || command.jobId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("jobId is required");
    }

    if (!command.adminId || command.adminId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("adminId is required");
    }

    if (!command.rejectionReason || command.rejectionReason.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("rejectionReason is required");
    }
  }
}
