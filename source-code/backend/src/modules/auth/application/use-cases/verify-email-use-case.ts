/**
 * VerifyEmailUseCase
 *
 * Orchestrates the email verification flow following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1️⃣ Validate token is not empty.
 *   2️⃣ Verify access token JWT signature and expiry.
 *   3️⃣ Check payload.purpose must be VERIFY_EMAIL.
 *   4️⃣ Extract userId from payload.
 *   5️⃣ Find user by userId via UserRepository.
 *   6️⃣ Check if email is already verified.
 *   7️⃣ Mark email as verified via user.verifyEmail().
 *   8️⃣ If user is not active, activate the account.
 *   9️⃣ Persist updated user via UserRepository.update().
 *   🔟 Return VerifyEmailResult.
 *
 * ═══════════════════════════════════════════════════════════════════
 * EMAIL VERIFICATION FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 * This use case handles the final step of email verification after
 * the user clicks the verification link sent to their email. The
 * token must be:
 *
 *   - A valid JWT with correct signature
 *   - Not expired
 *   - Purpose must be VERIFY_EMAIL (prevents token reuse attacks)
 *
 * Once verified, the user's email is marked as verified. If the
 * account was created but not yet activated, it will be activated
 * automatically to allow immediate login.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SECURITY DECISIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - Token purpose validation prevents token reuse across different
 *     flows (e.g., using an access token for email verification).
 *   - Generic error messages prevent user enumeration attacks.
 *   - No sensitive data (JWT, tokens, headers) is logged.
 *   - Account activation is tied to email verification to ensure
 *     users cannot bypass email confirmation.
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
 * domain entities and repository interfaces to fulfill the email
 * verification use case without containing business logic itself.
 *
 * @category Application Use Case
 */

import { IUserRepository } from "../../domain/repositories/user-repository";
import { TokenProvider } from "../../domain/token-provider";
import {
  ValidationException,
  AuthenticationException,
  ConflictException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the verify email use‑case.
 */
export interface VerifyEmailCommand {
  /** The email verification token. */
  token: string;
}

/**
 * Output DTO for the verify email use‑case.
 */
export interface VerifyEmailResult {
  /** Indicates whether the email verification was successful. */
  success: true;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  /**
   * Execute the email verification flow.
   *
   * @param command - The verify email command containing the verification token.
   * @returns A VerifyEmailResult indicating successful email verification.
   * @throws {ValidationException} If the token is empty.
   * @throws {AuthenticationException} If the token is invalid, wrong purpose, or user not found.
   * @throws {ConflictException} If the email is already verified.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
    try {
      // 1️⃣ Validate token is not empty.
      if (!command.token || command.token.trim().length === 0) {
        logger.warn("Invalid Token: empty token provided");
        throw new ValidationException("Token is required");
      }

      // 2️⃣ Verify access token JWT signature and expiry.
      let payload;
      try {
        payload = await this.tokenProvider.verifyAccessToken(command.token);
      } catch (error) {
        logger.warn("Invalid Token: JWT verification failed");
        throw new AuthenticationException("Invalid token");
      }

      // 3️⃣ Check payload.purpose must be VERIFY_EMAIL.
      if (payload.purpose !== "VERIFY_EMAIL") {
        logger.warn("Wrong Token Purpose: token purpose is not VERIFY_EMAIL");
        throw new AuthenticationException("Invalid token purpose");
      }

      // 4️⃣ Extract userId from payload.
      const userId = payload.sub;

      // 5️⃣ Find user by userId via UserRepository.
      const user = await this.userRepository.findById(userId);

      if (!user) {
        logger.warn("User Not Found: user not found for verification");
        throw new AuthenticationException("Invalid token");
      }

      // 6️⃣ Check if email is already verified.
      if (user.emailVerified) {
        logger.warn("Already Verified: email is already verified");
        throw new ConflictException("Account already verified");
      }

      // 7️⃣ Mark email as verified via user.verifyEmail().
      user.verifyEmail();

      // 8️⃣ If user is not active, activate the account.
      if (!user.isActive) {
        user.activate();
      }

      // 9️⃣ Persist updated user via UserRepository.update().
      await this.userRepository.update(user);

      logger.info("Email Verified: email verification completed successfully");

      // TODO publish EmailVerified event

      // 🔟 Return result.
      return {
        success: true,
      };
    } catch (error) {
      // Map known domain errors, otherwise wrap as InfrastructureException.
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException ||
        error instanceof ConflictException
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
        "Unexpected Error during email verification",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Email verification failed", details);
    }
  }
}

// TODO publish EmailVerified event
