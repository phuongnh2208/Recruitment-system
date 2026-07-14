/**
 * PrismaRefreshTokenRepository — Concrete IRefreshTokenRepository implementation using Prisma ORM.
 *
 * ══════════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN (INFRASTRUCTURE LAYER)
 * ══════════════════════════════════════════════════════════════════════
 *
 * This class implements the IRefreshTokenRepository interface defined in the
 * Domain layer. It sits in the Infrastructure layer and translates
 * between domain objects (RefreshToken entity) and the Prisma ORM model.
 *
 * ══════════════════════════════════════════════════════════════════════
 * LAYER VIOLATION PREVENTION
 * ══════════════════════════════════════════════════════════════════════
 *
 *   ┌──────────────────────┐
 *   │   Domain Layer       │  IRefreshTokenRepository (interface)
 *   │   (RefreshToken, …)  │
 *   └──────────┬───────────┘
 *              │ implements
 *              ▼
 *   ┌──────────────────────┐
 *   │ Infrastructure Layer │  PrismaRefreshTokenRepository
 *   │   (Prisma, DB, Exceptions)│
 *   └──────────────────────┘
 *
 * Prisma-specific types NEVER leak to the Domain layer. Inputs are
 * domain entities; outputs are domain entities.
 *
 * ═════════════════════════════════════════════════════════════════════
 * PERSISTENCE MAPPING
 * ═════════════════════════════════════════════════════════════════════
 *
 *   ┌─────────────────┐     toPersistence()     ┌──────────────────┐
 *   │ RefreshToken    │ ───────────────────────> │ Prisma RefreshToken Row │
 *   │  (Domain)       │                         │  (Database)        │
 *   └─────────────────┘ <─────────────────────── └──────────────────┘
 *                       toDomain()
 *
 * Two private mapping methods encapsulate all conversion logic:
 *   - toDomain(prismaRefreshToken)   → RefreshToken entity
 *   - toPersistence(refreshToken)    → Prisma create/update input
 *
 * ═════════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═════════════════════════════════════════════════════════════════════
 *
 * PrismaClient is injected via the constructor from the Composition Root
 * (e.g., main.ts or a DI container). The repository NEVER instantiates
 * its own PrismaClient — this keeps the class testable and follows the
 * Dependency Inversion Principle.
 *
 *   const prisma = new PrismaClient();
 *   const refreshTokenRepo = new PrismaRefreshTokenRepository(prisma);
 *
 * ═════════════════════════════════════════════════════════════════════
 * PRISMA ONLY EXISTS IN INFRASTRUCTURE
 * ═════════════════════════════════════════════════════════════════════
 *
 * - Prisma is imported ONLY in this file and other infrastructure files.
 * - Domain entities, Use Cases, and Controllers never import Prisma.
 * - If the ORM changes (e.g., to Drizzle or TypeORM), ONLY the
 *   infrastructure layer needs to be modified.
 *
 * ═════════════════════════════════════════════════════════════════════
 *
 * @category Infrastructure Repository
 */

import { PrismaClient, Prisma } from "../../../../generated/prisma";
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token-repository";
import { RefreshToken, RefreshTokenProps } from "../../domain/entities/refresh-token";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

/**
 * Prisma-based implementation of the IRefreshTokenRepository interface.
 *
 * @remarks
 * This repository translates between **domain entities** (RefreshToken)
 * and **Prisma models** (database rows). All public methods accept
 * and return domain types — Prisma types are never exposed.
 *
 * Error handling catches Prisma exceptions and rethrows them as
 * {@link InfrastructureException}, keeping Prisma-specific errors
 * contained within the infrastructure layer.
 */
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  /**
   * @param prisma - The PrismaClient instance injected from the Composition Root.
   */
  constructor(private readonly prisma: PrismaClient) {}

  // ── Public methods ──────────────────────────────────────────────

  /**
   * {@inheritDoc IRefreshTokenRepository.findById}
   *
   * @remarks
   * Logs the operation at debug level. Returns `null` when the refresh token
   * is not found (not throwing an exception).
   */
  async findById(id: string): Promise<RefreshToken | null> {
    try {
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { id },
      });

      if (!refreshToken) {
        logger.debug({ refreshTokenId: id }, "Refresh token not found by id");
        return null;
      }

      logger.debug({ refreshTokenId: id }, "Refresh token found by id");
      return this.toDomain(refreshToken);
    } catch (error) {
      logger.error({ error, refreshTokenId: id }, "Failed to find refresh token by id");
      throw new InfrastructureException("Failed to find refresh token by id", {
        refreshTokenId: id,
      });
    }
  }

  /**
   * {@inheritDoc IRefreshTokenRepository.findByTokenHash}
   *
   * @remarks
   * The tokenHash is used directly for the Prisma query. Logs the operation
   * at debug level — the token hash is safe to log as it is already hashed.
   * Returns `null` when no matching token hash is found.
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    try {
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!refreshToken) {
        logger.debug({ tokenHash: "[REDACTED]" }, "Refresh token not found by token hash");
        return null;
      }

      logger.debug({ tokenHash: "[REDACTED]" }, "Refresh token found by token hash");
      return this.toDomain(refreshToken);
    } catch (error) {
      logger.error(
        { error, tokenHash: "[REDACTED]" },
        "Failed to find refresh token by token hash",
      );
      throw new InfrastructureException("Failed to find refresh token by token hash", {
        tokenHash: "[REDACTED]",
      });
    }
  }

  /**
   * {@inheritDoc IRefreshTokenRepository.create}
   *
   * @remarks
   * The persisted RefreshToken entity is returned with the database-generated
   * `id` populated. Logs at info level without logging the tokenHash.
   */
  async create(token: RefreshToken): Promise<RefreshToken> {
    const createInput = this.toCreateInput(token);

    try {
      const created = await this.prisma.refreshToken.create({
        data: createInput,
      });

      logger.info(
        { refreshTokenId: created.id, userId: created.userId },
        "Refresh token created successfully",
      );

      return this.toDomain(created);
    } catch (error) {
      logger.error({ error, userId: token.userId }, "Failed to create refresh token");
      throw new InfrastructureException("Failed to create refresh token", {
        userId: token.userId,
      });
    }
  }

  /**
   * {@inheritDoc IRefreshTokenRepository.update}
   *
   * @remarks
   * Requires the refresh token to have an `id` (i.e., must have been persisted
   * previously). Logs at info level without logging the tokenHash.
   */
  async update(token: RefreshToken): Promise<RefreshToken> {
    const tokenId = token.id;

    if (!tokenId) {
      throw new InfrastructureException("Cannot update refresh token without an id");
    }

    const updateInput = this.toUpdateInput(token);

    try {
      const updated = await this.prisma.refreshToken.update({
        where: { id: tokenId },
        data: updateInput,
      });

      logger.info({ refreshTokenId: updated.id }, "Refresh token updated successfully");

      return this.toDomain(updated);
    } catch (error) {
      // If the record does not exist, Prisma throws a known error.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ refreshTokenId: tokenId }, "Attempted to update non-existent refresh token");
        throw new InfrastructureException("Refresh token not found for update", {
          refreshTokenId: tokenId,
        });
      }

      logger.error({ error, refreshTokenId: tokenId }, "Failed to update refresh token");
      throw new InfrastructureException("Failed to update refresh token", {
        refreshTokenId: tokenId,
      });
    }
  }

  /**
   * {@inheritDoc IRefreshTokenRepository.delete}
   *
   * @remarks
   * Idempotent: deleting a non-existent refresh token ID does not throw.
   * Logs at info level when a refresh token is deleted.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({
        where: { id },
      });

      logger.info({ refreshTokenId: id }, "Refresh token deleted successfully");
    } catch (error) {
      // P2025 = Record to delete does not exist — idempotent, so ignore.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.debug(
          { refreshTokenId: id },
          "Delete called on non-existent refresh token (idempotent)",
        );
        return;
      }

      logger.error({ error, refreshTokenId: id }, "Failed to delete refresh token");
      throw new InfrastructureException("Failed to delete refresh token", {
        refreshTokenId: id,
      });
    }
  }

  /**
   * {@inheritDoc IRefreshTokenRepository.deleteByUserId}
   *
   * @remarks
   * Removes ALL refresh tokens belonging to a user (e.g., during logout or
   * when all sessions must be terminated). Logs at info level.
   */
  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });

      logger.info({ userId }, "Refresh tokens deleted successfully for user");
    } catch (error) {
      logger.error({ error, userId }, "Failed to delete refresh tokens for user");
      throw new InfrastructureException("Failed to delete refresh tokens for user", {
        userId,
      });
    }
  }

  // ── Private mapping methods ──────────────────────────────────────

  /**
   * Map a Prisma RefreshToken model (database row) to a domain RefreshToken entity.
   *
   * This method is the **only** place where a Prisma model is converted to a
   * domain entity. All public methods that return a RefreshToken entity go
   * through this method, ensuring consistent mapping.
   *
   * @param model - The Prisma RefreshToken model (from the database).
   * @returns A fully constructed RefreshToken domain entity.
   */
  private toDomain(model: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
    createdAt: Date;
  }): RefreshToken {
    // Map Prisma revoked boolean to domain revokedAt Date | null
    // Since Prisma only stores a boolean revoked flag, we lose the exact timestamp
    // When revoked is true, we set revokedAt to the creation time as an approximation
    const revokedAt = model.revoked ? model.createdAt : null;

    const props: RefreshTokenProps = {
      id: model.id,
      userId: model.userId,
      tokenHash: model.tokenHash,
      expiresAt: model.expiresAt,
      revokedAt,
      createdAt: model.createdAt,
      // Prisma RefreshToken model doesn't have updatedAt, so we approximate with createdAt
      updatedAt: model.createdAt,
    };

    return new RefreshToken(props);
  }

  /**
   * Map a RefreshToken domain entity to a Prisma `RefreshTokenCreateInput`.
   *
   * Used by the `create` method to persist a new refresh token. The `id` is
   * omitted so Prisma generates it automatically (cuid).
   *
   * @param entity - The RefreshToken domain entity to persist.
   * @returns A Prisma RefreshTokenCreateInput object.
   */
  private toCreateInput(entity: RefreshToken): Prisma.RefreshTokenCreateInput {
    return {
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revoked: entity.revokedAt !== null,
      // createdAt is set by Prisma automatically (default: now())
      // Note: We don't map updatedAt or revokedAt directly as Prisma doesn't have equivalent fields
      // For the user relation, we use the connect syntax
      user: {
        connect: {
          id: entity.userId,
        },
      },
    };
  }

  /**
   * Map a RefreshToken domain entity to a Prisma `RefreshTokenUpdateInput`.
   *
   * Used by the `update` method. Only the fields that are present on the
   * entity are included in the update payload.
   *
   * @param entity - The RefreshToken domain entity with updated values.
   * @returns A Prisma RefreshTokenUpdateInput object.
   */
  private toUpdateInput(entity: RefreshToken): Prisma.RefreshTokenUpdateInput {
    return {
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revoked: entity.revokedAt !== null,
      // Note: We don't map updatedAt or revokedAt directly as Prisma doesn't have equivalent fields
      // For the user relation, we use the connect syntax (in case it needs to be updated)
      user: {
        connect: {
          id: entity.userId,
        },
      },
    };
  }
}
