import { PrismaClient, Prisma, JobState as PrismaJobState } from "../../../../generated/prisma";
import {
  IJobPostingRepository,
  JobSearchCriteria,
  PaginatedJobResult,
} from "../../domain/repositories/job-posting-repository";
import { JobPosting, JobPostingProps } from "../../domain/entities/job-posting";
import { JobStateValue } from "../../domain/value-objects/job-state";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

/**
 * Maps the input state from the Prisma database state to the Domain state.
 *
 * Prisma JobState ↔ Domain JobStateValue:
 *   DRAFT     → DRAFT
 *   PENDING   → SUBMITTED
 *   APPROVED  → APPROVED
 *   REJECTED  → REJECTED
 *   CLOSED    → CLOSED
 *   EXPIRED   → CLOSED  (Domain has no EXPIRED state)
 */
const PRISMA_TO_DOMAIN_STATE: Record<PrismaJobState, JobStateValue> = {
  [PrismaJobState.DRAFT]: "DRAFT",
  [PrismaJobState.PENDING]: "SUBMITTED",
  [PrismaJobState.APPROVED]: "APPROVED",
  [PrismaJobState.REJECTED]: "REJECTED",
  [PrismaJobState.CLOSED]: "CLOSED",
  [PrismaJobState.EXPIRED]: "CLOSED",
};

/**
 * Maps the domain state to the Prisma state.
 *
 * Domain JobStateValue → Prisma JobState:
 *   DRAFT     → DRAFT
 *   SUBMITTED → PENDING
 *   APPROVED  → APPROVED
 *   REJECTED  → REJECTED
 *   CLOSED    → CLOSED
 */
const DOMAIN_TO_PRISMA_STATE: Record<JobStateValue, PrismaJobState> = {
  DRAFT: PrismaJobState.DRAFT,
  SUBMITTED: PrismaJobState.PENDING,
  APPROVED: PrismaJobState.APPROVED,
  REJECTED: PrismaJobState.REJECTED,
  CLOSED: PrismaJobState.CLOSED,
};

/**
 * Default salary range JSON when salaryMin/salaryMax are both null.
 */
const SALARY_RANGE_NULL = '{"min":null,"max":null,"currency":null}';

/**
 * PrismaJobPostingRepository — IJobPostingRepository implementation using Prisma ORM.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITY
 * ═══════════════════════════════════════════════════════════════════
 *
 * This repository is solely responsible for translating between the
 * Domain's JobPosting entity and Prisma's database model. It performs:
 *
 * 1. Data access (CRUD + search queries)
 * 2. Mapping between Domain ↔ Prisma models
 * 3. Error translation (Prisma errors → InfrastructureException)
 *
 * It does NOT contain business rules, state transition validation, or
 * any domain logic. Those belong in the Domain Layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════
 *   IJobPostingRepository ←── Domain Interface
 *         ▲  implements
 *         │
 *   PrismaJobPostingRepository [Infrastructure Layer]
 *
 * @class PrismaJobPostingRepository
 * @implements {IJobPostingRepository}
 */
export class PrismaJobPostingRepository implements IJobPostingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── READ METHODS ─────────────────────────────────────────────────

  async findById(id: string): Promise<JobPosting | null> {
    try {
      const record = await this.prisma.jobPosting.findUnique({
        where: { id },
      });

      if (!record) {
        logger.debug({ jobPostingId: id }, "Job posting not found by id");
        return null;
      }

      logger.debug({ jobPostingId: id }, "Job posting found by id");
      return this.toDomain(record);
    } catch (error) {
      logger.error({ error, jobPostingId: id }, "Failed to find job posting by id");
      throw new InfrastructureException("Failed to find job posting by id", {
        jobPostingId: id,
      });
    }
  }

  async findByEmployerId(employerId: string): Promise<JobPosting[]> {
    try {
      const records = await this.prisma.jobPosting.findMany({
        where: { employerId },
        orderBy: { createdAt: "desc" },
      });

      logger.debug({ employerId, count: records.length }, "Job postings found by employer id");

      return records.map((record) => this.toDomain(record));
    } catch (error) {
      logger.error({ error, employerId }, "Failed to find job postings by employer id");
      throw new InfrastructureException("Failed to find job postings by employer id", {
        employerId,
      });
    }
  }

  async findApproved(page: number, limit: number): Promise<PaginatedJobResult> {
    try {
      const where = { state: PrismaJobState.APPROVED };
      const skip = (page - 1) * limit;

      const [records, total] = await this.prisma.$transaction([
        this.prisma.jobPosting.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.jobPosting.count({ where }),
      ]);

      logger.debug(
        { page, limit, total, returnedCount: records.length },
        "Approved job postings queried",
      );

      return {
        items: records.map((record) => this.toDomain(record)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error) {
      logger.error({ error, page, limit }, "Failed to find approved job postings");
      throw new InfrastructureException("Failed to find approved job postings", {
        page,
        limit,
      });
    }
  }

  // ── SEARCH ────────────────────────────────────────────────────────

  async search(
    criteria: JobSearchCriteria,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedJobResult> {
    const { keyword, location, employerId, state, salaryMin, salaryMax } = criteria;
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.JobPostingWhereInput = {};

      // Free-text search across title, description, and requirements.
      // MySQL's default collation is case-insensitive, so mode is not needed.
      if (keyword && keyword.trim() !== "") {
        where.OR = [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
          { requirements: { contains: keyword } },
        ];
      }

      // Location filter.
      if (location && location.trim() !== "") {
        where.location = { contains: location };
      }

      if (employerId) {
        where.employerId = employerId;
      }

      // State filter — map domain state to Prisma state.
      if (state) {
        where.state = DOMAIN_TO_PRISMA_STATE[state];
      }

      // Build query options with pagination.
      const queryOptions: Prisma.JobPostingFindManyArgs = {
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      };

      // Execute count and findMany in parallel for efficiency.
      const [records, total] = await this.prisma.$transaction([
        this.prisma.jobPosting.findMany(queryOptions),
        this.prisma.jobPosting.count({ where }),
      ]);

      // In-memory salary filtering (best-effort for string-encoded JSON).
      let filteredRecords = records;
      if (
        (salaryMin !== undefined && salaryMin !== null) ||
        (salaryMax !== undefined && salaryMax !== null)
      ) {
        filteredRecords = records.filter((record) => {
          const salary = this.parseSalaryRange(record.salaryRange);
          if (
            salaryMin !== undefined &&
            salaryMin !== null &&
            salary.min !== null &&
            salary.min < salaryMin
          ) {
            return false;
          }
          if (
            salaryMax !== undefined &&
            salaryMax !== null &&
            salary.max !== null &&
            salary.max > salaryMax
          ) {
            return false;
          }
          return true;
        });
      }

      logger.debug(
        {
          keyword,
          location,
          state,
          salaryMin,
          salaryMax,
          page,
          limit,
          total,
          returnedCount: filteredRecords.length,
        },
        "Job postings search completed",
      );

      return {
        items: filteredRecords.map((record) => this.toDomain(record)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error) {
      logger.error(
        { error, keyword, location, state, salaryMin, salaryMax },
        "Failed to search job postings",
      );
      throw new InfrastructureException("Failed to search job postings", {
        keyword,
        location,
        state,
      });
    }
  }

  // ── WRITE METHODS ────────────────────────────────────────────────

  async create(job: JobPosting): Promise<void> {
    const createInput = this.toCreateInput(job);

    try {
      await this.prisma.jobPosting.create({
        data: createInput,
      });

      logger.info(
        { jobPostingId: job.id, employerId: job.employerId, title: job.title },
        "Job posting created successfully",
      );
    } catch (error) {
      logger.error(
        { error, employerId: job.employerId, title: job.title },
        "Failed to create job posting",
      );
      throw new InfrastructureException("Failed to create job posting", {
        employerId: job.employerId,
      });
    }
  }

  async update(job: JobPosting): Promise<void> {
    const jobId = job.id;

    if (!jobId) {
      throw new InfrastructureException("Cannot update job posting without an id");
    }

    const updateInput = this.toUpdateInput(job);

    try {
      await this.prisma.jobPosting.update({
        where: { id: jobId },
        data: updateInput,
      });

      logger.info(
        { jobPostingId: jobId, employerId: job.employerId, title: job.title },
        "Job posting updated successfully",
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ jobPostingId: jobId }, "Attempted to update non-existent job posting");
        throw new InfrastructureException("Job posting not found for update", {
          jobPostingId: jobId,
        });
      }

      logger.error({ error, jobPostingId: jobId }, "Failed to update job posting");
      throw new InfrastructureException("Failed to update job posting", {
        jobPostingId: jobId,
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.jobPosting.delete({
        where: { id },
      });

      logger.info({ jobPostingId: id }, "Job posting deleted successfully");
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ jobPostingId: id }, "Delete called on non-existent job posting (idempotent)");
        return;
      }

      logger.error({ error, jobPostingId: id }, "Failed to delete job posting");
      throw new InfrastructureException("Failed to delete job posting", {
        jobPostingId: id,
      });
    }
  }

  // ── EXISTENCE CHECK ──────────────────────────────────────────────

  async exists(id: string): Promise<boolean> {
    try {
      const record = await this.prisma.jobPosting.findUnique({
        where: { id },
        select: { id: true },
      });

      logger.debug({ jobPostingId: id, exists: !!record }, "Checked job posting existence");

      return record !== null;
    } catch (error) {
      logger.error({ error, jobPostingId: id }, "Failed to check job posting existence");
      throw new InfrastructureException("Failed to check job posting existence", {
        jobPostingId: id,
      });
    }
  }

  // ── MAPPING — Domain ↔ Prisma ────────────────────────────────────

  /**
   * Converts a Prisma JobPosting model to a Domain JobPosting entity.
   *
   * State mapping: PENDING → SUBMITTED, EXPIRED → CLOSED.
   * Salary range is parsed from JSON string.
   *
   * @param model - The Prisma JobPosting record.
   * @returns The domain JobPosting entity.
   */
  private toDomain(model: {
    id: string;
    employerId: string;
    title: string;
    description: string;
    requirements: string | null;
    location: string | null;
    jobType: string | null;
    salaryRange: string | null;
    state: PrismaJobState;
    expiresAt: Date | null;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): JobPosting {
    const salary = this.parseSalaryRange(model.salaryRange);
    const domainState: JobStateValue = PRISMA_TO_DOMAIN_STATE[model.state];

    const props: JobPostingProps = {
      id: model.id,
      employerId: model.employerId,
      title: model.title,
      description: model.description,
      requirements: model.requirements ?? "",
      salaryMin: salary.min,
      salaryMax: salary.max,
      currency: salary.currency ?? "VND",
      location: model.location ?? "",
      state: domainState,
      approvedAt: model.approvedAt,
      approvedBy: model.approvedBy,
      rejectionReason: model.rejectionReason,
      expiresAt: model.expiresAt ?? new Date(),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return new JobPosting(props);
  }

  /**
   * Converts a domain JobPosting entity to a Prisma create input.
   *
   * State mapping: SUBMITTED → PENDING.
   * Salary range is serialized to JSON string.
   *
   * @param entity - The domain JobPosting entity.
   * @returns The Prisma create input.
   */
  private toCreateInput(entity: JobPosting): Prisma.JobPostingCreateInput {
    const salaryRange = this.serializeSalaryRange(
      entity.salaryMin,
      entity.salaryMax,
      entity.currency,
    );

    return {
      employer: {
        connect: { id: entity.employerId },
      },
      title: entity.title,
      description: entity.description,
      requirements: entity.requirements,
      location: entity.location,
      state: DOMAIN_TO_PRISMA_STATE[entity.state.value],
      salaryRange,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Converts a domain JobPosting entity to a Prisma update input.
   *
   * @param entity - The domain JobPosting entity with updated values.
   * @returns The Prisma update input.
   */
  private toUpdateInput(entity: JobPosting): Prisma.JobPostingUpdateInput {
    const salaryRange = this.serializeSalaryRange(
      entity.salaryMin,
      entity.salaryMax,
      entity.currency,
    );

    return {
      title: entity.title,
      description: entity.description,
      requirements: entity.requirements,
      location: entity.location,
      state: DOMAIN_TO_PRISMA_STATE[entity.state.value],
      salaryRange,
      expiresAt: entity.expiresAt,
      approvedAt: entity.approvedAt,
      approvedBy: entity.approvedBy,
      rejectionReason: entity.rejectionReason,
      updatedAt: entity.updatedAt,
    };
  }

  // ── SALARY RANGE HELPERS ──────────────────────────────────────────

  /**
   * Parses the salary range JSON string from the database.
   *
   * Schema: {"min": number|null, "max": number|null, "currency": string|null}
   *
   * @param salaryRange - The JSON string or null.
   * @returns Parsed salary range object.
   */
  private parseSalaryRange(salaryRange: string | null): {
    min: number | null;
    max: number | null;
    currency: string | null;
  } {
    if (!salaryRange) {
      return { min: null, max: null, currency: null };
    }

    try {
      const parsed = JSON.parse(salaryRange);
      return {
        min: typeof parsed.min === "number" ? parsed.min : null,
        max: typeof parsed.max === "number" ? parsed.max : null,
        currency: typeof parsed.currency === "string" ? parsed.currency : null,
      };
    } catch {
      logger.debug({ salaryRange }, "Failed to parse salary range JSON, returning nulls");
      return { min: null, max: null, currency: null };
    }
  }

  /**
   * Serializes salary min, max, and currency into a JSON string for
   * storage in the Prisma `salaryRange` field (stored as VARCHAR).
   *
   * @param min - Minimum salary (nullable).
   * @param max - Maximum salary (nullable).
   * @param currency - Currency code (e.g. "VND", "USD").
   * @returns JSON string representation.
   */
  private serializeSalaryRange(min: number | null, max: number | null, currency: string): string {
    if (min === null && max === null) {
      return SALARY_RANGE_NULL;
    }

    return JSON.stringify({
      min,
      max,
      currency: currency ?? "VND",
    });
  }
}
