/**
 * VerifyEmployerUseCase
 *
 * Orchestrates the employer verification flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Validate employerId must not be empty.
 * 2. Find the employer by employerId.
 * 3. Verify the employer exists.
 * 4. Verify the employer is not already verified.
 * 5. Update employer verification status via repository.
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
 * Input command for verifying an employer.
 */
export interface VerifyEmployerCommand {
  /** The ID of the employer to verify. */
  employerId: string;
  /** The ID of the admin performing the verification. */
  adminId: string;
}

/**
 * Result returned after a successful employer verification.
 */
export interface VerifyEmployerResult {
  success: true;
}

export class VerifyEmployerUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(command: VerifyEmployerCommand): Promise<VerifyEmployerResult> {
    try {
      // ── Step 1: Validate input ──────────────────────────────────────────
      this.validateInput(command);

      logger.debug(
        {
          employerId: command.employerId,
          adminId: command.adminId,
        },
        "Employer Verification Requested",
      );

      // ── Step 2: Find the employer ───────────────────────────────────────
      const employer = await this.adminRepository.findEmployerById(command.employerId);

      // ── Step 3: Verify employer exists ──────────────────────────────────
      if (!employer) {
        logger.warn(
          {
            employerId: command.employerId,
          },
          "Employer Not Found",
        );
        throw new NotFoundException(`Employer ${command.employerId} not found`);
      }

      // ── Step 4: Verify employer is not already verified ─────────────────
      if (employer.verified) {
        logger.warn(
          {
            employerId: command.employerId,
          },
          "Employer Already Verified",
        );
        throw new ConflictException(`Employer ${command.employerId} is already verified`);
      }

      // ── Step 5: Update employer verification status ─────────────────────
      await this.adminRepository.updateEmployerVerification(
        command.employerId,
        true,
        command.adminId,
      );

      // ── Step 6: Log success ─────────────────────────────────────────────
      logger.info(
        {
          employerId: command.employerId,
          adminId: command.adminId,
        },
        "Employer Verified",
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
        "Unexpected Error during employer verification",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Employer verification failed", details);
    }
  }

  /**
   * Validate that the required fields are not empty.
   *
   * @param command - The input command to validate.
   * @throws {ValidationException} If any required field is empty.
   */
  private validateInput(command: VerifyEmployerCommand): void {
    if (!command.employerId || command.employerId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("employerId is required");
    }

    if (!command.adminId || command.adminId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("adminId is required");
    }
  }
}
