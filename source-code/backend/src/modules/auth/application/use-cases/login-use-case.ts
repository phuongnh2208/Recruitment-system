/**
 * LoginUseCase
 *
 * Orchestrates the user authentication flow following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1️⃣ Create Email and Password value objects (validation only).
 *   2️⃣ Retrieve user by email (`userRepository.findByEmail`).
 *   3️⃣ Check if user can login (`user.canLogin()`).
 *   4️⃣ Verify password (`passwordHasher.compare`).
 *   5️⃣ Handle failed login (increment counter, lock if >= 5 attempts).
 *   6️⃣ Handle successful login (reset counter, unlock).
 *   7️⃣ Generate Access and Refresh tokens.
 *   8️⃣ Persist RefreshToken entity (hashed).
 *   9️⃣ Return LoginResult.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ACCOUNT LOCK POLICY
 * ═══════════════════════════════════════════════════════════════════
 *
 * To prevent brute-force attacks, accounts are temporarily locked after
 * 5 consecutive failed login attempts. The lock duration is 15 minutes.
 *
 *   - Failed attempts counter: incremented on each invalid password.
 *   - Lock threshold: 5 failed attempts.
 *   - Lock duration: 15 minutes from the time of the 5th failure.
 *   - Auto-unlock: account becomes accessible again after 15 minutes.
 *   - Manual unlock: successful login resets the counter and unlocks.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SECURITY DECISIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - Generic error messages: "Authentication failed" is returned for
 *     both invalid email and invalid password to prevent user enumeration.
 *   - Refresh tokens are hashed (SHA-256) before persistence.
 *   - No plain tokens, JWTs, or passwords are logged.
 *   - Each login creates a new refresh token (no token reuse).
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
 * domain entities and repository interfaces to fulfill the login
 * use case without containing business logic itself.
 *
 * @category Application Use Case
 */

import { IUserRepository } from "../../domain/repositories/user-repository";
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token-repository";
import { PasswordHasher } from "../../domain/password-hasher";
import { TokenProvider, TokenPayload } from "../../domain/token-provider";
import {
  INotificationStrategy,
  NotificationMessage,
} from "../../../../common/interfaces/notification-strategy";
import { Email } from "../../domain/value-objects/email";
import { Password } from "../../domain/value-objects/password";
import { RefreshToken } from "../../domain/entities/refresh-token";
import {
  AuthenticationException,
  ValidationException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";
import { createHash } from "node:crypto";

/**
 * Input DTO for the login use‑case.
 */
export interface LoginCommand {
  /** User's email address. */
  email: string;

  /** User's plain-text password. */
  password: string;

  /** Client IP address (optional, for audit/logging). */
  ipAddress?: string;

  /** Client user agent (optional, for audit/logging). */
  userAgent?: string;
}

/**
 * Output DTO for the login use‑case.
 */
export interface LoginResult {
  /** Short-lived JWT access token. */
  accessToken: string;

  /** Long-lived refresh token (plain text, returned once to client). */
  refreshToken: string;

  /** Access token expiration time in seconds. */
  expiresIn: number;

  /** Authenticated user data (safe to expose to client). */
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
  };
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenProvider: TokenProvider,
    private readonly notificationStrategy: INotificationStrategy,
  ) {}

  /**
   * Execute the login flow.
   *
   * @param command - The login credentials and optional metadata.
   * @returns A LoginResult containing tokens and user data.
   * @throws {AuthenticationException} If credentials are invalid or account is locked.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: LoginCommand): Promise<LoginResult> {
    try {
      // 1️⃣ Build value objects – they perform their own validation.
      const emailVO = new Email(command.email);
      const passwordVO = new Password(command.password);

      // 2️⃣ Retrieve user by email.
      const user = await this.userRepository.findByEmail(emailVO);

      // Generic error to prevent user enumeration.
      if (!user) {
        logger.warn(
          { ipAddress: command.ipAddress, userAgent: command.userAgent },
          "Authentication failed: user not found",
        );
        throw new AuthenticationException("Invalid email or password");
      }

      // 3️⃣ Check if user can login (active and not locked).
      if (!user.canLogin()) {
        logger.warn(
          { userId: user.id, email: user.email, ipAddress: command.ipAddress },
          "Authentication failed: account locked or inactive",
        );
        throw new AuthenticationException("Invalid email or password");
      }

      // 4️⃣ Verify password.
      const isPasswordValid = await this.passwordHasher.compare(
        passwordVO.value(),
        user.passwordHash,
      );

      if (!isPasswordValid) {
        // Increment failed login attempts.
        user.increaseFailedLoginAttempts();

        // Lock account if threshold reached (5 attempts).
        if (user.failedLoginAttempts >= 5) {
          const lockDuration = 15 * 60 * 1000; // 15 minutes in milliseconds.
          const lockUntil = new Date(Date.now() + lockDuration);
          user.lock(lockUntil);

          logger.warn(
            {
              userId: user.id,
              email: user.email,
              failedAttempts: user.failedLoginAttempts,
              lockedUntil: lockUntil.toISOString(),
              ipAddress: command.ipAddress,
            },
            "Account locked due to too many failed login attempts",
          );
        } else {
          logger.warn(
            {
              userId: user.id,
              email: user.email,
              failedAttempts: user.failedLoginAttempts,
              ipAddress: command.ipAddress,
            },
            "Invalid password",
          );
        }

        // Persist updated user state.
        await this.userRepository.update(user);

        throw new AuthenticationException("Invalid email or password");
      }

      // 5️⃣ Successful login – reset failed attempts and unlock.
      user.resetFailedLoginAttempts();
      user.unlock();
      await this.userRepository.update(user);

      logger.info(
        { userId: user.id, email: user.email, ipAddress: command.ipAddress },
        "Login successful",
      );

      // 6️⃣ Generate Access Token.
      const accessTokenPayload: TokenPayload = {
        sub: user.id as unknown as string,
        email: user.email,
        role: user.role,
        purpose: "ACCESS",
      };
      const accessToken = await this.tokenProvider.generateAccessToken(accessTokenPayload);

      // 7️⃣ Generate Refresh Token.
      const refreshTokenPayload: TokenPayload = {
        sub: user.id as unknown as string,
        email: user.email,
        role: user.role,
        purpose: "REFRESH",
      };
      const refreshToken = await this.tokenProvider.generateRefreshToken(refreshTokenPayload);

      // 8️⃣ Hash the refresh token before persistence.
      const tokenHash = this.hashRefreshToken(refreshToken);

      // 9️⃣ Create RefreshToken entity and persist.
      const refreshTokenEntity = new RefreshToken({
        id: null,
        userId: user.id as unknown as string,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days.
        revokedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.refreshTokenRepository.create(refreshTokenEntity);

      // 1️⃣0️⃣ Send login notification (optional, non-blocking).
      // TODO: publish UserLoggedIn event
      const notification: NotificationMessage = {
        userId: user.id as unknown as string,
        title: "Login Successful",
        message: "You have successfully logged in.",
        type: "login_success",
        metadata: {
          email: user.email,
          ipAddress: command.ipAddress,
          userAgent: command.userAgent,
        },
      };
      // Fire-and-forget notification (do not block login on notification failure).
      this.notificationStrategy.send(notification).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger.warn({ userId: user.id, error: errorMessage }, "Failed to send login notification");
      });

      // 1️⃣1️⃣ Return result.
      return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds.
        user: {
          id: user.id as unknown as string,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
        },
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
          ipAddress: command.ipAddress,
        },
        "Unexpected error during login",
      );
      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };
      throw new InfrastructureException("Login failed", details);
    }
  }

  /**
   * Hash a refresh token using SHA-256.
   *
   * This private helper ensures that only the hashed version of the
   * refresh token is persisted to the database. The plain token is
   * returned to the client and never stored.
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

// TODO: publish UserLoggedIn event
