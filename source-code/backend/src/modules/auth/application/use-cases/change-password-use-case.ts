/**
 * ChangePasswordUseCase
 *
 * Orchestrates the password change flow following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1️⃣ Validate userId, currentPassword, newPassword are not empty.
 *   2️⃣ Find user by userId via UserRepository.
 *   3️⃣ Check if user can login (active and not locked).
 *   4️⃣ Verify current password matches stored hash.
 *   5️⃣ Validate new password using Password value object.
 *   6️⃣ Ensure new password is different from current password.
 *   7️⃣ Hash the new password using PasswordHasher.
 *   8️⃣ Update user password hash via user.changePassword().
 *   9️⃣ Persist updated user via UserRepository.update().
 *   🔟 Delete all refresh tokens for the user (force re-login on all devices).
 *   1️⃣1️⃣ Return ChangePasswordResult.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SECURITY DECISIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - Plain passwords are NEVER logged or stored.
 *   - Password hashes are NEVER logged.
 *   - Refresh tokens are NEVER logged.
 *   - All passwords are validated through the Password value object
 *     to enforce password policy (8-32 chars, uppercase, lowercase,
 *     number, special character).
 *   - Current password verification prevents unauthorized changes
 *     even if the session is hijacked.
 *   - All refresh tokens are revoked to prevent session continuation
 *     after password change (defense in depth).
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * All dependencies are injected via the constructor following the
 * Dependency Inversion Principle. The Use Case depends only on
 * abstractions (interfaces), not on concrete implementations.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities and repository interfaces to fulfill the change
 * password use case without containing business logic itself.
 *
 * @category Application Use Case
 */

import { IUserRepository } from "../../domain/repositories/user-repository";
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token-repository";
import { PasswordHasher } from "../../domain/password-hasher";
import { Password } from "../../domain/value-objects/password";
import {
  ValidationException,
  AuthenticationException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the change password use‑case.
 */
export interface ChangePasswordCommand {
  /** The unique identifier of the user requesting the password change. */
  userId: string;
  /** The user's current password for verification. */
  currentPassword: string;
  /** The new password to set. */
  newPassword: string;
}

/**
 * Output DTO for the change password use‑case.
 */
export interface ChangePasswordResult {
  /** Indicates whether the password change operation was successful. */
  success: true;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * Execute the change password flow.
   *
   * @param command - The change password command containing user credentials.
   * @returns A ChangePasswordResult indicating successful password change.
   * @throws {ValidationException} If input validation fails or new password equals current password.
   * @throws {AuthenticationException} If user not found, account inactive/locked, or current password incorrect.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: ChangePasswordCommand): Promise<ChangePasswordResult> {
    try {
      // 1️⃣ Validate userId, currentPassword, newPassword are not empty.
      this.validateCommand(command);

      // 2️⃣ Find user by userId via UserRepository.
      const user = await this.userRepository.findById(command.userId);

      if (!user) {
        logger.warn("Change Password Failed: user not found");
        throw new AuthenticationException("Invalid credentials");
      }

      // 3️⃣ Check if user can login (active and not locked).
      if (!user.canLogin()) {
        if (!user.isActive) {
          logger.warn("Change Password Failed: inactive account");
          throw new AuthenticationException("Account is inactive");
        }

        if (user.isLocked()) {
          logger.warn("Change Password Failed: locked account");
          throw new AuthenticationException("Account is locked");
        }
      }

      // 4️⃣ Verify current password matches stored hash.
      const isCurrentPasswordValid = await this.passwordHasher.compare(
        command.currentPassword,
        user.passwordHash,
      );

      if (!isCurrentPasswordValid) {
        logger.warn("Change Password Failed: wrong current password");
        throw new AuthenticationException("Invalid credentials");
      }

      // 5️⃣ Validate new password using Password value object.
      const passwordValueObject = new Password(command.newPassword);

      // 6️⃣ Ensure new password is different from current password.
      const isSamePassword = await this.passwordHasher.compare(
        command.newPassword,
        user.passwordHash,
      );

      if (isSamePassword) {
        logger.warn("Change Password Failed: new password same as current");
        throw new ValidationException("New password must be different from current password");
      }

      // 7️⃣ Hash the new password using PasswordHasher.
      const newPasswordHash = await this.passwordHasher.hash(passwordValueObject.value());

      // 8️⃣ Update user password hash via user.changePassword().
      user.changePassword(newPasswordHash);

      // 9️⃣ Persist updated user via UserRepository.update().
      await this.userRepository.update(user);

      // 🔟 Delete all refresh tokens for the user (force re-login on all devices).
      await this.refreshTokenRepository.deleteByUserId(user.id!);

      logger.info("Password Changed: password updated successfully");

      // TODO publish PasswordChanged event

      // 1️⃣1️⃣ Return result.
      return {
        success: true,
      };
    } catch (error) {
      // Map known domain errors, otherwise wrap as InfrastructureException.
      if (error instanceof AuthenticationException || error instanceof ValidationException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during password change",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Password change failed", details);
    }
  }

  /**
   * Validate the change password command inputs.
   *
   * @param command - The command to validate.
   * @throws {ValidationException} If any required field is empty.
   * @private
   */
  private validateCommand(command: ChangePasswordCommand): void {
    const errors: string[] = [];

    if (!command.userId || command.userId.trim().length === 0) {
      errors.push("User ID is required");
    }

    if (!command.currentPassword || command.currentPassword.trim().length === 0) {
      errors.push("Current password is required");
    }

    if (!command.newPassword || command.newPassword.trim().length === 0) {
      errors.push("New password is required");
    }

    if (errors.length > 0) {
      logger.warn("Change Password Validation Failed: " + errors.join("; "));
      throw new ValidationException(errors.join("; "));
    }
  }
}

// TODO publish PasswordChanged event
