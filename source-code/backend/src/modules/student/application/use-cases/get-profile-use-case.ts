/**
 * GetProfileUseCase
 *
 * Orchestrates the student profile retrieval flow following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities and repository interfaces to fulfill the
 * get profile use case without containing business logic itself.
 *
 * ══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ══════════════════════════════════════════════════════════════════
 *
 * All dependencies are injected via the constructor following the
 * Dependency Inversion Principle. The Use Case depends only on
 * abstractions (interfaces), not on concrete implementations.
 *
 * @category Application Use Case
 */

import { IStudentProfileRepository } from "../../domain/repositories/student-profile-repository";
import { StudentProfile } from "../../domain/entities/student-profile";
import {
  ValidationException,
  NotFoundException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the get profile use‑case.
 */
export interface GetProfileCommand {
  /** The unique identifier of the user. */
  userId: string;
}

/**
 * Output DTO for the get profile use‑case.
 */
export interface GetProfileResult {
  /** The student profile entity. */
  profile: StudentProfile | null;
  /** Indicates whether a profile exists. */
  exists: boolean;
}

export class GetProfileUseCase {
  constructor(private readonly repository: IStudentProfileRepository) {}

  /**
   * Execute the get profile flow.
   *
   * @param command - The get profile command containing user ID.
   * @returns A GetProfileResult with the profile or null if not found.
   * @throws {ValidationException} If input validation fails.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: GetProfileCommand): Promise<GetProfileResult> {
    try {
      // ── 1. Validate userId is not empty ──────────────────────────
      if (!command.userId || command.userId.trim().length === 0) {
        logger.warn("Validation Failure: userId is required");
        throw new ValidationException("userId is required");
      }

      // ── 2. Find existing profile by userId ───────────────────────
      const profile = await this.repository.findByUserId(command.userId);

      logger.debug(
        {
          userId: command.userId,
          exists: !!profile,
        },
        "Profile Retrieved",
      );

      return {
        profile,
        exists: !!profile,
      };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (error instanceof ValidationException || error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during profile retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Profile retrieval failed", details);
    }
  }
}
