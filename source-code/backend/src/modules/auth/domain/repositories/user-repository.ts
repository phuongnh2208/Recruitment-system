/**
 * IUserRepository — Repository Interface for User entity.
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Repository pattern mediates between the domain and data-mapping
 * layers, acting like an in-memory collection of domain objects.
 * Use Cases depend on this interface — NOT on concrete implementations
 * (e.g. Prisma, TypeORM, in-memory). This is the Dependency Inversion
 * Principle at work: high-level modules (Use Cases) should not depend
 * on low-level modules (Infrastructure); both should depend on
 * abstractions (this interface).
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION PRINCIPLE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌──────────────┐     depends on     ┌──────────────────────┐
 *   │  Use Cases   │ ──────────────────> │  IUserRepository     │  ◄── Abstraction
 *   │  (Domain)    │                     │  (Domain/Repos)      │
 *   └──────────────┘                     └──────────────────────┘
 *                                              ▲
 *                                              │ implements
 *                                              │
 *                                   ┌──────────────────────┐
 *                                   │  PrismaUserRepo      │
 *                                   │  (Infrastructure)    │
 *                                   └──────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════
 * PERSISTENCE IGNORANCE
 * ═══════════════════════════════════════════════════════════════════
 *
 * The interface is completely agnostic about:
 *   - The database system (PostgreSQL, MySQL, MongoDB, …)
 *   - The ORM (Prisma, TypeORM, Drizzle, …)
 *   - The storage medium (SQL, NoSQL, file system, …)
 *   - Connection management, transactions, migrations
 *
 * This is a pure contract. The Infrastructure layer will provide
 * a concrete implementation (e.g. PrismaUserRepository) that maps
 * between the domain model and the database schema.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THIS INTERFACE IS NOT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ✗ NOT an implementation — no Prisma, no SQL, no database calls.
 *   ✗ NOT a service — no business logic, no validation, no hashing.
 *   ✗ NOT a factory — no ID generation, no entity construction.
 *   ✗ NOT an event emitter — no domain events, no notifications.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE IN USE CASES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   RegisterUseCase
 *     ↓
 *   IUserRepository.create(user)
 *
 *   LoginUseCase
 *     ↓
 *   IUserRepository.findByEmail(email)
 *
 *   GetProfileUseCase
 *     ↓
 *   IUserRepository.findById(id)
 *
 *   UpdateProfileUseCase
 *     ↓
 *   IUserRepository.update(user)
 *
 *   DeleteAccountUseCase
 *     ↓
 *   IUserRepository.delete(id)
 *
 *   CheckDuplicateEmailUseCase
 *     ↓
 *   IUserRepository.existsByEmail(email)
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Repository
 */

import { User } from "../entities/user";
import { Email } from "../value-objects/email";

/**
 * Repository interface for User persistence operations.
 *
 * Defines the contract for storing, retrieving, and deleting User
 * entities. Each method operates on the **domain entity** (User),
 * not on a database model or DTO.
 *
 * @remarks
 * - All methods return Promises (repositories are inherently async).
 * - `findById` and `findByEmail` return `null` when no entity is found
 *   (not `undefined`, not throwing an exception).
 * - `create` and `update` return the persisted entity (which may have
 *   database-generated fields like `id` populated).
 * - `delete` is idempotent — deleting a non-existent entity should
 *   not throw an error.
 */
export interface IUserRepository {
  /**
   * Find a user by their unique identifier.
   *
   * @param id - The unique identifier of the user.
   * @returns The User entity if found, otherwise `null`.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their email address.
   *
   * @param email - The Email value object to search for.
   * @returns The User entity if found, otherwise `null`.
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Persist a new user entity.
   *
   * @param user - The User entity to persist.
   * @returns The persisted User entity (with database-generated fields).
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user entity.
   *
   * @param user - The User entity with updated values.
   * @returns The updated User entity.
   */
  update(user: User): Promise<User>;

  /**
   * Delete a user by their unique identifier.
   *
   * This operation is idempotent — calling it on a non-existent
   * user ID will not throw an error.
   *
   * @param id - The unique identifier of the user to delete.
   */
  delete(id: string): Promise<void>;

  /**
   * Check whether a user with the given email already exists.
   *
   * @param email - The Email value object to check.
   * @returns `true` if a user with this email exists, otherwise `false`.
   */
  existsByEmail(email: Email): Promise<boolean>;
}
