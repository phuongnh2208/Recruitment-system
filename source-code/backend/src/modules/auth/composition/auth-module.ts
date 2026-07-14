/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTH MODULE — COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file is the **Composition Root** for the Authentication Module.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The Composition Root is the single, dedicated place in the application where
 * the dependency graph is assembled. It is the **only** place that is allowed
 * to:
 *
 *   - Instantiate concrete classes (`new PrismaUserRepository(...)`,
 *     `new BCryptPasswordHasher()`, `new RegisterUseCase(...)`, etc.)
 *   - Resolve the order of dependency creation
 *   - Wire abstractions to their concrete implementations
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dependency Injection (DI) is a technique where an object receives its
 * dependencies from an external source rather than creating them itself.
 * The Composition Root is where this "external source" lives.
 *
 *   ✅ Correct:
 *      // Composition Root (this file)
 *      const repo = new PrismaUserRepository(prisma);
 *      const useCase = new RegisterUseCase(repo, ...);
 *
 *   ❌ Wrong:
 *      // Inside a Use Case or Controller
 *      const repo = new PrismaUserRepository(prisma); // DO NOT DO THIS
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * INVERSION OF CONTROL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Inversion of Control (IoC) means that high-level modules (Use Cases) do not
 * control the creation of their dependencies. Instead, control is "inverted"
 * by giving the Composition Root the responsibility of supplying dependencies
 * to the modules that need them.
 *
 *   ┌──────────────────────┐
 *   │ Composition Root     │  ← Controls instantiation and wiring
 *   │ (this file)          │
 *   └──────┬───────┬───────┘
 *          │       │
 *          ▼       ▼
 *   ┌──────────┐ ┌──────────┐
 *   │ Use Case │ │ Use Case │  ← Receive ready-to-use dependencies
 *   └──────────┘ └──────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY ONLY THE COMPOSITION ROOT MAY USE `new`
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Testability** – Use Cases and Controllers can be tested in isolation
 *    by passing mock/stub dependencies in unit tests.
 *
 * 2. **Single Responsibility** – No class should be responsible for both
 *    doing its job AND constructing its dependencies.
 *
 * 3. **Maintainability** – Changing a dependency (e.g. replacing BCrypt with
 *    Argon2) requires changing exactly one file: the Composition Root.
 *
 * 4. **Consistency** – All dependencies are wired in a predictable order,
 *    making the dependency graph easy to reason about.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPENDENCY GRAPH (BUILD ORDER)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   PrismaClient (injected)
 *       ↓
 *   PrismaUserRepository
 *   PrismaRefreshTokenRepository
 *       ↓
 *   BCryptPasswordHasher
 *   JwtTokenProvider
 *   CompositeNotificationStrategy
 *       ↓
 *   UserFactory
 *       ↓
 *   RegisterUseCase
 *   LoginUseCase
 *   LogoutUseCase
 *   ChangePasswordUseCase
 *   VerifyEmailUseCase
 *       ↓
 *   AuthController
 *       ↓
 *   AuthRouter
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * NO BUSINESS LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file contains ZERO business logic:
 *   ✗ No validation
 *   ✗ No database queries
 *   ✗ No authentication / authorisation decisions
 *   ✗ No token generation
 *   ✗ No password hashing
 *   ✗ No email sending
 *
 * Its sole purpose is wiring.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @module AuthModule
 * @category Composition Root
 */

// ── Generated Prisma ──────────────────────────────────────────────────────────
import { PrismaClient } from "../../../generated/prisma";

// ── Common ────────────────────────────────────────────────────────────────────
import type { IEmailService } from "../../../common/interfaces/IEmailService";
import type { INotificationStrategy } from "../../../common/interfaces/notification-strategy";
import { createAuthGuard } from "../../../common/guards";

// ── Domain ────────────────────────────────────────────────────────────────────
import { PasswordHasher } from "../domain/password-hasher";
import { TokenProvider } from "../domain/token-provider";
import { UserFactory } from "../domain/factories/user-factory";

// ── Infrastructure — Auth Module Repositories ─────────────────────────────────
import { PrismaUserRepository, PrismaRefreshTokenRepository } from "../infrastructure/repositories";

// ── Infrastructure — Security ─────────────────────────────────────────────────
import { BCryptPasswordHasher } from "../../../infrastructure/security/bcrypt-password-hasher";
import { JwtTokenProvider } from "../../../infrastructure/security/jwt-token-provider";

// ── Infrastructure — Notifications ────────────────────────────────────────────
import {
  CompositeNotificationStrategy,
  EmailNotificationStrategy,
  WebSocketNotificationStrategy,
} from "../../../infrastructure/notification";

// ── Infrastructure — WebSocket ────────────────────────────────────────────────
import { NotificationGateway } from "../../../infrastructure/websocket/notification-gateway";

// ── Application — Use Cases ───────────────────────────────────────────────────
import { RegisterUseCase } from "../application/use-cases/register-use-case";
import { LoginUseCase } from "../application/use-cases/login-use-case";
import { LogoutUseCase } from "../application/use-cases/logout-use-case";
import { ChangePasswordUseCase } from "../application/use-cases/change-password-use-case";
import { VerifyEmailUseCase } from "../application/use-cases/verify-email-use-case";

// ── Presentation ──────────────────────────────────────────────────────────────
import { AuthController } from "../presentation/controllers/auth-controller";
import { createAuthRouter } from "../presentation/routes";

// ── Express ────────────────────────────────────────────────────────────────────
import type { Router } from "express";

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The public interface returned by {@link createAuthModule}.
 *
 * Provides access to the fully-wired AuthController, AuthRouter, and
 * individual Use Cases (useful for testing or composing with other modules).
 */
export interface AuthModule {
  /** The fully-wired AuthController instance. */
  controller: AuthController;

  /** The Express Router with all auth routes registered. */
  router: Router;

  /** All use cases exposed for testing or cross-module composition. */
  useCases: {
    registerUseCase: RegisterUseCase;
    loginUseCase: LoginUseCase;
    logoutUseCase: LogoutUseCase;
    changePasswordUseCase: ChangePasswordUseCase;
    verifyEmailUseCase: VerifyEmailUseCase;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// FACTORY
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Build the complete Auth Module dependency graph.
 *
 * This is the **only** place where concrete implementations of auth-related
 * abstractions are instantiated. All dependencies are wired in the correct
 * order following the module's dependency graph.
 *
 * @param prismaClient       - The shared PrismaClient instance (created once
 *                              at the application level).
 * @param emailService       - The shared IEmailService implementation
 *                              (e.g. EmailServiceAdapter).
 * @param notificationGateway - The shared NotificationGateway for
 *                              real-time WebSocket notifications.
 * @returns An {@link AuthModule} containing the controller, router, and
 *          all use cases.
 *
 * @example
 * ```typescript
 * // In main.ts
 * import { PrismaClient } from "./generated/prisma";
 * import { EmailServiceAdapter } from "./infrastructure/email/EmailServiceAdapter";
 * import { NotificationGateway } from "./infrastructure/websocket/notification-gateway";
 * import { createAuthModule } from "./modules/auth/composition";
 *
 * const prisma = new PrismaClient();
 * const emailService = new EmailServiceAdapter();
 * const notificationGateway = new NotificationGateway(socketManager);
 *
 * const authModule = createAuthModule(prisma, emailService, notificationGateway);
 * app.use("/api/v1/auth", authModule.router);
 * ```
 */
export function createAuthModule(
  prismaClient: PrismaClient,
  emailService: IEmailService,
  notificationGateway: NotificationGateway,
): AuthModule {
  // ── 1. Infrastructure Layer ────────────────────────────────────────
  //     1a. Repositories ──────────────────────────────────────────────
  const userRepository = new PrismaUserRepository(prismaClient);
  const refreshTokenRepository = new PrismaRefreshTokenRepository(prismaClient);

  //     1b. Security Strategies ───────────────────────────────────────
  const passwordHasher: PasswordHasher = new BCryptPasswordHasher();
  const tokenProvider: TokenProvider = new JwtTokenProvider();

  //     1c. Notification Strategies ───────────────────────────────────
  const emailNotificationStrategy = new EmailNotificationStrategy(emailService);
  const webSocketNotificationStrategy = new WebSocketNotificationStrategy(notificationGateway);

  const notificationStrategy: INotificationStrategy = new CompositeNotificationStrategy([
    emailNotificationStrategy,
    webSocketNotificationStrategy,
  ]);

  // ── 2. Domain Layer ────────────────────────────────────────────────
  const userFactory = new UserFactory(passwordHasher);

  // ── 3. Application Layer (Use Cases) ───────────────────────────────
  const registerUseCase = new RegisterUseCase(
    userRepository,
    passwordHasher,
    tokenProvider,
    notificationStrategy,
    userFactory,
  );

  const loginUseCase = new LoginUseCase(
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenProvider,
    notificationStrategy,
  );

  const logoutUseCase = new LogoutUseCase(refreshTokenRepository, tokenProvider);

  const changePasswordUseCase = new ChangePasswordUseCase(
    userRepository,
    refreshTokenRepository,
    passwordHasher,
  );

  const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, tokenProvider);

  // ── 4. Presentation Layer ──────────────────────────────────────────
  const controller = new AuthController(
    registerUseCase,
    loginUseCase,
    logoutUseCase,
    changePasswordUseCase,
    verifyEmailUseCase,
  );

  const authGuard = createAuthGuard(tokenProvider);
  const router = createAuthRouter(controller, authGuard);

  // ── 5. Return ──────────────────────────────────────────────────────
  return {
    controller,
    router,
    useCases: {
      registerUseCase,
      loginUseCase,
      logoutUseCase,
      changePasswordUseCase,
      verifyEmailUseCase,
    },
  };
}
