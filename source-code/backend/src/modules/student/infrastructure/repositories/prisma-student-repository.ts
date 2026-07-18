/**
 * PrismaStudentProfileRepository — Concrete IStudentProfileRepository implementation using Prisma ORM.
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN (INFRASTRUCTURE LAYER)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This class implements the IStudentProfileRepository interface defined in the
 * Domain layer. It sits in the Infrastructure layer and translates
 * between domain objects (StudentProfile entity) and the Prisma ORM model.
 *
 * ═══════════════════════════════════════════════════════════════════
 * LAYER VIOLATION PREVENTION
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌──────────────────────────┐
 *   │   Domain Layer           │  IStudentProfileRepository (interface)
 *   │   (StudentProfile, …)    │
 *   └───────────┬──────────────┘
 *               │ implements
 *               ▼
 *   ┌──────────────────────────┐
 *   │ Infrastructure Layer     │  PrismaStudentProfileRepository
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
 *   ┌──────────────────┐     toDomain()      ┌──────────────────────┐
 *   │  Prisma Row      │ ──────────────────> │ StudentProfile Entity│
 *   │  (Database)      │                     │   (Domain)           │
 *   └──────────────────┘ <────────────────── └──────────────────────┘
 *                       toCreateInput()
 *                       toUpdateInput()
 *
 * Three private mapping methods encapsulate all conversion logic:
 *   - toDomain(prismaModel)     → StudentProfile entity
 *   - toCreateInput(profile)    → Prisma create input
 *   - toUpdateInput(profile)    → Prisma update input
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
 *   const repo = new PrismaStudentProfileRepository(prisma);
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

import { PrismaClient, Prisma } from "../../../../generated/prisma";
import { IStudentProfileRepository } from "../../domain/repositories/student-profile-repository";
import { StudentProfile, StudentProfileProps } from "../../domain/entities/student-profile";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

/**
 * Prisma-based implementation of the IStudentProfileRepository interface.
 *
 * @remarks
 * This repository translates between **domain entities** (StudentProfile)
 * and **Prisma models** (database rows). All public methods accept
 * and return domain types — Prisma types are never exposed.
 *
 * Error handling catches Prisma exceptions and rethrows them as
 * {@link InfrastructureException}, keeping Prisma-specific errors
 * contained within the infrastructure layer.
 */
export class PrismaStudentProfileRepository implements IStudentProfileRepository {
  /**
   * @param prisma - The PrismaClient instance injected from the Composition Root.
   */
  constructor(private readonly prisma: PrismaClient) {}

  // ── Public methods ───────────────────────────────────────────────

  /**
   * {@inheritDoc IStudentProfileRepository.findById}
   *
   * @remarks
   * Logs the operation at debug level. Returns `null` when the profile
   * is not found (not throwing an exception).
   */
  async findById(id: string): Promise<StudentProfile | null> {
    try {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { id },
      });

      if (!profile) {
        logger.debug({ studentProfileId: id }, "Student profile not found by id");
        return null;
      }

      logger.debug({ studentProfileId: id }, "Student profile found by id");
      return this.toDomain(profile);
    } catch (error) {
      logger.error({ error, studentProfileId: id }, "Failed to find student profile by id");
      throw new InfrastructureException("Failed to find student profile by id", {
        studentProfileId: id,
      });
    }
  }

  /**
   * {@inheritDoc IStudentProfileRepository.findByUserId}
   *
   * @remarks
   * Logs the operation at debug level. Returns `null` when the profile
   * is not found (not throwing an exception).
   */
  async findByUserId(userId: string): Promise<StudentProfile | null> {
    try {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        logger.debug({ userId }, "Student profile not found by userId");
        return null;
      }

      logger.debug({ userId }, "Student profile found by userId");
      return this.toDomain(profile);
    } catch (error) {
      logger.error({ error, userId }, "Failed to find student profile by userId");
      throw new InfrastructureException("Failed to find student profile by userId", {
        userId,
      });
    }
  }

  /**
   * {@inheritDoc IStudentProfileRepository.create}
   *
   * @remarks
   * The persisted StudentProfile entity is returned with the database-generated
   * `id` populated. Logs at info level.
   */
  async create(profile: StudentProfile): Promise<StudentProfile> {
    const createInput = this.toCreateInput(profile);

    try {
      const created = await this.prisma.studentProfile.create({
        data: createInput,
      });

      logger.info(
        { studentProfileId: created.id, userId: created.userId },
        "Student profile created successfully",
      );

      return this.toDomain(created);
    } catch (error) {
      logger.error({ error, userId: profile.userId }, "Failed to create student profile");
      throw new InfrastructureException("Failed to create student profile", {
        userId: profile.userId,
      });
    }
  }

  /**
   * {@inheritDoc IStudentProfileRepository.update}
   *
   * @remarks
   * Requires the profile to have an `id` (i.e., must have been persisted
   * previously). Logs at info level.
   */
  async update(profile: StudentProfile): Promise<StudentProfile> {
    const profileId = profile.id;

    if (!profileId) {
      throw new InfrastructureException("Cannot update student profile without an id");
    }

    const updateInput = this.toUpdateInput(profile);

    try {
      const updated = await this.prisma.studentProfile.update({
        where: { id: profileId },
        data: updateInput,
      });

      logger.info({ studentProfileId: updated.id }, "Student profile updated successfully");

      return this.toDomain(updated);
    } catch (error) {
      // If the record does not exist, Prisma throws a known error.
      // We wrap it in InfrastructureException to stay consistent.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn(
          { studentProfileId: profileId },
          "Attempted to update non-existent student profile",
        );
        throw new InfrastructureException("Student profile not found for update", {
          studentProfileId: profileId,
        });
      }

      logger.error({ error, studentProfileId: profileId }, "Failed to update student profile");
      throw new InfrastructureException("Failed to update student profile", {
        studentProfileId: profileId,
      });
    }
  }

  /**
   * {@inheritDoc IStudentProfileRepository.delete}
   *
   * @remarks
   * Idempotent: deleting a non-existent profile ID does not throw.
   * Logs at info level when a profile is deleted.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.studentProfile.delete({
        where: { id },
      });

      logger.info({ studentProfileId: id }, "Student profile deleted successfully");
    } catch (error) {
      // P2025 = Record to delete does not exist — idempotent, so ignore.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.debug(
          { studentProfileId: id },
          "Delete called on non-existent student profile (idempotent)",
        );
        return;
      }

      logger.error({ error, studentProfileId: id }, "Failed to delete student profile");
      throw new InfrastructureException("Failed to delete student profile", {
        studentProfileId: id,
      });
    }
  }

  /**
   * {@inheritDoc IStudentProfileRepository.existsByUserId}
   *
   * @remarks
   * Uses Prisma's `findUnique` with a select-only query for maximum
   * efficiency — only fetches the `id` column rather than the full row.
   * Logs at debug level.
   */
  async existsByUserId(userId: string): Promise<boolean> {
    try {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      logger.debug({ userId, exists: !!profile }, "Checked student profile existence by userId");

      return profile !== null;
    } catch (error) {
      logger.error({ error, userId }, "Failed to check student profile existence");
      throw new InfrastructureException("Failed to check student profile existence", {
        userId,
      });
    }
  }

  // ── Private mapping methods ──────────────────────────────────────

  /**
   * Map a Prisma StudentProfile model (database row) to a domain StudentProfile entity.
   *
   * This method is the **only** place where a Prisma model is
   * converted to a domain entity. All public methods that return
   * a StudentProfile entity go through this method, ensuring consistent mapping.
   *
   * @param model - The Prisma StudentProfile model (from the database).
   * @returns A fully constructed StudentProfile domain entity.
   */
  private toDomain(model: {
    id: string;
    userId: string;
    fullName: string;
    phone: string | null;
    address: string | null;
    university: string | null;
    major: string | null;
    graduationYear: number | null;
    defaultCvId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): StudentProfile {
    const props: StudentProfileProps = {
      id: model.id,
      userId: model.userId,
      fullName: model.fullName,
      phone: model.phone,
      address: model.address,
      university: model.university,
      major: model.major,
      avatarUrl: null,
      defaultCvId: model.defaultCvId,
      role: "STUDENT",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return new StudentProfile(props);
  }

  /**
   * Map a StudentProfile domain entity to a Prisma `StudentProfileCreateInput`.
   *
   * Used by the `create` method to persist a new profile. The `id` is
   * omitted so Prisma generates it automatically (cuid).
   *
   * @param entity - The StudentProfile domain entity to persist.
   * @returns A Prisma StudentProfileCreateInput object.
   */
  private toCreateInput(entity: StudentProfile): Prisma.StudentProfileCreateInput {
    return {
      fullName: entity.fullName,
      phone: entity.phone,
      address: entity.address,
      university: entity.university,
      major: entity.major,
      defaultCvId: entity.defaultCvId,
      user: {
        connect: { id: entity.userId },
      },
    };
  }

  /**
   * Map a StudentProfile domain entity to a Prisma `StudentProfileUpdateInput`.
   *
   * Used by the `update` method. Only the fields that are present
   * on the entity are included in the update payload.
   *
   * @param entity - The StudentProfile domain entity with updated values.
   * @returns A Prisma StudentProfileUpdateInput object.
   */
  private toUpdateInput(entity: StudentProfile): Prisma.StudentProfileUpdateInput {
    return {
      fullName: entity.fullName,
      phone: entity.phone,
      address: entity.address,
      university: entity.university,
      major: entity.major,
      defaultCvId: entity.defaultCvId,
    };
  }
}
