/**
 * RegisterUseCase
 *
 * Orchestrates the user registration flow following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * Flow:
 *   1️⃣ Create Email and Password value objects.
 *   2️⃣ Verify the e‑mail does not already exist (`userRepository.existsByEmail`).
 *   3️⃣ Use `userFactory` to create a new `User` domain entity (password is
 *      hashed inside the factory via the injected `PasswordHasher`).
 *   4️⃣ Persist the user (`userRepository.create`).
 *   5️⃣ Generate a verification token (`tokenProvider.generateAccessToken`) with
 *      purpose `VERIFY_EMAIL`.
 *   6️⃣ Send a verification e‑mail via the injected `INotificationStrategy`.
 *   7️⃣ Return a `RegisterResult` containing the new user id, e‑mail and the
 *      verification token.
 *
 * Errors are mapped to domain‑specific exceptions – no generic `Error`
 * instances are thrown.
 */

import { IUserRepository } from "../../domain/repositories/user-repository";
import { PasswordHasher } from "../../domain/password-hasher";
import { TokenProvider, TokenPayload } from "../../domain/token-provider";
import {
  INotificationStrategy,
  NotificationMessage,
} from "../../../../common/interfaces/notification-strategy";
import { UserFactory, CreateUserInput } from "../../domain/factories/user-factory";
import { Email } from "../../domain/value-objects/email";
import { Password } from "../../domain/value-objects/password";
import {
  ConflictException,
  ValidationException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/** Input DTO for the use‑case. */
export interface RegisterCommand {
  email: string;
  password: string;
  role: string;
}

/** Output DTO for the use‑case. */
export interface RegisterResult {
  userId: string;
  email: string;
  verificationToken: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenProvider: TokenProvider,
    private readonly notificationStrategy: INotificationStrategy,
    private readonly userFactory: UserFactory,
  ) {}

  /** Execute the registration flow. */
  async execute(command: RegisterCommand): Promise<RegisterResult> {
    try {
      // 1️⃣ Build value objects – they perform their own validation.
      const emailVO = new Email(command.email);
      const passwordVO = new Password(command.password);

      // 2️⃣ Check for duplicate e‑mail.
      const exists = await this.userRepository.existsByEmail(emailVO);
      if (exists) {
        logger.warn({ email: command.email }, "Duplicate Email");
        throw new ConflictException("Email already registered");
      }

      // 3️⃣ Create the user entity via the factory (password hashing occurs here).
      const createInput: CreateUserInput = {
        email: emailVO.value(),
        password: passwordVO.value(),
        role: command.role,
      };
      const user = await this.userFactory.create(createInput);

      // 4️⃣ Persist the user.
      await this.userRepository.create(user);
      logger.info({ userId: user.id, email: user.email }, "User Registered");

      // 5️⃣ Generate verification token.
      const payload: TokenPayload = {
        sub: user.id as unknown as string,
        email: user.email,
        role: user.role,
        purpose: "VERIFY_EMAIL",
      };
      const verificationToken = await this.tokenProvider.generateAccessToken(payload);

      // 6️⃣ Send verification e‑mail.
      const notification: NotificationMessage = {
        userId: user.id as unknown as string,
        title: "Verify your e‑mail",
        message: "Please verify your e‑mail address by clicking the link.",
        metadata: {
          email: user.email,
          verificationToken,
        },
      };
      await this.notificationStrategy.send(notification);

      // 7️⃣ Return result.
      return {
        userId: user.id as unknown as string,
        email: user.email,
        verificationToken,
      };
    } catch (error) {
      // Map known domain errors, otherwise wrap as InfrastructureException.
      if (error instanceof ConflictException || error instanceof ValidationException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected error during registration",
      );
      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };
      throw new InfrastructureException("Registration failed", details);
    }
  }
}

// TODO: publish UserRegistered event
