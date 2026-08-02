/**
 * UpdateProfileUseCase
 *
 * Orchestrates the student profile update flow following Clean Architecture
 * principles. All dependencies are injected via the constructor – no
 * concrete implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities, factory, and repository interfaces to fulfill the
 * update profile use case without containing business logic itself.
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
 * FACTORY VS REPOSITORY
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Factory is used when creating a new StudentProfile entity (create path).
 * - Repository is used for persistence (create/update operations).
 * - Business Logic is NOT placed in Controller – it belongs here.
 *
 * @category Application Use Case
 */

import { IStudentProfileRepository } from "../../domain/repositories/student-profile-repository";
import { StudentProfileFactory } from "../../domain/factories/student-profile-factory";
import {
  ValidationException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the update profile use‑case.
 */
export interface UpdateProfileCommand {
  /** The unique identifier of the user. */
  userId: string;
  /** The full name of the student. */
  fullName: string;
  /** The phone number of the student. */
  phone: string;
  /** The address of the student. */
  address: string;
  /** The school/university of the student. */
  school: string;
  /** The major of the student. */
  major: string;
  /** The graduation year of the student. */
  graduationYear: string;
  /** The avatar URL of the student. */
  avatarUrl: string;
}

/**
 * Output DTO for the update profile use‑case.
 */
export interface UpdateProfileResult {
  /** Indicates whether the operation was successful. */
  success: true;
  /** The ID of the student profile. */
  studentProfileId: string;
}

export class UpdateProfileUseCase {
  constructor(
    private readonly repository: IStudentProfileRepository,
    private readonly factory: StudentProfileFactory,
  ) {}

  /**
   * Execute the update profile flow.
   *
   * @param command - The update profile command containing student data.
   * @returns An UpdateProfileResult indicating successful operation.
   * @throws {ValidationException} If input validation fails.
   * @throws {BusinessException} If a business rule is violated.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: UpdateProfileCommand): Promise<UpdateProfileResult> {
    try {
      // ── 1. Validate userId is not empty ──────────────────────────
      if (!command.userId || command.userId.trim().length === 0) {
        logger.warn("Validation Failure: userId is required");
        throw new ValidationException("userId is required");
      }

      // ── Validate fullName and phone are not empty (business rules) ──
      if (!command.fullName || command.fullName.trim().length === 0) {
        logger.warn("Validation Failure: fullName is required");
        throw new ValidationException("fullName is required");
      }

      if (!command.phone || command.phone.trim().length === 0) {
        logger.warn("Validation Failure: phone is required");
        throw new ValidationException("phone is required");
      }

      const graduationYear = this.parseGraduationYear(command.graduationYear);

      // ── 2. Find existing profile by userId ───────────────────────
      const existingProfile = await this.repository.findByUserId(command.userId);

      if (!existingProfile) {
        // ── 3. Profile does not exist → create new via Factory ─────
        const profile = this.factory.create({
          userId: command.userId,
          fullName: command.fullName,
          role: "STUDENT",
        });

        profile.updatePhone(command.phone);
        profile.updateAddress(command.address);
        profile.updateUniversity(command.school);
        profile.updateMajor(command.major);
        profile.updateGraduationYear(graduationYear);
        profile.updateAvatarUrl(command.avatarUrl.trim().length > 0 ? command.avatarUrl : null);

        const created = await this.repository.create(profile);

        logger.info("Profile Created");

        // TODO: publish StudentProfileCreated event

        return {
          success: true,
          studentProfileId: created.id!,
        };
      }

      // ── 4. Profile exists → update via entity business methods ──
      existingProfile.updateFullName(command.fullName);
      existingProfile.updatePhone(command.phone);
      existingProfile.updateAddress(command.address);
      existingProfile.updateUniversity(command.school);
      existingProfile.updateMajor(command.major);
      existingProfile.updateGraduationYear(graduationYear);
      existingProfile.updateAvatarUrl(
        command.avatarUrl.trim().length > 0 ? command.avatarUrl : null,
      );

      // ── 5. Persist updated profile ───────────────────────────────
      const updated = await this.repository.update(existingProfile);

      logger.info("Profile Updated");

      // TODO: publish StudentProfileUpdated event

      return {
        success: true,
        studentProfileId: updated.id!,
      };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (error instanceof ValidationException || error instanceof BusinessException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during profile update",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Profile update failed", details);
    }
  }

  private parseGraduationYear(value: string): number | null {
    if (!value || value.trim().length === 0) {
      throw new ValidationException("graduationYear is required");
    }

    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      throw new ValidationException("graduationYear must be a valid number");
    }

    return parsed;
  }
}
