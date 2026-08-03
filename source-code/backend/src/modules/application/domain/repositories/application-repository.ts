import { Application } from "../entities/application";

/**
 * Repository interface for Application aggregate root.
 *
 * ══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Repository pattern provides a collection-like interface for
 * accessing domain objects while abstracting away the underlying
 * persistence mechanism (database, cache, API, etc.).
 *
 * Key benefits:
 * 1. Domain layer depends on abstractions, not infrastructure.
 * 2. Persistence logic is isolated in Infrastructure layer.
 * 3. Domain entities remain pure — no database annotations/mixins.
 * 4. Facilitates unit testing via mock implementations.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CONTRACT
 * ═══════════════════════════════════════════════════════════════════
 *
 * This interface defines the minimum contract that any
 * Application repository implementation must fulfil.
 *
 * Implementation lives in the Infrastructure layer
 * (e.g. src/modules/application/infrastructure/persistence/).
 *
 * @category Domain Repository
 */
export interface IApplicationRepository {
  /**
   * Find an application by its unique identifier.
   *
   * @param id - The unique identifier of the application.
   * @returns The Application entity if found, or `null` if not.
   */
  findById(id: string): Promise<Application | null>;

  /**
   * Find an application submitted by a specific student for a specific job.
   *
   * Used for an efficient duplicate-application check (BR-08) instead of
   * loading the student's full application list and filtering in memory.
   *
   * @param jobId - The unique identifier of the job posting.
   * @param studentId - The unique identifier of the student profile.
   * @returns The Application entity if found, or `null` if not.
   */
  findByJobAndStudent(jobId: string, studentId: string): Promise<Application | null>;

  /**
   * Find all applications submitted by a student.
   *
   * @param studentId - The unique identifier of the student.
   * @returns An array of Application entities.
   */
  findByStudentId(studentId: string): Promise<Application[]>;

  /**
   * Find all applications received for an employer's job postings.
   *
   * @param employerId - The unique identifier of the employer.
   * @returns An array of Application entities.
   */
  findByEmployerId(employerId: string): Promise<Application[]>;

  /**
   * Find all applications for a specific job posting.
   *
   * @param jobId - The unique identifier of the job posting.
   * @returns An array of Application entities.
   */
  findByJobId(jobId: string): Promise<Application[]>;

  /**
   * Persist a new application entity.
   *
   * @param application - The Application entity to create.
   */
  create(application: Application): Promise<void>;

  /**
   * Update an existing application entity.
   *
   * @param application - The Application entity with updated values.
   */
  update(application: Application): Promise<void>;

  /**
   * Delete an application by its unique identifier.
   *
   * @param id - The unique identifier of the application to delete.
   */
  delete(id: string): Promise<void>;

  /**
   * Check whether an application exists with the given identifier.
   *
   * @param id - The unique identifier of the application.
   * @returns `true` if the application exists, `false` otherwise.
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find applications for a student with pagination.
   *
   * @param studentId - The unique identifier of the student.
   * @param page      - The page number (1-based).
   * @param limit     - The number of items per page.
   * @returns An object containing the items array and total count.
   */
  findByStudentIdPaginated(
    studentId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Application[]; total: number }>;

  /**
   * Find applications for an employer with pagination.
   *
   * @param employerId - The unique identifier of the employer.
   * @param page       - The page number (1-based).
   * @param limit      - The number of items per page.
   * @returns An object containing the items array and total count.
   */
  findByEmployerIdPaginated(
    employerId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Application[]; total: number }>;
}
