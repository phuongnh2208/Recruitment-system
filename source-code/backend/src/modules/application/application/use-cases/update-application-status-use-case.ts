/**
 * UpdateApplicationStatusUseCase
 *
 * Orchestrates the application status update flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate employerId, applicationId, status must not be empty.
 * 2. Find the application by applicationId.
 * 3. Verify the application exists.
 * 4. Ownership check: Application must belong to a Job owned by the
 *    current Employer (BR-09).
 * 5. Apply the requested status transition via the entity's business
 *    methods (review, accept, reject).
 * 6. Persist the updated application.
 * 7. Log success.
 * 8. Return { success: true }.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * - IApplicationRepository  (Domain Interface)
 * - IJobPostingRepository    (Domain Interface)
 *
 * No Prisma. No concrete repository.
 *
 * @category Application Use Case
 */

import { IApplicationRepository } from "../../domain/repositories/application-repository";
import { IJobPostingRepository } from "../../../job/domain/repositories/job-posting-repository";
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
 * Allowed status values for updating an application.
 */
export type UpdateApplicationStatusValue = "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";

/**
 * Input command for updating an application's status.
 */
export interface UpdateApplicationStatusCommand {
  /** The ID of the employer performing the update. */
  employerId: string;
  /** The ID of the application to update. */
  applicationId: string;
  /** The target status to apply. */
  status: UpdateApplicationStatusValue;
  /** The reason for rejection (required when status is REJECTED). */
  reason?: string;
}

/**
 * Result returned after a successful status update.
 */
export interface UpdateApplicationStatusResult {
  success: true;
}

export class UpdateApplicationStatusUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly jobPostingRepository: IJobPostingRepository,
  ) {}

  async execute(command: UpdateApplicationStatusCommand): Promise<UpdateApplicationStatusResult> {
    try {
      // ── Step 1: Validate input ──────────────────────────────────
      this.validateInput(command);

      logger.debug(
        {
          employerId: command.employerId,
          applicationId: command.applicationId,
          status: command.status,
        },
        "Status Update Requested",
      );

      // ── Step 2: Find the application ────────────────────────────
      const application = await this.applicationRepository.findById(command.applicationId);

      // ── Step 3: Verify application exists ───────────────────────
      if (!application) {
        logger.warn(
          {
            applicationId: command.applicationId,
          },
          "Application Not Found",
        );
        throw new NotFoundException(`Application ${command.applicationId} not found`);
      }

      // ── Step 4: Ownership check (BR-09) ─────────────────────────
      const job = await this.jobPostingRepository.findById(application.jobPostingId);

      if (!job) {
        logger.warn(
          {
            jobPostingId: application.jobPostingId,
            applicationId: command.applicationId,
          },
          "Application Not Found",
        );
        throw new NotFoundException(
          `Job posting ${application.jobPostingId} not found for application ${command.applicationId}`,
        );
      }

      if (job.employerId !== command.employerId) {
        logger.warn(
          {
            employerId: command.employerId,
            applicationId: command.applicationId,
            jobPostingId: application.jobPostingId,
          },
          "Unauthorized Status Update",
        );
        throw new AuthenticationException(
          "You are not authorized to update the status of this application",
        );
      }

      // ── Step 5: Apply status transition via business methods ────
      this.applyStatusTransition(application, command);

      // ── Step 6: Persist the updated application ─────────────────
      await this.applicationRepository.update(application);

      // ── Step 7: Log success ─────────────────────────────────────
      logger.info(
        {
          applicationId: command.applicationId,
          employerId: command.employerId,
          status: command.status,
        },
        "Application Status Updated",
      );

      // ── Step 8: Return result ───────────────────────────────────
      return {
        success: true,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
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
        "Unexpected Error during application status update",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Application status update failed", details);
    }
  }

  /**
   * Validate that the required fields are not empty.
   *
   * @param command - The input command to validate.
   * @throws {ValidationException} If any required field is empty.
   */
  private validateInput(command: UpdateApplicationStatusCommand): void {
    if (!command.employerId || command.employerId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("employerId is required");
    }

    if (!command.applicationId || command.applicationId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("applicationId is required");
    }

    if (!command.status || command.status.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("status is required");
    }

    const allowedStatuses: UpdateApplicationStatusValue[] = [
      "UNDER_REVIEW",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(command.status)) {
      logger.warn("Validation Failure");
      throw new ValidationException(
        `Invalid status: ${command.status}. Allowed values: ${allowedStatuses.join(", ")}`,
      );
    }

    if (command.status === "REJECTED" && (!command.reason || command.reason.trim().length === 0)) {
      logger.warn("Validation Failure");
      throw new ValidationException("rejection reason is required when status is REJECTED");
    }
  }

  /**
   * Apply the requested status transition using the entity's business
   * methods. No state is modified directly — only business methods are
   * called.
   *
   * @param application - The application entity to update.
   * @param command     - The input command containing the target status.
   * @throws {ConflictException} If the transition is not allowed by the
   *                              current state.
   */
  private applyStatusTransition(
    application: {
      review(reviewedBy: string): void;
      accept(): void;
      reject(reason: string): void;
    },
    command: UpdateApplicationStatusCommand,
  ): void {
    switch (command.status) {
      case "UNDER_REVIEW":
        application.review(command.employerId);
        break;
      case "ACCEPTED":
        application.accept();
        break;
      case "REJECTED":
        application.reject(command.reason!);
        break;
    }
  }
}
