/**
 * LogoutUseCase
 *
 * Orchestrates the user logout flow following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1️⃣ Validate refreshToken is not empty.
 *   2️⃣ Verify refreshToken JWT signature and expiry.
 *   3️⃣ Hash refreshToken using SHA-256.
 *   4️⃣ Find token in database by hash.
 *   5️⃣ Check token state (not expired, not revoked).
 *   6️⃣ Revoke the token.
 *   7️⃣ Persist the revoked state.
 *   8️⃣ Return LogoutResult.
 *
 * ═══════════════════════════════════════════════════════════════════
 * REFRESH TOKEN REVOCATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * Logout does NOT delete the refresh token record from the database.
 * Instead, it marks the token as revoked by setting the `revokedAt`
 * timestamp. This approach:
 *
 *   - Maintains an audit trail of token lifecycle.
 *   - Allows detection of token reuse attempts (security monitoring).
 *   - Enables "log out all sessions" features by querying active tokens.
 *
 * Once revoked, the token can no longer be used to obtain new access
 * tokens, effectively invalidating the session.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SECURITY DECISIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - Refresh tokens are hashed (SHA-256) before database lookup.
 *   - No plain tokens, JWTs, or sensitive data are logged.
 *   - Generic error messages prevent token enumeration attacks.
 *   - Token state is validated before revocation to catch tampering.
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
 * domain entities and repository interfaces to fulfill the logout
 * use case without containing business logic itself.
 *
 * @category Application Use Case
 */

import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token-repository";
import { TokenProvider } from "../../domain/token-provider";
import {
  AuthenticationException,
  ValidationException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";
import { createHash } from "node:crypto";

/**
 * Input DTO for the logout use‑case.
 */
export interface LogoutCommand {
  /** The refresh token to invalidate. */
  refreshToken: string;
}

/**
 * Output DTO for the logout use‑case.
 */
export interface LogoutResult {
  /** Indicates whether the logout operation was successful. */
  success: true;
}

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  /**
   * Execute the logout flow.
   *
   * @param command - The logout command containing the refresh token.
   * @returns A LogoutResult indicating successful logout.
   * @throws {ValidationException} If the refresh token is empty.
   * @throws {AuthenticationException} If the token is invalid, expired, or revoked.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: LogoutCommand): Promise<LogoutResult> {
    try {
      // 1️⃣ Validate refreshToken is not empty.
      if (!command.refreshToken || command.refreshToken.trim().length === 0) {
        logger.warn("Invalid Refresh Token: empty token provided");
        throw new ValidationException("Refresh token is required");
      }

      // 2️⃣ Verify refreshToken JWT signature and expiry.
      try {
        await this.tokenProvider.verifyRefreshToken(command.refreshToken);
      } catch (error) {
        logger.warn("Invalid Refresh Token: JWT verification failed");
        throw new AuthenticationException("Invalid refresh token");
      }

      // 3️⃣ Hash refreshToken using SHA-256.
      const tokenHash = this.hashRefreshToken(command.refreshToken);

      // 4️⃣ Find token in database by hash.
      const refreshTokenEntity = await this.refreshTokenRepository.findByTokenHash(tokenHash);

      if (!refreshTokenEntity) {
        logger.warn("Invalid Refresh Token: token not found in database");
        throw new AuthenticationException("Invalid refresh token");
      }

      // 5️⃣ Check token state (not expired, not revoked).
      if (refreshTokenEntity.isExpired()) {
        logger.warn("Expired Refresh Token: token has expired");
        throw new AuthenticationException("Refresh token has expired");
      }

      if (refreshTokenEntity.isRevoked()) {
        logger.warn("Revoked Refresh Token: token already revoked");
        throw new AuthenticationException("Refresh token has been revoked");
      }

      // 6️⃣ Revoke the token.
      refreshTokenEntity.revoke();

      // 7️⃣ Persist the revoked state.
      await this.refreshTokenRepository.update(refreshTokenEntity);

      logger.info("Logout Success: refresh token revoked successfully");

      // TODO publish UserLoggedOut event

      // 8️⃣ Return result.
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
        "Unexpected Error during logout",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Logout failed", details);
    }
  }

  /**
   * Hash a refresh token using SHA-256.
   *
   * This private helper ensures that only the hashed version of the
   * refresh token is used for database operations. The plain token is
   * never logged or stored.
   *
   * @param token - The plain refresh token string.
   * @returns The SHA-256 hash of the token.
   * @private
   */
  private hashRefreshToken(token: string): string {
    // Use Node.js built-in crypto module for SHA-256 hashing.
    return createHash("sha256").update(token).digest("hex");
  }
}

// TODO publish UserLoggedOut event
