import { EmployerProfile } from "./employer-profile";
import { ValidationException } from "../../../common/exceptions/validation-exception";

/**
 * Input data required to create a new EmployerProfile via EmployerProfileFactory.
 */
export interface CreateEmployerProfileInput {
  /** The ID of the User this profile belongs to. */
  userId: string;
  /** The company name. */
  companyName: string;
}

/**
 * Factory for creating EmployerProfile domain entities.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate Construction Invariants (userId, companyName).
 * 2. Set sensible defaults for all optional fields.
 * 3. Return a fully constructed EmployerProfile entity.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THE FACTORY VALIDATES (CONSTRUCTION INVARIANTS)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The factory validates only the structural invariants necessary to
 * guarantee that the created EmployerProfile entity is internally
 * consistent:
 *
 *   • userId must not be empty.
 *   • companyName must not be empty.
 *
 * These are the minimum requirements to construct a valid entity.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THE FACTORY DOES NOT VALIDATE (BUSINESS RULES)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The following validations are BUSINESS RULES and MUST be enforced
 * by the Application Layer (CreateEmployerProfileUseCase) BEFORE
 * calling this factory:
 *
 *   • Role validation:    user.role === "EMPLOYER"
 *   • Duplicate profile:  employer profile for this userId does not
 *                         already exist in the database.
 *   • Duplicate email:    contact email (if provided) is not already
 *                         in use by another employer.
 *   • Duplicate taxCode:  taxCode (if provided) is not already in use
 *                         by another employer.
 *
 * Why? Because enforcing these rules requires reading from a
 * Repository or checking against external state. The Domain Layer
 * has no knowledge of persistence — that is the responsibility of
 * the Application Layer.
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
 * The EmployerProfile entity's `id` is set to `null` because ID
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
 * - Does NOT call any Service.
 * - Does NOT call any API.
 * - Does NOT access Infrastructure.
 * - Does NOT validate business rules (role checks, uniqueness checks).
 * - ONLY creates an EmployerProfile object.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Factory
 */
export class EmployerProfileFactory {
  /**
   * Create a new EmployerProfile domain entity.
   *
   * @param input - The data required to create the employer profile.
   * @returns A fully constructed EmployerProfile entity.
   * @throws {ValidationException} If input validation fails.
   */
  create(input: CreateEmployerProfileInput): EmployerProfile {
    this.validateInput(input);

    const now = new Date();

    return new EmployerProfile({
      id: null,
      userId: input.userId,
      companyName: input.companyName,
      description: null,
      website: null,
      logoUrl: null,
      verified: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validate the Construction Invariants before creating an EmployerProfile.
   *
   * Factory only validates structural requirements necessary to create
   * a valid entity. Business rules (e.g. role must be EMPLOYER,
   * uniqueness checks) are validated by the Application Layer
   * (CreateEmployerProfileUseCase).
   *
   * @param input - The input data to validate.
   * @throws {ValidationException} If validation fails.
   */
  private validateInput(input: CreateEmployerProfileInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationException("userId is required");
    }

    if (!input.companyName || input.companyName.trim().length === 0) {
      throw new ValidationException("companyName is required");
    }
  }
}
