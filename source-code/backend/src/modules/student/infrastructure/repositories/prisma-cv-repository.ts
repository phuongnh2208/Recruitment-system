/**
 * PrismaCVRepository — Concrete ICVRepository implementation using Prisma ORM.
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN (INFRASTRUCTURE LAYER)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This class implements the ICVRepository interface defined in the
 * Domain layer. It sits in the Infrastructure layer and translates
 * between domain objects (CVMetadata entity) and the Prisma ORM model.
 *
 * ═══════════════════════════════════════════════════════════════════
 * LAYER VIOLATION PREVENTION
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌──────────────────────────┐
 *   │   Domain Layer           │  ICVRepository (interface)
 *   │   (CVMetadata, …)        │
 *   └───────────┬──────────────┘
 *               │ implements
 *               ▼
 *   ┌──────────────────────────┐
 *   │ Infrastructure Layer     │  PrismaCVRepository
 *   │ (Prisma, DB, Exceptions) │
 *   └──────────────────────────┘
 *
 * Prisma-specific types NEVER leak to the Domain layer. Inputs are
 * domain entities; outputs are domain entities.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PERSISTENCE MAPPING
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌─────────────────┐     toDomain()       ┌──────────────────────┐
 *   │  Prisma Row     │ ──────────────────> │ CVMetadata Entity   │
 *   │  (CV table)     │                      │   (Domain)          │
 *   └─────────────────┘ <────────────────── └──────────────────────┘
 *                       toCreateInput()
 *                       toUpdateInput()
 *
 * Three private mapping methods encapsulate all conversion logic:
 *   - toDomain(prismaModel)        → CVMetadata entity
 *   - toCreateInput(cv)            → Prisma create input
 *   - toUpdateInput(cv)            → Prisma update input
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
 *   const repo = new PrismaCVRepository(prisma);
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
 * NO BUSINESS LOGIC
 * ═══════════════════════════════════════════════════════════════════
 *
 * This repository does NOT contain business rules, validation,
 * default-setting logic, duplicate checks, file upload/delete, or
 * permission checks. Those belong to the Application Layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NO FILE STORAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 * This repository handles ONLY database persistence. File storage
 * (disk, S3, etc.) is handled by a separate FileStorage service.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Infrastructure Repository
 */

import { PrismaClient, Prisma } from "../../../../generated/prisma";
import { ICVRepository } from "../../domain/repositories/cv-repository";
import { CVMetadata } from "../../domain/entities/cv-metadata";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

/** Shape of a Prisma CV model row (without relations). */
type CVPrismaModel = {
  id: string;
  studentId: string;
  fileName: string;
  originalFileName: string | null;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isDefault: boolean;
  uploadedAt: Date;
};

/**
 * Prisma-based implementation of the ICVRepository interface.
 *
 * @remarks
 * This repository translates between **domain entities** (CVMetadata)
 * and **Prisma models** (CV database rows). All public methods accept
 * and return domain types — Prisma types are never exposed.
 *
 * Error handling catches Prisma exceptions and rethrows them as
 * {@link InfrastructureException}, keeping Prisma-specific errors
 * contained within the infrastructure layer.
 */
export class PrismaCVRepository implements ICVRepository {
  /**
   * @param prisma - The PrismaClient instance injected from the Composition Root.
   */
  constructor(private readonly prisma: PrismaClient) {}

  // ── Query methods ────────────────────────────────────────────────

  /**
   * {@inheritDoc ICVRepository.findById}
   */
  async findById(id: string): Promise<CVMetadata | null> {
    try {
      const cv = await this.prisma.cV.findUnique({
        where: { id },
      });

      if (!cv) {
        logger.debug({ cvId: id }, "CV metadata not found by id");
        return null;
      }

      logger.debug({ cvId: id }, "CV metadata found by id");
      return this.toDomain(cv);
    } catch (error) {
      logger.error({ error, cvId: id }, "Failed to find CV metadata by id");
      throw new InfrastructureException("Failed to find CV metadata by id", {
        cvId: id,
      });
    }
  }

  /**
   * {@inheritDoc ICVRepository.findByStudentId}
   *
   * @remarks
   * Returns all CV metadata for the given student, ordered by
   * `uploadedAt` in descending order (newest first).
   */
  async findByStudentId(studentId: string): Promise<CVMetadata[]> {
    try {
      const cvs = await this.prisma.cV.findMany({
        where: { studentId },
        orderBy: { uploadedAt: "desc" },
      });

      logger.debug({ studentId, count: cvs.length }, "CV metadata list found by studentId");

      return cvs.map((cv) => this.toDomain(cv));
    } catch (error) {
      logger.error({ error, studentId }, "Failed to find CV metadata by studentId");
      throw new InfrastructureException("Failed to find CV metadata by studentId", {
        studentId,
      });
    }
  }

  /**
   * {@inheritDoc ICVRepository.findDefaultByStudentId}
   *
   * @remarks
   * Queries by `studentId` combined with `isDefault = true`.
   * Returns the default CV or `null` if none is set.
   */
  async findDefaultByStudentId(studentId: string): Promise<CVMetadata | null> {
    try {
      const cv = await this.prisma.cV.findFirst({
        where: { studentId, isDefault: true },
      });

      if (!cv) {
        logger.debug({ studentId }, "Default CV metadata not found");
        return null;
      }

      logger.debug({ studentId, cvId: cv.id }, "Default CV metadata found");
      return this.toDomain(cv);
    } catch (error) {
      logger.error({ error, studentId }, "Failed to find default CV metadata by studentId");
      throw new InfrastructureException("Failed to find default CV metadata by studentId", {
        studentId,
      });
    }
  }

  // ── Command methods ─────────────────────────────────────────────

  /**
   * {@inheritDoc ICVRepository.create}
   *
   * @remarks
   * The `id` field on the domain entity is expected to be `null` when
   * creating. The database generates the ID (cuid). The persisted
   * entity is returned with the generated `id` populated.
   */
  async create(cv: CVMetadata): Promise<CVMetadata> {
    const createInput = this.toCreateInput(cv);

    try {
      const created = await this.prisma.cV.create({
        data: createInput,
      });

      logger.info(
        { cvId: created.id, fileName: created.fileName },
        "CV metadata created successfully",
      );

      return this.toDomain(created);
    } catch (error) {
      logger.error({ error, studentId: cv.studentId }, "Failed to create CV metadata");
      throw new InfrastructureException("Failed to create CV metadata", {
        studentId: cv.studentId,
      });
    }
  }

  /**
   * {@inheritDoc ICVRepository.update}
   *
   * @remarks
   * Only mutable fields are updated: `fileName`, `filePath`, `fileSize`,
   * `mimeType`, `isDefault`. The `id`, `studentId`, and `uploadedAt`
   * fields are never modified by the update operation.
   */
  async update(cv: CVMetadata): Promise<CVMetadata> {
    const cvId = cv.id;

    if (!cvId) {
      throw new InfrastructureException("Cannot update CV metadata without an id");
    }

    const updateInput = this.toUpdateInput(cv);

    try {
      const updated = await this.prisma.cV.update({
        where: { id: cvId },
        data: updateInput,
      });

      logger.info({ cvId: updated.id }, "CV metadata updated successfully");

      return this.toDomain(updated);
    } catch (error) {
      // P2025 = Record to update does not exist.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ cvId }, "Attempted to update non-existent CV metadata");
        throw new InfrastructureException("CV metadata not found for update", {
          cvId,
        });
      }

      logger.error({ error, cvId }, "Failed to update CV metadata");
      throw new InfrastructureException("Failed to update CV metadata", {
        cvId,
      });
    }
  }

  /**
   * {@inheritDoc ICVRepository.delete}
   *
   * @remarks
   * Idempotent: deleting a non-existent CV ID does not throw.
   * If Prisma throws P2025 (record not found), the error is swallowed.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.cV.delete({
        where: { id },
      });

      logger.info({ cvId: id }, "CV metadata deleted successfully");
    } catch (error) {
      // P2025 = Record to delete does not exist — idempotent, so ignore.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ cvId: id }, "Delete called on non-existent CV metadata (idempotent)");
        return;
      }

      logger.error({ error, cvId: id }, "Failed to delete CV metadata");
      throw new InfrastructureException("Failed to delete CV metadata", {
        cvId: id,
      });
    }
  }

  // ── Existence checks ─────────────────────────────────────────────

  /**
   * {@inheritDoc ICVRepository.exists}
   *
   * @remarks
   * Uses Prisma's `findUnique` with a select-only query for maximum
   * efficiency — only fetches the `id` column rather than the full row.
   */
  async exists(id: string): Promise<boolean> {
    try {
      const cv = await this.prisma.cV.findUnique({
        where: { id },
        select: { id: true },
      });

      logger.debug({ cvId: id, exists: !!cv }, "Checked CV metadata existence by id");

      return cv !== null;
    } catch (error) {
      logger.error({ error, cvId: id }, "Failed to check CV metadata existence");
      throw new InfrastructureException("Failed to check CV metadata existence", {
        cvId: id,
      });
    }
  }

  /**
   * {@inheritDoc ICVRepository.existsByStoragePath}
   *
   * @remarks
   * Uses Prisma's `findFirst` with a select-only query for maximum
   * efficiency — only fetches the `id` column. Checks against the
   * `filePath` column in the database.
   */
  async existsByStoragePath(path: string): Promise<boolean> {
    try {
      const cv = await this.prisma.cV.findFirst({
        where: { filePath: path },
        select: { id: true },
      });

      logger.debug({ exists: !!cv }, "Checked CV metadata existence by storage path");

      return cv !== null;
    } catch (error) {
      logger.error({ error }, "Failed to check CV metadata existence by storage path");
      throw new InfrastructureException("Failed to check CV metadata existence by storage path");
    }
  }

  // ── Private mapping methods ──────────────────────────────────────

  /**
   * Map a Prisma CV model (database row) to a domain CVMetadata entity.
   *
   * This method is the **only** place where a Prisma model is
   * converted to a domain entity. All public methods that return
   * a CVMetadata entity go through this method, ensuring consistent mapping.
   *
   * Mapping notes:
   * - `filePath` (Prisma) → `storagePath` (Domain)
   * - `fileName` (Prisma) → `fileName` (Domain)
   * - `originalFileName` (Prisma) → `originalFileName` (Domain)
   * - No `updatedAt` in database → uses `uploadedAt` as fallback
   *
   * @param model - The Prisma CV model (from the database).
   * @returns A fully constructed CVMetadata domain entity.
   */
  private toDomain(model: CVPrismaModel): CVMetadata {
    return new CVMetadata({
      id: model.id,
      studentId: model.studentId,
      fileName: model.fileName,
      originalFileName: model.originalFileName ?? model.fileName,
      mimeType: model.mimeType,
      fileSize: model.fileSize,
      storagePath: model.filePath,
      isDefault: model.isDefault,
      uploadedAt: model.uploadedAt,
      updatedAt: model.uploadedAt,
    });
  }

  /**
   * Map a CVMetadata domain entity to a Prisma `CVCreateInput`.
   *
   * The `id` is omitted so Prisma generates it automatically (cuid).
   *
   * @param entity - The CVMetadata domain entity to persist.
   * @returns A Prisma CVCreateInput object.
   */
  private toCreateInput(entity: CVMetadata): Prisma.CVCreateInput {
    return {
      fileName: entity.fileName,
      originalFileName: entity.originalFileName,
      filePath: entity.storagePath,
      fileSize: entity.fileSize,
      mimeType: entity.mimeType,
      isDefault: entity.isDefault,
      student: {
        connect: { id: entity.studentId },
      },
    };
  }

  /**
   * Map a CVMetadata domain entity to a Prisma `CVUpdateInput`.
   *
   * Only mutable fields are included:
   * - `fileName` / `filePath` / `fileSize` / `mimeType` / `isDefault`
   *
   * Immutable fields (`id`, `studentId`, `uploadedAt`) are excluded.
   *
   * @param entity - The CVMetadata domain entity with updated values.
   * @returns A Prisma CVUpdateInput object.
   */
  private toUpdateInput(entity: CVMetadata): Prisma.CVUpdateInput {
    return {
      fileName: entity.fileName,
      originalFileName: entity.originalFileName,
      filePath: entity.storagePath,
      fileSize: entity.fileSize,
      mimeType: entity.mimeType,
      isDefault: entity.isDefault,
    };
  }
}
