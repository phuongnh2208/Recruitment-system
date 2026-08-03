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
import { IStudentProfileRepository } from "../../../student/domain/repositories/student-profile-repository";
import { StudentProfileFactory } from "../../../student/domain/factories/student-profile-factory";
import { IEmployerRepository } from "../../../employer/domain/repositories/employer-repository";
import { EmployerProfileFactory } from "../../../employer/domain/employer-profile-factory";
import { LoginUseCase, LoginResult } from "./login-use-case";
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
  fullName: string;
  companyName?: string;
}

/**
 * Output DTO for the use‑case. Registration auto-activates the account
 * (no external SMTP is configured for this project) and immediately
 * signs the user in, matching LoginUseCase's response shape.
 */
export type RegisterResult = LoginResult;

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenProvider: TokenProvider,
    private readonly notificationStrategy: INotificationStrategy,
    private readonly userFactory: UserFactory,
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly studentProfileFactory: StudentProfileFactory,
    private readonly employerRepository: IEmployerRepository,
    private readonly employerProfileFactory: EmployerProfileFactory,
    private readonly loginUseCase: LoginUseCase,
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
      const persistedUser = await this.userRepository.create(user);
      logger.info({ userId: persistedUser.id, email: persistedUser.email }, "User Registered");

      // 4️⃣b Create the role-specific profile (StudentProfile / EmployerProfile).
      const userId = persistedUser.id as unknown as string;
      if (command.role === "STUDENT") {
        const studentProfile = this.studentProfileFactory.create({
          userId,
          fullName: command.fullName,
          role: command.role,
        });
        await this.studentProfileRepository.create(studentProfile);
      } else if (command.role === "EMPLOYER") {
        const employerProfile = this.employerProfileFactory.create({
          userId,
          companyName: command.companyName!,
        });
        await this.employerRepository.create(employerProfile);
      }

      // 5️⃣ Auto-activate the account (no external SMTP is wired up for
      //     this project, so gating login on e‑mail verification would
      //     lock every new user out).
      persistedUser.activate();
      persistedUser.verifyEmail();
      await this.userRepository.update(persistedUser);

      // 6️⃣ Send a welcome notification (best-effort, non-blocking).
      const notification: NotificationMessage = {
        userId,
        title: "Chào mừng bạn đến với TrustHire",
        message: "Tài khoản của bạn đã được tạo thành công.",
        metadata: { email: persistedUser.email },
      };
      this.notificationStrategy.send(notification).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger.warn({ userId, error: errorMessage }, "Failed to send welcome notification");
      });

      // 7️⃣ Sign the new user in immediately.
      return await this.loginUseCase.execute({
        email: command.email,
        password: command.password,
      });
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
