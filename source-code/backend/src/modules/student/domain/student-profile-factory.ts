import { StudentProfile } from "./student-profile";
import { ValidationException } from "../../../common/exceptions/validation-exception";

/**
 * Input data required to create a new StudentProfile via StudentProfileFactory.
 */
export interface CreateStudentProfileInput {
  /** The ID of the User this profile belongs to. */
  userId: string;
  /** The full name of the student. */
  fullName: string;
  /** The role assigned to the user (e.g. STUDENT). This value is passed
   *  through to the entity without validation. */
  role: string;
}

/**
 * Factory for creating StudentProfile domain entities.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate Construction Invariants (userId, fullName).
 * 2. Set sensible defaults for all optional fields.
 * 3. Return a fully constructed StudentProfile entity.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THE FACTORY DOES NOT VALIDATE ROLE
 * ═══════════════════════════════════════════════════════════════════
 *
 * The factory does NOT check that `role` equals "STUDENT" because it
 * has no knowledge of User authentication or authorization semantics.
 * Validating whether the requesting User has the STUDENT role is a
 * business rule that belongs in the Application Layer.
 *
 * The CreateStudentProfileUseCase (Application Layer) is responsible
 * for:
 *   1. Fetching the User from UserRepository.
 *   2. Verifying that user.role === "STUDENT".
 *   3. Calling StudentProfileFactory.create({ userId, fullName, role }).
 *
 * This separation keeps the Domain Layer pure and free from
 * cross-cutting concerns.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THE FACTORY DOES NOT ACCESS REPOSITORY
 * ═══════════════════════════════════════════════════════════════════
 *
 * Following Clean Architecture, the Domain Layer must not depend on
 * Infrastructure. The factory's sole responsibility is constructing
 * domain objects. Database access, uniqueness checks, and persistence
 * are concerns of the Application/Infrastructure layers and are
 * handled by Use Cases and Repositories respectively.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THE FACTORY DOES NOT GENERATE ID
 * ═══════════════════════════════════════════════════════════════════
 *
 * The StudentProfile entity's `id` is set to `null` because ID
 * generation is a persistence concern. The database (Prisma) generates
 * the actual ID (cuid) when the entity is first saved. The factory
 * stays focused solely on domain object creation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BOUNDARIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Does NOT access the database.
 * - Does NOT use Prisma.
 * - Does NOT call any Repository.
 * - Does NOT call any API.
 * - Does NOT access Infrastructure.
 * - Does NOT validate business rules (role checks).
 * - ONLY creates a StudentProfile object.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Factory
 */
export class StudentProfileFactory {
  /**
   * Create a new StudentProfile domain entity.
   *
   * @param input - The data required to create the student profile.
   * @returns A fully constructed StudentProfile entity.
   * @throws {ValidationException} If input validation fails.
   */
  create(input: CreateStudentProfileInput): StudentProfile {
    this.validateInput(input);

    const now = new Date();

    return new StudentProfile({
      id: null,
      userId: input.userId,
      fullName: input.fullName,
      phone: null,
      address: null,
      university: null,
      major: null,
      avatarUrl: null,
      defaultCvId: null,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validate the Construction Invariants before creating a StudentProfile.
   *
   * Factory only validates structural requirements necessary to create
   * a valid entity. Business rules (e.g. role must be STUDENT) are
   * validated by the Application Layer (CreateStudentProfileUseCase).
   *
   * @param input - The input data to validate.
   * @throws {ValidationException} If validation fails.
   */
  private validateInput(input: CreateStudentProfileInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationException("userId is required");
    }

    if (!input.fullName || input.fullName.trim().length === 0) {
      throw new ValidationException("fullName is required");
    }
  }
}
