import { StudentProfile } from "../entities/student-profile";

/**
 * Repository interface for StudentProfile aggregate root.
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
 * StudentProfile repository implementation must fulfil.
 *
 * Implementation lives in the Infrastructure layer
 * (e.g. src/modules/student/infrastructure/persistence/).
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Repository
 */
export interface IStudentProfileRepository {
  /**
   * Find a student profile by its unique identifier.
   *
   * @param id - The unique identifier of the student profile.
   * @returns The StudentProfile entity if found, or `null` if not.
   */
  findById(id: string): Promise<StudentProfile | null>;

  /**
   * Find a student profile by the associated user ID.
   *
   * @param userId - The unique identifier of the associated user.
   * @returns The StudentProfile entity if found, or `null` if not.
   */
  findByUserId(userId: string): Promise<StudentProfile | null>;

  /**
   * Persist a new student profile entity.
   *
   * @param profile - The StudentProfile entity to create.
   * @returns The created StudentProfile entity with generated ID.
   */
  create(profile: StudentProfile): Promise<StudentProfile>;

  /**
   * Update an existing student profile entity.
   *
   * @param profile - The StudentProfile entity with updated values.
   * @returns The updated StudentProfile entity.
   */
  update(profile: StudentProfile): Promise<StudentProfile>;

  /**
   * Delete a student profile by its unique identifier.
   *
   * @param id - The unique identifier of the student profile to delete.
   */
  delete(id: string): Promise<void>;

  /**
   * Check whether a student profile exists for the given user ID.
   *
   * @param userId - The unique identifier of the associated user.
   * @returns `true` if a profile exists, `false` otherwise.
   */
  existsByUserId(userId: string): Promise<boolean>;
}
