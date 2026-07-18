import { CVMetadata } from "../entities/cv-metadata";

/**
 * Repository interface for CVMetadata aggregate root.
 *
 * ═══════════════════════════════════════════════════════════════════
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
 * CVMetadata repository implementation must fulfil.
 *
 * Implementation lives in the Infrastructure layer
 * (e.g. src/modules/student/infrastructure/persistence/).
 *
 * ═══════════════════════════════════════════════════════════════════
 * PERSISTENCE BELONGS TO REPOSITORY
 * ═══════════════════════════════════════════════════════════════════
 *
 * The repository is responsible for all persistence concerns:
 *   - Mapping between domain entities and database models
 *   - CRUD operations
 *   - Existence checks
 *   - Querying by domain-relevant criteria
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS RULES BELONG TO USECASE
 * ═══════════════════════════════════════════════════════════════════
 *
 * The repository does NOT enforce business rules such as:
 *   - Student existence
 *   - Upload quotas / max upload limits
 *   - Virus scanning
 *   - Duplicate filename
 *   - Duplicate hash
 *   - Permission checks
 *   - Default uniqueness
 *
 * These are business flow concerns that belong to the Application
 * Layer (Use Cases).
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Repository
 */
export interface ICVRepository {
  /**
   * Find CV metadata by its unique identifier.
   *
   * @param id - The unique identifier of the CV metadata.
   * @returns The CVMetadata entity if found, or `null` if not.
   */
  findById(id: string): Promise<CVMetadata | null>;

  /**
   * Find all CV metadata records belonging to a student.
   *
   * @param studentId - The unique identifier of the student.
   * @returns An array of CVMetadata entities (empty array if none found).
   */
  findByStudentId(studentId: string): Promise<CVMetadata[]>;

  /**
   * Find the default CV metadata for a student.
   *
   * @param studentId - The unique identifier of the student.
   * @returns The default CVMetadata entity if found, or `null` if not.
   */
  findDefaultByStudentId(studentId: string): Promise<CVMetadata | null>;

  /**
   * Persist a new CV metadata entity.
   *
   * @param cv - The CVMetadata entity to create.
   * @returns The created CVMetadata entity with generated ID.
   */
  create(cv: CVMetadata): Promise<CVMetadata>;

  /**
   * Update an existing CV metadata entity.
   *
   * @param cv - The CVMetadata entity with updated values.
   * @returns The updated CVMetadata entity.
   */
  update(cv: CVMetadata): Promise<CVMetadata>;

  /**
   * Delete CV metadata by its unique identifier.
   *
   * @param id - The unique identifier of the CV metadata to delete.
   */
  delete(id: string): Promise<void>;

  /**
   * Check whether CV metadata exists for the given ID.
   *
   * @param id - The unique identifier to check.
   * @returns `true` if a record exists, `false` otherwise.
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check whether CV metadata exists for the given storage path.
   *
   * @param path - The storage path to check.
   * @returns `true` if a record exists, `false` otherwise.
   */
  existsByStoragePath(path: string): Promise<boolean>;
}
