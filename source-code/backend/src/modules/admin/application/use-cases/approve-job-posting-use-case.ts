/**
 * ApproveJobPostingUseCase
 *
 * Orchestrates the job posting approval flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Validate jobId must not be empty.
 * 2. Find the job posting by jobId.
 * 3. Verify the job posting exists.
 * 4. Verify the job posting state is SUBMITTED.
 * 5. Update job approval status to APPROVED.
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
import { IAuditLogger } from "../../../../common/interfaces/audit-logger";
import {
  INotificationStrategy,
  NotificationMessage,
} from "../../../../common/interfaces/notification-strategy";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input command for approving a job posting.
 */
export interface ApproveJobPostingCommand {
  /** The ID of the job posting to approve. */
  jobId: string;
  /** The ID of the admin performing the approval. */
  adminId: string;
}

/**
 * Result returned after a successful job posting approval.
 */
export interface ApproveJobPostingResult {
  success: true;
}

export class ApproveJobPostingUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly auditLogger: IAuditLogger,
    private readonly notificationStrategy: INotificationStrategy,
  ) {}

  async execute(command: ApproveJobPostingCommand): Promise<ApproveJobPostingResult> {
    try {
      // ── Step 1: Validate input ──────────────────────────────────────────
      this.validateInput(command);

      logger.debug(
        {
          jobId: command.jobId,
          adminId: command.adminId,
        },
        "Job Posting Approval Requested",
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

      // ── Step 5: Update job approval status to APPROVED ──────────────────
      await this.adminRepository.updateJobApproval(command.jobId, "APPROVED", command.adminId);

      // ── Step 6: Log success ─────────────────────────────────────────────
      logger.info(
        {
          jobId: command.jobId,
          adminId: command.adminId,
        },
        "Job Posting Approved",
      );

      // ── Step 6b: Audit log (non-blocking) ──────────────────────────────
      this.auditLogger
        .log(command.adminId, "JOB_APPROVED", "JOB_POSTING", command.jobId)
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          logger.warn({ jobId: command.jobId, error: errorMessage }, "Failed to write audit log");
        });

      // ── Step 6c: Send notification (non-blocking) ─────────────────────
      const notification: NotificationMessage = {
        userId: job.employer.user.id,
        title: "Tin tuyển dụng đã được duyệt",
        message: `Tin tuyển dụng "${job.title}" của bạn đã được duyệt và đang hiển thị công khai.`,
        type: "job_approved",
        metadata: { email: job.employer.user.email },
      };
      this.notificationStrategy.send(notification).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger.warn(
          { jobId: command.jobId, error: errorMessage },
          "Failed to send job approval notification",
        );
      });

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
        "Unexpected Error during job posting approval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Job posting approval failed", details);
    }
  }

  /**
   * Validate that the required fields are not empty.
   *
   * @param command - The input command to validate.
   * @throws {ValidationException} If any required field is empty.
   */
  private validateInput(command: ApproveJobPostingCommand): void {
    if (!command.jobId || command.jobId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("jobId is required");
    }

    if (!command.adminId || command.adminId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("adminId is required");
    }
  }
}
