/**
 * PrismaUserRepository — Concrete IUserRepository implementation using Prisma ORM.
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN (INFRASTRUCTURE LAYER)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This class implements the IUserRepository interface defined in the
 * Domain layer. It sits in the Infrastructure layer and translates
 * between domain objects (User entity, Email value object) and the
 * Prisma ORM model.
 *
 * ═══════════════════════════════════════════════════════════════════
 * LAYER VIOLATION PREVENTION
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌──────────────────────┐
 *   │   Domain Layer       │  IUserRepository (interface)
 *   │   (User, Email, …)   │
 *   └──────────┬───────────┘
 *              │ implements
 *              ▼
 *   ┌──────────────────────┐
 *   │ Infrastructure Layer │  PrismaUserRepository
 *   │ (Prisma, DB, Exceptions)│
 *   └──────────────────────┘
 *
 * Prisma-specific types NEVER leak to the Domain layer. Inputs are
 * domain entities/VOs; outputs are domain entities/VOs.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PERSISTENCE MAPPING
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌─────────────┐     toPersistence()     ┌─────────────────┐
 *   │  User Entity │ ───────────────────────> │ Prisma User Row │
 *   │  (Domain)    │                          │  (Database)     │
 *   └─────────────┘ <─────────────────────── └─────────────────┘
 *                     toDomain()
 *
 * Two private mapping methods encapsulate all conversion logic:
 *   - toDomain(prismaUser)   → User entity
 *   - toPersistence(user)    → Prisma create/update input
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * PrismaClient is injected via the constructor from the Composition
 * Root (e.g., main.ts or a DI container). The repository NEVER
 * instantiates its own PrismaClient — this keeps the class testable
 * and follows the Dependency Inversion Principle.
 *
 *   const prisma = new PrismaClient();
 *   const userRepo = new PrismaUserRepository(prisma);
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRISMA ONLY EXISTS IN INFRASTRUCTURE
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Prisma is imported ONLY in this file and other infrastructure files.
 * - Domain entities, Use Cases, and Controllers never import Prisma.
 * - If the ORM changes (e.g., to Drizzle or TypeORM), ONLY the
 *   infrastructure layer needs to be modified.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Infrastructure Repository
 */

import { PrismaClient, Prisma, Role } from "../../../../generated/prisma";
import { IUserRepository } from "../../domain/repositories/user-repository";
import { User, UserProps } from "../../domain/entities/user";
import { Email } from "../../domain/value-objects/email";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

/**
 * Prisma-based implementation of the IUserRepository interface.
 *
 * @remarks
 * This repository translates between **domain entities** (User)
 * and **Prisma models** (database rows). All public methods accept
 * and return domain types — Prisma types are never exposed.
 *
 * Error handling catches Prisma exceptions and rethrows them as
 * {@link InfrastructureException}, keeping Prisma-specific errors
 * contained within the infrastructure layer.
 */
export class PrismaUserRepository implements IUserRepository {
  /**
   * @param prisma - The PrismaClient instance injected from the Composition Root.
   */
  constructor(private readonly prisma: PrismaClient) {}

  // ── Public methods ───────────────────────────────────────────────

  /**
   * {@inheritDoc IUserRepository.findById}
   *
   * @remarks
   * Logs the operation at debug level. Returns `null` when the user
   * is not found (not throwing an exception).
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        logger.debug({ userId: id }, "User not found by id");
        return null;
      }

      logger.debug({ userId: id }, "User found by id");
      return this.toDomain(user);
    } catch (error) {
      logger.error({ error, userId: id }, "Failed to find user by id");
      throw new InfrastructureException("Failed to find user by id", {
        userId: id,
      });
    }
  }

  /**
   * {@inheritDoc IUserRepository.findByEmail}
   *
   * @remarks
   * The email is extracted via `email.value()` for the Prisma query.
   * Logs the operation at debug level — the email address itself is
   * safe to log as it is not a secret (it is not a passwordHash or
   * token).
   */
  async findByEmail(email: Email): Promise<User | null> {
    const emailValue = email.value();

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: emailValue },
      });

      if (!user) {
        logger.debug({ email: emailValue }, "User not found by email");
        return null;
      }

      logger.debug({ email: emailValue }, "User found by email");
      return this.toDomain(user);
    } catch (error) {
      logger.error({ error, email: emailValue }, "Failed to find user by email");
      throw new InfrastructureException("Failed to find user by email", {
        email: emailValue,
      });
    }
  }

  /**
   * {@inheritDoc IUserRepository.create}
   *
   * @remarks
   * The persisted User entity is returned with the database-generated
   * `id` populated. Logs at info level without logging the passwordHash.
   */
  async create(user: User): Promise<User> {
    const createInput = this.toCreateInput(user);

    try {
      const created = await this.prisma.user.create({
        data: createInput,
      });

      logger.info(
        { userId: created.id, email: created.email, role: created.role },
        "User created successfully",
      );

      return this.toDomain(created);
    } catch (error) {
      logger.error({ error, email: user.email }, "Failed to create user");
      throw new InfrastructureException("Failed to create user", {
        email: user.email,
      });
    }
  }

  /**
   * {@inheritDoc IUserRepository.update}
   *
   * @remarks
   * Requires the user to have an `id` (i.e., must have been persisted
   * previously). Logs at info level without logging the passwordHash.
   */
  async update(user: User): Promise<User> {
    const userId = user.id;

    if (!userId) {
      throw new InfrastructureException("Cannot update user without an id");
    }

    const updateInput = this.toUpdateInput(user);

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: updateInput,
      });

      logger.info({ userId: updated.id }, "User updated successfully");

      return this.toDomain(updated);
    } catch (error) {
      // If the record does not exist, Prisma throws a known error.
      // We wrap it in InfrastructureException to stay consistent.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ userId }, "Attempted to update non-existent user");
        throw new InfrastructureException("User not found for update", {
          userId,
        });
      }

      logger.error({ error, userId }, "Failed to update user");
      throw new InfrastructureException("Failed to update user", {
        userId,
      });
    }
  }

  /**
   * {@inheritDoc IUserRepository.delete}
   *
   * @remarks
   * Idempotent: deleting a non-existent user ID does not throw.
   * Logs at info level when a user is deleted.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      logger.info({ userId: id }, "User deleted successfully");
    } catch (error) {
      // P2025 = Record to delete does not exist — idempotent, so ignore.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.debug({ userId: id }, "Delete called on non-existent user (idempotent)");
        return;
      }

      logger.error({ error, userId: id }, "Failed to delete user");
      throw new InfrastructureException("Failed to delete user", {
        userId: id,
      });
    }
  }

  /**
   * {@inheritDoc IUserRepository.existsByEmail}
   *
   * @remarks
   * Uses Prisma's `findUnique` with a select-only query for maximum
   * efficiency — only fetches the `id` column rather than the full row.
   * Logs at debug level.
   */
  async existsByEmail(email: Email): Promise<boolean> {
    const emailValue = email.value();

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: emailValue },
        select: { id: true },
      });

      logger.debug({ email: emailValue, exists: !!user }, "Checked email existence");

      return user !== null;
    } catch (error) {
      logger.error({ error, email: emailValue }, "Failed to check email existence");
      throw new InfrastructureException("Failed to check email existence", {
        email: emailValue,
      });
    }
  }

  // ── Private mapping methods ──────────────────────────────────────

  /**
   * Map a Prisma User model (database row) to a domain User entity.
   *
   * This method is the **only** place where a Prisma model is
   * converted to a domain entity. All public methods that return
   * a User entity go through this method, ensuring consistent mapping.
   *
   * @param model - The Prisma User model (from the database).
   * @returns A fully constructed User domain entity.
   */
  private toDomain(model: {
    id: string;
    email: string;
    passwordHash: string;
    role: Role;
    isActive: boolean;
    emailVerified: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    const props: UserProps = {
      id: model.id,
      email: model.email,
      passwordHash: model.passwordHash,
      role: model.role,
      isActive: model.isActive,
      emailVerified: model.emailVerified,
      failedLoginAttempts: model.failedLoginAttempts,
      lockedUntil: model.lockedUntil,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return new User(props);
  }

  /**
   * Map a User domain entity to a Prisma `UserCreateInput`.
   *
   * Used by the `create` method to persist a new user. The `id` is
   * omitted so Prisma generates it automatically (cuid).
   *
   * @param entity - The User domain entity to persist.
   * @returns A Prisma UserCreateInput object.
   */
  private toCreateInput(entity: User): Prisma.UserCreateInput {
    return {
      email: entity.email,
      passwordHash: entity.passwordHash,
      role: entity.role as Role,
      isActive: entity.isActive,
      emailVerified: entity.emailVerified,
      failedLoginAttempts: entity.failedLoginAttempts,
      lockedUntil: entity.lockedUntil,
    };
  }

  /**
   * Map a User domain entity to a Prisma `UserUpdateInput`.
   *
   * Used by the `update` method. Only the fields that are present
   * on the entity are included in the update payload.
   *
   * @param entity - The User domain entity with updated values.
   * @returns A Prisma UserUpdateInput object.
   */
  private toUpdateInput(entity: User): Prisma.UserUpdateInput {
    return {
      email: entity.email,
      passwordHash: entity.passwordHash,
      role: entity.role as Role,
      isActive: entity.isActive,
      emailVerified: entity.emailVerified,
      failedLoginAttempts: entity.failedLoginAttempts,
      lockedUntil: entity.lockedUntil,
    };
  }
}
