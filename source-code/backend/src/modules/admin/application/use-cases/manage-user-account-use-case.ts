/**
 * ManageUserAccountUseCase
 *
 * Orchestrates the user account management flow (activate/deactivate)
 * following Clean Architecture principles. All dependencies are injected
 * via the constructor – no concrete implementations are instantiated
 * inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Validate userId, isActive must not be empty.
 * 2. Find the user by userId.
 * 3. Verify the user exists.
 * 4. Update user active status via repository.
 * 5. Log success.
 * 6. Return { success: true }.
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
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input command for managing a user account.
 */
export interface ManageUserAccountCommand {
  /** The ID of the user to manage. */
  userId: string;
  /** The new active status for the user. */
  isActive: boolean;
}

/**
 * Result returned after a successful user account management.
 */
export interface ManageUserAccountResult {
  success: true;
}

export class ManageUserAccountUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(command: ManageUserAccountCommand): Promise<ManageUserAccountResult> {
    try {
      // ── Step 1: Validate input ──────────────────────────────────────────
      this.validateInput(command);

      logger.debug(
        {
          userId: command.userId,
          isActive: command.isActive,
        },
        "User Account Management Requested",
      );

      // ── Step 2: Find the user ───────────────────────────────────────────
      const users = await this.adminRepository.getUsers(1, 1);

      // ── Step 3: Verify user exists (check in paginated list) ────────────
      const userExists = users.data.some((user) => user.id === command.userId);

      if (!userExists) {
        logger.warn(
          {
            userId: command.userId,
          },
          "User Not Found",
        );
        throw new NotFoundException(`User ${command.userId} not found`);
      }

      // ── Step 4: Update user active status ───────────────────────────────
      await this.adminRepository.updateUserStatus(command.userId, command.isActive);

      // ── Step 5: Log success ─────────────────────────────────────────────
      logger.info(
        {
          userId: command.userId,
          isActive: command.isActive,
        },
        "User Account Status Updated",
      );

      // ── Step 6: Return result ───────────────────────────────────────────
      return {
        success: true,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
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
        "Unexpected Error during user account management",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("User account management failed", details);
    }
  }

  /**
   * Validate that the required fields are not empty.
   *
   * @param command - The input command to validate.
   * @throws {ValidationException} If any required field is empty.
   */
  private validateInput(command: ManageUserAccountCommand): void {
    if (!command.userId || command.userId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("userId is required");
    }

    if (typeof command.isActive !== "boolean") {
      logger.warn("Validation Failure");
      throw new ValidationException("isActive must be a boolean");
    }
  }
}
