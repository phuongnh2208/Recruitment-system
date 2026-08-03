/**
 * WithdrawApplicationUseCase
 *
 * Orchestrates the application withdrawal flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate studentId, applicationId must not be empty.
 * 2. Find the application by applicationId.
 * 3. Verify the application exists.
 * 4. Ownership check: application.studentId must equal command.studentId.
 * 5. Call application.withdraw() — Entity self-validates state machine.
 * 6. Persist the updated application.
 * 7. Log success.
 * 8. Return { success: true }.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * - IApplicationRepository  (Domain Interface)
 *
 * No Prisma. No concrete repository.
 *
 * @category Application Use Case
 */

import { IApplicationRepository } from "../../domain/repositories/application-repository";
import { IStudentProfileRepository } from "../../../student/domain/repositories/student-profile-repository";
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
 * Input command for withdrawing an application.
 */
export interface WithdrawApplicationCommand {
  /** The ID of the student withdrawing the application. */
  studentId: string;
  /** The ID of the application to withdraw. */
  applicationId: string;
}

/**
 * Result returned after a successful withdrawal.
 */
export interface WithdrawApplicationResult {
  success: true;
}

export class WithdrawApplicationUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
  ) {}

  async execute(command: WithdrawApplicationCommand): Promise<WithdrawApplicationResult> {
    try {
      // ── Step 1: Validate input ──────────────────────────────────
      this.validateInput(command);

      logger.debug(
        {
          studentId: command.studentId,
          applicationId: command.applicationId,
        },
        "Withdraw Requested",
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

      // ── Step 4: Ownership check ─────────────────────────────────
      // Resolve User.id → StudentProfile.id before comparing ownership.
      const studentProfile = await this.studentProfileRepository.findByUserId(command.studentId);
      if (!studentProfile?.id) {
        logger.warn(
          {
            studentId: command.studentId,
          },
          "Student Profile Not Found",
        );
        throw new NotFoundException(`Student profile for user ${command.studentId} not found`);
      }

      if (application.studentId !== studentProfile.id) {
        logger.warn(
          {
            studentId: command.studentId,
            applicationId: command.applicationId,
            ownerId: application.studentId,
          },
          "Unauthorized Withdraw",
        );
        throw new AuthenticationException("You are not authorized to withdraw this application");
      }

      // ── Step 5: Withdraw via entity business method ─────────────
      application.withdraw();

      // ── Step 6: Persist the updated application ─────────────────
      await this.applicationRepository.update(application);

      // ── Step 7: Log success ─────────────────────────────────────
      logger.info(
        {
          applicationId: command.applicationId,
          studentId: command.studentId,
        },
        "Application Withdrawn",
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
        "Unexpected Error during application withdrawal",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Application withdrawal failed", details);
    }
  }

  /**
   * Validate that the required fields are not empty.
   *
   * @param command - The input command to validate.
   * @throws {ValidationException} If any required field is empty.
   */
  private validateInput(command: WithdrawApplicationCommand): void {
    if (!command.studentId || command.studentId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("studentId is required");
    }

    if (!command.applicationId || command.applicationId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("applicationId is required");
    }
  }
}
