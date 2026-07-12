/**
 * JobPostingFactory — creates JobPosting domain entities.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate Construction Invariants (employerId, title, description,
 *    expiresAt).
 * 2. Set sensible defaults for all fields not provided in the input.
 * 3. Return a fully constructed JobPosting entity in the DRAFT state.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THE FACTORY VALIDATES (CONSTRUCTION INVARIANTS)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The factory validates only the structural invariants necessary to
 * guarantee that the created JobPosting entity is internally
 * consistent:
 *
 *   • employerId must not be empty.
 *   • title must not be empty.
 *   • title must not exceed 120 characters.
 *   • description must not be empty.
 *   • expiresAt must be after createdAt (in the future).
 *
 * These are the minimum requirements to construct a valid entity.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THE FACTORY DOES NOT VALIDATE (BUSINESS RULES)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The following validations are BUSINESS RULES and MUST be enforced
 * by the Application Layer (CreateJobPostingUseCase) BEFORE calling
 * this factory:
 *
 *   • Employer exists:            employerId references a valid user.
 *   • Employer is verified:       employer profile must be verified.
 *   • Posting quota:              employer has not exceeded their
 *                                 active job posting limit.
 *   • Duplicate job:              no identical job posting already
 *                                 exists for this employer.
 *   • Permission to create:       the authenticated user has the
 *                                 EMPLOYER role.
 *   • Number of open postings:    employer does not exceed the
 *                                 maximum allowed open postings.
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
 * The JobPosting entity's `id` is set to `null` because ID generation
 * is a persistence concern. The database (Prisma) generates the actual
 * ID (cuid) when the entity is first saved. The factory stays focused
 * solely on domain object creation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEFAULT VALUES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   id              = null
 *   state           = DRAFT
 *   approvedAt      = null
 *   approvedBy      = null
 *   rejectionReason = null
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
 * - Does NOT validate business rules (employer existence, verification,
 *   quota, duplicates, permissions).
 * - ONLY creates a JobPosting object.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Factory
 */

import { JobPosting, JobPostingState } from "./job-posting";
import { ValidationException } from "../../../common/exceptions/validation-exception";

/**
 * Input data required to create a new JobPosting via JobPostingFactory.
 */
export interface CreateJobPostingInput {
  /** The ID of the employer who owns this job posting. */
  employerId: string;
  /** The job title (max 120 characters). */
  title: string;
  /** The job description. */
  description: string;
  /** The job requirements. */
  requirements: string;
  /** Minimum salary (nullable). */
  salaryMin?: number | null;
  /** Maximum salary (nullable). */
  salaryMax?: number | null;
  /** Currency code (defaults to "VND"). */
  currency?: string;
  /** Job location. */
  location: string;
  /** The expiration date. Must be in the future. */
  expiresAt: Date;
}

export class JobPostingFactory {
  /**
   * Create a new JobPosting domain entity.
   *
   * @param input - The data required to create the job posting.
   * @returns A fully constructed JobPosting entity in DRAFT state.
   * @throws {ValidationException} If construction invariant validation fails.
   */
  create(input: CreateJobPostingInput): JobPosting {
    this.validateInput(input);

    const now = new Date();
    const state = JobPostingState.DRAFT;

    return new JobPosting({
      id: null,
      employerId: input.employerId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      currency: input.currency ?? "VND",
      location: input.location,
      state,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      expiresAt: input.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validate the Construction Invariants before creating a JobPosting.
   *
   * Factory only validates structural requirements necessary to create
   * a valid entity. Business rules (e.g. employer exists, employer is
   * verified, posting quota, duplicate check) are validated by the
   * Application Layer (CreateJobPostingUseCase).
   *
   * @param input - The input data to validate.
   * @throws {ValidationException} If validation fails.
   */
  private validateInput(input: CreateJobPostingInput): void {
    if (!input.employerId || input.employerId.trim().length === 0) {
      throw new ValidationException("employerId is required");
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationException("title is required");
    }

    if (input.title && input.title.length > 120) {
      throw new ValidationException("title must not exceed 120 characters");
    }

    if (!input.description || input.description.trim().length === 0) {
      throw new ValidationException("description is required");
    }

    if (!input.expiresAt || input.expiresAt <= new Date()) {
      throw new ValidationException("expiresAt must be after createdAt");
    }
  }
}
