/**
 * IRefreshTokenRepository — Repository Interface for RefreshToken entity.
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
 *   ┌──────────────┐     depends on     ┌────────────────────────────┐
 *   │  Use Cases   │ ──────────────────> │  IRefreshTokenRepository   │  ◄── Abstraction
 *   │  (Domain)    │                     │  (Domain/Repos)            │
 *   └──────────────┘                     └────────────────────────────┘
 *                                              ▲
 *                                              │ implements
 *                                              │
 *                                   ┌────────────────────────────┐
 *                                   │  PrismaRefreshTokenRepo    │
 *                                   │  (Infrastructure)          │
 *                                   └────────────────────────────┘
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
 * a concrete implementation (e.g. PrismaRefreshTokenRepository)
 * that maps between the domain model and the database schema.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THIS INTERFACE IS NOT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ✗ NOT an implementation — no Prisma, no SQL, no database calls.
 *   ✗ NOT a service — no business logic, no validation, no hashing.
 *   ✗ NOT a factory — no ID generation, no entity construction.
 *   ✗ NOT an event emitter — no domain events, no notifications.
 *   ✗ NOT a token store — does NOT store plain refresh tokens.
 *       Only works with **tokenHash** (hashed token value).
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY TOKEN HASH ONLY?
 * ═══════════════════════════════════════════════════════════════════
 *
 * Storing plain refresh tokens in the database is a security risk.
 * If the database is compromised, an attacker could steal all active
 * sessions. By storing only the **hash** of each refresh token, we
 * ensure that:
 *
 *   1. A database breach does not leak valid refresh tokens.
 *   2. Token verification is done by comparing hashes.
 *   3. The original plain token is only known to the client.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE IN USE CASES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   LoginUseCase
 *     ↓
 *   IRefreshTokenRepository.create(token)
 *
 *   RefreshTokenUseCase
 *     ↓
 *   IRefreshTokenRepository.findByTokenHash(tokenHash)
 *     ↓
 *   IRefreshTokenRepository.update(token)
 *
 *   LogoutUseCase
 *     ↓
 *   IRefreshTokenRepository.deleteByUserId(userId)
 *
 *   RevokeTokenUseCase
 *     ↓
 *   IRefreshTokenRepository.update(token)
 *     ↓
 *   IRefreshTokenRepository.delete(id)
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Repository
 */

import { RefreshToken } from "../entities/refresh-token";

/**
 * Repository interface for RefreshToken persistence operations.
 *
 * Defines the contract for storing, retrieving, and deleting
 * RefreshToken entities. The repository works exclusively with
 * **tokenHash** — never with plain token values.
 *
 * @remarks
 * - All methods return Promises (repositories are inherently async).
 * - `findById` and `findByTokenHash` return `null` when no entity
 *   is found (not `undefined`, not throwing an exception).
 * - `create` and `update` return the persisted entity (which may have
 *   database-generated fields like `id` populated).
 * - `delete` is idempotent — deleting a non-existent entity should
 *   not throw an error.
 * - `deleteByUserId` removes ALL refresh tokens belonging to a user
 *   (e.g. during logout or when all sessions must be terminated).
 */
export interface IRefreshTokenRepository {
  /**
   * Find a refresh token by its unique identifier.
   *
   * @param id - The unique identifier of the refresh token.
   * @returns The RefreshToken entity if found, otherwise `null`.
   */
  findById(id: string): Promise<RefreshToken | null>;

  /**
   * Find a refresh token by its hashed value.
   *
   * The repository only works with token hashes — never with plain
   * refresh token strings. Token hash comparison is the responsibility
   * of the infrastructure implementation.
   *
   * @param tokenHash - The hashed value of the refresh token.
   * @returns The RefreshToken entity if found, otherwise `null`.
   */
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;

  /**
   * Persist a new refresh token entity.
   *
   * @param token - The RefreshToken entity to persist.
   * @returns The persisted RefreshToken entity (with database-generated fields).
   */
  create(token: RefreshToken): Promise<RefreshToken>;

  /**
   * Update an existing refresh token entity.
   *
   * Used to update metadata (e.g., `revokedAt`, `updatedAt`) on
   * an existing refresh token.
   *
   * @param token - The RefreshToken entity with updated values.
   * @returns The updated RefreshToken entity.
   */
  update(token: RefreshToken): Promise<RefreshToken>;

  /**
   * Delete a refresh token by its unique identifier.
   *
   * This operation is idempotent — calling it on a non-existent
   * token ID will not throw an error.
   *
   * @param id - The unique identifier of the refresh token to delete.
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all refresh tokens belonging to a specific user.
   *
   * Used when:
   *   - A user logs out (invalidate all sessions).
   *   - An admin terminates all of a user's sessions.
   *   - A user's account is deactivated/deleted.
   *
   * @param userId - The unique identifier of the user.
   */
  deleteByUserId(userId: string): Promise<void>;
}
