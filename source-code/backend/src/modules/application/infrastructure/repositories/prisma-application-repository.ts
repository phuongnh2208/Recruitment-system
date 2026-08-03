import {
  PrismaClient,
  Prisma,
  ApplicationState as PrismaApplicationState,
} from "../../../../generated/prisma";
import { IApplicationRepository } from "../../domain/repositories/application-repository";
import { Application, ApplicationProps } from "../../domain/entities/application";
import {
  ApplicationState,
  ApplicationStateValue,
} from "../../domain/value-objects/application-state";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

/**
 * Maps Prisma ApplicationState to Domain ApplicationState value.
 *
 * Both use the same set of values, so this is a direct 1:1 mapping:
 *   APPLIED     → APPLIED
 *   UNDER_REVIEW → UNDER_REVIEW
 *   ACCEPTED    → ACCEPTED
 *   REJECTED    → REJECTED
 *   WITHDRAWN   → WITHDRAWN
 */
const PRISMA_TO_DOMAIN_STATE: Record<PrismaApplicationState, ApplicationStateValue> = {
  [PrismaApplicationState.APPLIED]: "APPLIED",
  [PrismaApplicationState.UNDER_REVIEW]: "UNDER_REVIEW",
  [PrismaApplicationState.ACCEPTED]: "ACCEPTED",
  [PrismaApplicationState.REJECTED]: "REJECTED",
  [PrismaApplicationState.WITHDRAWN]: "WITHDRAWN",
};

/**
 * Maps Domain ApplicationState value to Prisma ApplicationState.
 *
 * Direct 1:1 mapping.
 */
const DOMAIN_TO_PRISMA_STATE: Record<ApplicationStateValue, PrismaApplicationState> = {
  APPLIED: PrismaApplicationState.APPLIED,
  UNDER_REVIEW: PrismaApplicationState.UNDER_REVIEW,
  ACCEPTED: PrismaApplicationState.ACCEPTED,
  REJECTED: PrismaApplicationState.REJECTED,
  WITHDRAWN: PrismaApplicationState.WITHDRAWN,
};

/**
 * PrismaApplicationRepository — IApplicationRepository implementation using Prisma ORM.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITY
 * ═══════════════════════════════════════════════════════════════════
 *
 * This repository is solely responsible for translating between the
 * Domain's Application entity and Prisma's database model. It performs:
 *
 * 1. Data access (CRUD + query methods)
 * 2. Mapping between Domain ↔ Prisma models
 * 3. Error translation (Prisma errors → InfrastructureException)
 *
 * It does NOT contain business rules, state transition validation, or
 * any domain logic. Those belong in the Domain Layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════
 *   IApplicationRepository ←── Domain Interface
 *         ▲  implements
 *         │
 *   PrismaApplicationRepository [Infrastructure Layer]
 *
 * @class PrismaApplicationRepository
 * @implements {IApplicationRepository}
 */
export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── READ METHODS ─────────────────────────────────────────────────

  async findById(id: string): Promise<Application | null> {
    try {
      const record = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!record) {
        logger.debug({ applicationId: id }, "Application not found by id");
        return null;
      }

      logger.debug({ applicationId: id }, "Application found by id");
      return this.toDomain(record);
    } catch (error) {
      logger.error({ error, applicationId: id }, "Failed to find application by id");
      throw new InfrastructureException("Failed to find application by id", {
        applicationId: id,
      });
    }
  }

  async findByJobAndStudent(jobId: string, studentId: string): Promise<Application | null> {
    try {
      // The Application table has a unique compound constraint @@unique([jobId, studentId]).
      // findFirst with both fields is an efficient direct lookup.
      const record = await this.prisma.application.findFirst({
        where: { jobId, studentId },
      });

      if (!record) {
        logger.debug({ jobId, studentId }, "No application found for job and student");
        return null;
      }

      logger.debug(
        { jobId, studentId, applicationId: record.id },
        "Application found for job/student",
      );
      return this.toDomain(record);
    } catch (error) {
      logger.error({ error, jobId, studentId }, "Failed to find application by job and student");
      throw new InfrastructureException("Failed to find application by job and student", {
        jobId,
        studentId,
      });
    }
  }

  async findByStudentId(studentId: string): Promise<Application[]> {
    try {
      const records = await this.prisma.application.findMany({
        where: { studentId },
        orderBy: { appliedAt: "desc" },
      });

      logger.debug({ studentId, count: records.length }, "Applications found by student id");

      return records.map((record) => this.toDomain(record));
    } catch (error) {
      logger.error({ error, studentId }, "Failed to find applications by student id");
      throw new InfrastructureException("Failed to find applications by student id", {
        studentId,
      });
    }
  }

  async findByEmployerId(employerId: string): Promise<Application[]> {
    try {
      const records = await this.prisma.application.findMany({
        where: {
          job: {
            employerId,
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      logger.debug({ employerId, count: records.length }, "Applications found by employer id");

      return records.map((record) => this.toDomain(record));
    } catch (error) {
      logger.error({ error, employerId }, "Failed to find applications by employer id");
      throw new InfrastructureException("Failed to find applications by employer id", {
        employerId,
      });
    }
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    try {
      const records = await this.prisma.application.findMany({
        where: { jobId },
        orderBy: { appliedAt: "desc" },
      });

      logger.debug({ jobId, count: records.length }, "Applications found by job id");

      return records.map((record) => this.toDomain(record));
    } catch (error) {
      logger.error({ error, jobId }, "Failed to find applications by job id");
      throw new InfrastructureException("Failed to find applications by job id", {
        jobId,
      });
    }
  }

  // ── WRITE METHODS ────────────────────────────────────────────────

  async create(application: Application): Promise<void> {
    const createInput = this.toCreateInput(application);

    try {
      await this.prisma.application.create({
        data: createInput,
      });

      logger.info(
        {
          applicationId: application.id,
          studentId: application.studentId,
          jobId: application.jobPostingId,
        },
        "Application created successfully",
      );
    } catch (error) {
      logger.error(
        { error, studentId: application.studentId, jobId: application.jobPostingId },
        "Failed to create application",
      );
      throw new InfrastructureException("Failed to create application", {
        studentId: application.studentId,
        jobId: application.jobPostingId,
      });
    }
  }

  async update(application: Application): Promise<void> {
    const applicationId = application.id;

    if (!applicationId) {
      throw new InfrastructureException("Cannot update application without an id");
    }

    const updateInput = this.toUpdateInput(application);

    try {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: updateInput,
      });

      logger.info(
        {
          applicationId,
          studentId: application.studentId,
          state: application.state.value,
        },
        "Application updated successfully",
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ applicationId }, "Attempted to update non-existent application");
        throw new InfrastructureException("Application not found for update", {
          applicationId,
        });
      }

      logger.error({ error, applicationId }, "Failed to update application");
      throw new InfrastructureException("Failed to update application", {
        applicationId,
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.application.delete({
        where: { id },
      });

      logger.info({ applicationId: id }, "Application deleted successfully");
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.debug(
          { applicationId: id },
          "Delete called on non-existent application (idempotent)",
        );
        return;
      }

      logger.error({ error, applicationId: id }, "Failed to delete application");
      throw new InfrastructureException("Failed to delete application", {
        applicationId: id,
      });
    }
  }

  // ── EXISTENCE CHECK ──────────────────────────────────────────────

  async exists(id: string): Promise<boolean> {
    try {
      const record = await this.prisma.application.findUnique({
        where: { id },
        select: { id: true },
      });

      logger.debug({ applicationId: id, exists: !!record }, "Checked application existence");

      return record !== null;
    } catch (error) {
      logger.error({ error, applicationId: id }, "Failed to check application existence");
      throw new InfrastructureException("Failed to check application existence", {
        applicationId: id,
      });
    }
  }

  // ── PAGINATED METHODS ──────────────────────────────────────────────

  async findByStudentIdPaginated(
    studentId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Application[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [records, total] = await Promise.all([
        this.prisma.application.findMany({
          where: { studentId },
          orderBy: { appliedAt: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.application.count({ where: { studentId } }),
      ]);

      logger.debug(
        { studentId, page, limit, count: records.length, total },
        "Applications found by student id (paginated)",
      );

      return {
        items: records.map((record) => this.toDomain(record)),
        total,
      };
    } catch (error) {
      logger.error(
        { error, studentId, page, limit },
        "Failed to find applications by student id (paginated)",
      );
      throw new InfrastructureException("Failed to find applications by student id (paginated)", {
        studentId,
        page,
        limit,
      });
    }
  }

  async findByEmployerIdPaginated(
    employerId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Application[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [records, total] = await Promise.all([
        this.prisma.application.findMany({
          where: {
            job: {
              employerId,
            },
          },
          orderBy: { appliedAt: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.application.count({
          where: {
            job: {
              employerId,
            },
          },
        }),
      ]);

      logger.debug(
        { employerId, page, limit, count: records.length, total },
        "Applications found by employer id (paginated)",
      );

      return {
        items: records.map((record) => this.toDomain(record)),
        total,
      };
    } catch (error) {
      logger.error(
        { error, employerId, page, limit },
        "Failed to find applications by employer id (paginated)",
      );
      throw new InfrastructureException("Failed to find applications by employer id (paginated)", {
        employerId,
        page,
        limit,
      });
    }
  }

  // ── MAPPING — Domain ↔ Prisma ────────────────────────────────────

  /**
   * Converts a Prisma Application model to a Domain Application entity.
   *
   * State mapping: direct 1:1 (both use the same enum values).
   * Prisma `jobId` → Domain `jobPostingId`.
   * Prisma does not have a separate `createdAt` field for Application;
   * `appliedAt` is used as the creation timestamp.
   *
   * @param model - The Prisma Application record.
   * @returns The domain Application entity.
   */
  private toDomain(model: {
    id: string;
    jobId: string;
    studentId: string;
    cvId: string;
    coverLetter: string | null;
    state: PrismaApplicationState;
    appliedAt: Date;
    reviewedAt: Date | null;
    reviewedBy: string | null;
    rejectionReason: string | null;
    updatedAt: Date;
  }): Application {
    const domainStateValue = PRISMA_TO_DOMAIN_STATE[model.state];
    const domainState = new ApplicationState(domainStateValue);

    const props: ApplicationProps = {
      id: model.id,
      studentId: model.studentId,
      jobPostingId: model.jobId,
      cvId: model.cvId,
      state: domainState,
      rejectionReason: model.rejectionReason,
      appliedAt: model.appliedAt,
      reviewedAt: model.reviewedAt,
      reviewedBy: model.reviewedBy,
      createdAt: model.appliedAt,
      updatedAt: model.updatedAt,
    };

    return new Application(props);
  }

  /**
   * Converts a domain Application entity to a Prisma create input.
   *
   * Relations are connected via `connect` using the entity's IDs.
   * Domain `jobPostingId` → Prisma `job.connect.id`.
   *
   * @param entity - The domain Application entity.
   * @returns The Prisma create input.
   */
  private toCreateInput(entity: Application): Prisma.ApplicationCreateInput {
    return {
      job: {
        connect: { id: entity.jobPostingId },
      },
      student: {
        connect: { id: entity.studentId },
      },
      cv: {
        connect: { id: entity.cvId },
      },
      state: DOMAIN_TO_PRISMA_STATE[entity.state.value],
      appliedAt: entity.appliedAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Converts a domain Application entity to a Prisma update input.
   *
   * Only mutable fields are included in the update:
   * state, rejectionReason, reviewedAt, reviewedBy, updatedAt.
   *
   * @param entity - The domain Application entity with updated values.
   * @returns The Prisma update input.
   */
  private toUpdateInput(entity: Application): Prisma.ApplicationUpdateInput {
    return {
      state: DOMAIN_TO_PRISMA_STATE[entity.state.value],
      rejectionReason: entity.rejectionReason,
      reviewedAt: entity.reviewedAt,
      reviewedBy: entity.reviewedBy,
      updatedAt: entity.updatedAt,
    };
  }
}
