/**
 * ApplicationFactory — creates Application domain entities.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate Construction Invariants (studentId, jobPostingId, cvId).
 * 2. Set sensible defaults for all fields not provided in the input.
 * 3. Return a fully constructed Application entity in APPLIED state.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THE FACTORY VALIDATES (CONSTRUCTION INVARIANTS)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The factory validates only the structural invariants necessary to
 * guarantee that the created Application entity is internally
 * consistent:
 *
 *   • studentId must not be empty.
 *   • jobPostingId must not be empty.
 *   • cvId must not be empty.
 *
 * These are the minimum requirements to construct a valid entity.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THE FACTORY DOES NOT VALIDATE (BUSINESS RULES)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The following validations are BUSINESS RULES and MUST be enforced
 * by the Application Layer (ApplyJobUseCase) BEFORE calling this
 * factory:
 *
 *   • BR-01 Duplicate application:  student has not already applied
 *                                   to the same job posting.
 *   • BR-02 Student active:         the student profile must be
 *                                   active/verified.
 *   • Job posting exists:           jobPostingId references a valid
 *                                   job posting.
 *   • Student exists:               studentId references a valid user.
 *   • CV exists:                    cvId references a valid CV.
 *   • Deadline:                     the job posting is still accepting
 *                                   applications (not expired/closed).
 *   • Employer:                     the employer profile is valid.
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
 * The Application entity's `id` is set to `null` because ID generation
 * is a persistence concern. The database (Prisma) generates the actual
 * ID (cuid) when the entity is first saved. The factory stays focused
 * solely on domain object creation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEFAULT VALUES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   id              = null
 *   state           = ApplicationState.applied()
 *   rejectionReason = null
 *   appliedAt       = now
 *   reviewedAt      = null
 *   reviewedBy      = null
 *   createdAt       = now
 *   updatedAt       = now
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
 * - Does NOT validate business rules (duplicate application, student
 *   active, job existence, student existence, CV existence, deadline,
 *   employer).
 * - ONLY creates an Application object.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Factory
 */

import { Application } from "../entities/application";
import { ApplicationState } from "../value-objects/application-state";
import { ValidationException } from "../../../../common/exceptions/validation-exception";

/**
 * Input data required to create a new Application via ApplicationFactory.
 */
export interface CreateApplicationInput {
  /** The ID of the student submitting the application. */
  studentId: string;
  /** The ID of the job posting being applied to. */
  jobPostingId: string;
  /** The ID of the CV to attach to this application. */
  cvId: string;
}

export class ApplicationFactory {
  /**
   * Create a new Application domain entity.
   *
   * @param input - The data required to create the application.
   * @returns A fully constructed Application entity in APPLIED state.
   * @throws {ValidationException} If construction invariant validation fails.
   */
  create(input: CreateApplicationInput): Application {
    this.validateInput(input);

    const now = new Date();

    return new Application({
      id: null,
      studentId: input.studentId,
      jobPostingId: input.jobPostingId,
      cvId: input.cvId,
      state: ApplicationState.applied(),
      rejectionReason: null,
      appliedAt: now,
      reviewedAt: null,
      reviewedBy: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validate the Construction Invariants before creating an Application.
   *
   * Factory only validates structural requirements necessary to create
   * a valid entity. Business rules (e.g. BR-01 duplicate application,
   * BR-02 student active, job existence, student existence, CV existence,
   * deadline, employer) are validated by the Application Layer
   * (ApplyJobUseCase).
   *
   * @param input - The input data to validate.
   * @throws {ValidationException} If validation fails.
   */
  private validateInput(input: CreateApplicationInput): void {
    if (!input.studentId || input.studentId.trim().length === 0) {
      throw new ValidationException("studentId is required");
    }

    if (!input.jobPostingId || input.jobPostingId.trim().length === 0) {
      throw new ValidationException("jobPostingId is required");
    }

    if (!input.cvId || input.cvId.trim().length === 0) {
      throw new ValidationException("cvId is required");
    }
  }
}
