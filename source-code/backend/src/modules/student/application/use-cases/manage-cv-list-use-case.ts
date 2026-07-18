/**
 * ManageCVListUseCase
 *
 * Orchestrates CV list management operations following Clean Architecture principles.
 * All dependencies are injected via the constructor – no concrete
 * implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities, repository, and strategy interfaces to fulfill
 * the manage CV list use case without containing business logic itself.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USE CASE ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Use Case coordinates the flow:
 *   1. List CVs       → validate input → repository.findByStudentId → return list
 *   2. Delete CV      → validate input → repository.findById → verify owner →
 *                       storage.delete → repository.delete → return success
 *   3. Set Default CV → validate input → repository.findById → verify owner →
 *                       findDefaultByStudentId → remove default from current →
 *                       mark target as default → repository.update both → return success
 *
 * ═══════════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * Repositories abstract away the underlying persistence mechanism.
 * The Use Case depends only on repository interfaces (abstractions),
 * not on concrete implementations (e.g. Prisma, in-memory).
 *
 * ═══════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * File storage is abstracted behind IFileStorageStrategy. The Use Case
 * has zero knowledge of whether files are stored locally, on S3, or
 * any other backend. New storage backends can be added without
 * modifying this Use Case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NO BUSINESS LOGIC IN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════
 *
 * All orchestration, validation, and business flow logic lives here in
 * the Application Layer. The Controller (if any) only delegates
 * to this Use Case and formats the HTTP response.
 *
 * @category Application Use Case
 */

import { ICVRepository } from "../../domain/repositories/cv-repository";
import { IFileStorageStrategy } from "../../../../common/interfaces/file-storage-strategy";
import { CVMetadata } from "../../domain/entities/cv-metadata";
import {
  ValidationException,
  NotFoundException,
  AuthenticationException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for listing CVs.
 */
export interface ListCVCommand {
  /** The unique identifier of the student. */
  studentId: string;
}

/**
 * Input DTO for deleting a CV.
 */
export interface DeleteCVCommand {
  /** The unique identifier of the student. */
  studentId: string;
  /** The unique identifier of the CV to delete. */
  cvId: string;
}

/**
 * Input DTO for setting a CV as default.
 */
export interface SetDefaultCVCommand {
  /** The unique identifier of the student. */
  studentId: string;
  /** The unique identifier of the CV to set as default. */
  cvId: string;
}

/**
 * Output DTO for listing CVs.
 */
export interface ListCVResult {
  /** The list of CV metadata belonging to the student. */
  cvs: CVMetadata[];
}

/**
 * Output DTO for deleting a CV.
 */
export interface DeleteCVResult {
  /** Indicates whether the operation was successful. */
  success: true;
}

/**
 * Output DTO for setting a CV as default.
 */
export interface SetDefaultCVResult {
  /** Indicates whether the operation was successful. */
  success: true;
}

export class ManageCVListUseCase {
  constructor(
    private readonly cvRepository: ICVRepository,
    private readonly storage: IFileStorageStrategy,
  ) {}

  /**
   * List all CVs belonging to a student.
   *
   * @param command - The list CV command containing the student ID.
   * @returns A list of CV metadata entities.
   * @throws {ValidationException} If input validation fails.
   */
  async list(command: ListCVCommand): Promise<ListCVResult> {
    try {
      // ── 1. Validate studentId ──────────────────────────────────────
      if (!command.studentId || command.studentId.trim().length === 0) {
        logger.warn("Invalid Input – studentId is required");
        throw new ValidationException("studentId is required");
      }

      // ── 2. Fetch CVs from repository ───────────────────────────────
      const cvs = await this.cvRepository.findByStudentId(command.studentId);

      // ── 3. Log success ─────────────────────────────────────────────
      logger.debug(
        {
          studentId: command.studentId,
          count: cvs.length,
        },
        "CV List Retrieved",
      );

      return { cvs };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (
        error instanceof ValidationException ||
        error instanceof BusinessException ||
        error instanceof InfrastructureException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during CV list retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to list CVs", details);
    }
  }

  /**
   * Delete a CV by its ID.
   *
   * @param command - The delete CV command containing student ID and CV ID.
   * @returns A success result.
   * @throws {ValidationException} If input validation fails.
   * @throws {NotFoundException} If the CV is not found.
   * @throws {AuthenticationException} If the student does not own the CV.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async delete(command: DeleteCVCommand): Promise<DeleteCVResult> {
    try {
      // ── 1. Validate inputs ─────────────────────────────────────────
      if (!command.studentId || command.studentId.trim().length === 0) {
        logger.warn("Invalid Input – studentId is required");
        throw new ValidationException("studentId is required");
      }

      if (!command.cvId || command.cvId.trim().length === 0) {
        logger.warn("Invalid Input – cvId is required");
        throw new ValidationException("cvId is required");
      }

      // ── 2. Find CV by ID ───────────────────────────────────────────
      const cv = await this.cvRepository.findById(command.cvId);

      if (!cv) {
        logger.warn(
          {
            cvId: command.cvId,
          },
          "CV Not Found – no CV exists for the given cvId",
        );
        throw new NotFoundException("CV not found");
      }

      // ── 3. Verify ownership ────────────────────────────────────────
      if (cv.studentId !== command.studentId) {
        logger.warn(
          {
            cvId: command.cvId,
            studentId: command.studentId,
            ownerId: cv.studentId,
          },
          "Unauthorized – student does not own this CV",
        );
        throw new AuthenticationException("You do not own this CV");
      }

      // ── 4. Delete file from storage ────────────────────────────────
      await this.storage.delete(cv.storagePath);

      // ── 5. Delete metadata from repository ─────────────────────────
      await this.cvRepository.delete(command.cvId);

      // ── 6. Log success ─────────────────────────────────────────────
      logger.info(
        {
          studentId: command.studentId,
          cvId: command.cvId,
        },
        "CV Deleted",
      );

      return { success: true };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (
        error instanceof ValidationException ||
        error instanceof NotFoundException ||
        error instanceof AuthenticationException ||
        error instanceof BusinessException ||
        error instanceof InfrastructureException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during CV deletion",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to delete CV", details);
    }
  }

  /**
   * Set a CV as the default CV for a student.
   *
   * Only one CV can be the default at a time. If a default CV already exists,
   * its default status is removed before setting the new one.
   *
   * @param command - The set default CV command containing student ID and CV ID.
   * @returns A success result.
   * @throws {ValidationException} If input validation fails.
   * @throws {NotFoundException} If the CV is not found.
   * @throws {AuthenticationException} If the student does not own the CV.
   * @throws {ConflictException} If the CV is already the default (thrown by entity).
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async setDefault(command: SetDefaultCVCommand): Promise<SetDefaultCVResult> {
    try {
      // ── 1. Validate inputs ─────────────────────────────────────────
      if (!command.studentId || command.studentId.trim().length === 0) {
        logger.warn("Invalid Input – studentId is required");
        throw new ValidationException("studentId is required");
      }

      if (!command.cvId || command.cvId.trim().length === 0) {
        logger.warn("Invalid Input – cvId is required");
        throw new ValidationException("cvId is required");
      }

      // ── 2. Find target CV by ID ────────────────────────────────────
      const target = await this.cvRepository.findById(command.cvId);

      if (!target) {
        logger.warn(
          {
            cvId: command.cvId,
          },
          "CV Not Found – no CV exists for the given cvId",
        );
        throw new NotFoundException("CV not found");
      }

      // ── 3. Verify ownership ────────────────────────────────────────
      if (target.studentId !== command.studentId) {
        logger.warn(
          {
            cvId: command.cvId,
            studentId: command.studentId,
            ownerId: target.studentId,
          },
          "Unauthorized – student does not own this CV",
        );
        throw new AuthenticationException("You do not own this CV");
      }

      // ── 4. Find current default CV ─────────────────────────────────
      const currentDefault = await this.cvRepository.findDefaultByStudentId(command.studentId);

      // ── 5. If a default CV exists and it's different from target, remove its default status ──
      if (currentDefault && currentDefault.id !== target.id) {
        currentDefault.removeDefault();
        await this.cvRepository.update(currentDefault);
      }

      // ── 6. Mark target as default ──────────────────────────────────
      // If the target is already the default, the entity will throw ConflictException
      target.markAsDefault();
      await this.cvRepository.update(target);

      // ── 7. Log success ─────────────────────────────────────────────
      logger.info(
        {
          studentId: command.studentId,
          cvId: command.cvId,
        },
        "CV Set as Default",
      );

      return { success: true };
    } catch (error) {
      // Re-throw known domain exceptions without wrapping
      if (
        error instanceof ValidationException ||
        error instanceof NotFoundException ||
        error instanceof AuthenticationException ||
        error instanceof BusinessException ||
        error instanceof InfrastructureException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during setting default CV",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to set default CV", details);
    }
  }
}
