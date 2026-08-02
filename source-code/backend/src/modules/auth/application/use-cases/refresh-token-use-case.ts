/**
 * RefreshTokenUseCase
 *
 * Orchestrates the refresh-token rotation flow following Clean Architecture
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
 *   6️⃣ Generate new Access and Refresh tokens.
 *   7️⃣ Revoke the old refresh token.
 *   8️⃣ Persist the new refresh token.
 *   9️⃣ Return RefreshTokenResult.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SECURITY DECISIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - Refresh tokens are hashed (SHA-256) before database lookup.
 *   - Token rotation: each refresh invalidates the previous token.
 *   - No plain tokens, JWTs, or sensitive data are logged.
 *   - Generic error messages prevent token enumeration attacks.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * All dependencies are injected via the constructor following the
 * Dependency Inversion Principle.
 *
 * @category Application Use Case
 */

import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token-repository";
import { TokenProvider, TokenPayload } from "../../domain/token-provider";
import { RefreshToken } from "../../domain/entities/refresh-token";
import {
  AuthenticationException,
  ValidationException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";
import { createHash } from "node:crypto";

/**
 * Input DTO for the refresh-token use‑case.
 */
export interface RefreshTokenCommand {
  /** The refresh token to rotate. */
  refreshToken: string;
}

/**
 * Output DTO for the refresh-token use‑case.
 */
export interface RefreshTokenResult {
  /** New short-lived JWT access token. */
  accessToken: string;

  /** New long-lived refresh token (plain text, returned once to client). */
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  /**
   * Execute the refresh-token rotation flow.
   *
   * @param command - The refresh-token command.
   * @returns A RefreshTokenResult with new tokens.
   * @throws {ValidationException} If the refresh token is empty.
   * @throws {AuthenticationException} If the token is invalid, expired, or revoked.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    try {
      // 1️⃣ Validate refreshToken is not empty.
      if (!command.refreshToken || command.refreshToken.trim().length === 0) {
        logger.warn("Invalid Refresh Token: empty token provided");
        throw new ValidationException("refreshToken is required");
      }

      // 2️⃣ Verify refreshToken JWT signature and expiry.
      let payload: TokenPayload;
      try {
        payload = await this.tokenProvider.verifyRefreshToken(command.refreshToken);
      } catch (error) {
        logger.warn("Invalid Refresh Token: JWT verification failed");
        throw new AuthenticationException("Invalid refresh token");
      }

      // 3️⃣ Hash refreshToken using SHA-256.
      const tokenHash = this.hashRefreshToken(command.refreshToken);

      // 4️⃣ Find token in database by hash.
      const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

      if (!storedToken) {
        logger.warn("Invalid Refresh Token: token not found in database");
        throw new AuthenticationException("Invalid refresh token");
      }

      // 5️⃣ Check token state (not expired, not revoked).
      if (storedToken.isExpired()) {
        logger.warn("Expired Refresh Token: token has expired");
        throw new AuthenticationException("Refresh token has expired");
      }

      if (storedToken.isRevoked()) {
        logger.warn("Revoked Refresh Token: token already revoked");
        throw new AuthenticationException("Refresh token has been revoked");
      }

      // 6️⃣ Generate new Access and Refresh tokens.
      const newAccessToken = await this.tokenProvider.generateAccessToken({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        purpose: "ACCESS",
      });

      const newRefreshToken = await this.tokenProvider.generateRefreshToken({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        purpose: "REFRESH",
      });

      // 7️⃣ Revoke the old refresh token.
      storedToken.revoke();
      await this.refreshTokenRepository.update(storedToken);

      // 8️⃣ Persist the new refresh token.
      const newTokenHash = this.hashRefreshToken(newRefreshToken);
      const newTokenEntity = new RefreshToken({
        id: null,
        userId: payload.sub,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        revokedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.refreshTokenRepository.create(newTokenEntity);

      logger.info({ userId: payload.sub }, "Refresh token rotated successfully");

      // 9️⃣ Return result.
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
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
        "Unexpected Error during refresh token rotation",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Refresh token rotation failed", details);
    }
  }

  /**
   * Hash a refresh token using SHA-256.
   *
   * @param token - The plain refresh token string.
   * @returns The SHA-256 hash of the token.
   * @private
   */
  private hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
