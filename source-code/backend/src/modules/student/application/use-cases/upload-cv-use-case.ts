/**
 * UploadCVUseCase
 *
 * Orchestrates the CV upload flow following Clean Architecture principles.
 * All dependencies are injected via the constructor – no concrete
 * implementations are instantiated inside the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPLICATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This Use Case belongs to the Application Layer. It orchestrates
 * domain entities, factories, repository, and strategy interfaces to
 * fulfill the upload CV use case without containing business logic itself.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USE CASE ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Use Case coordinates the flow:
 *   1. Validate input
 *   2. Check student existence via Repository
 *   3. Validate file constraints (mimeType, size)
 *   4. Generate storage path
 *   5. Upload file via FileStorage Strategy
 *   6. Create CVMetadata via Factory
 *   7. Persist metadata via Repository
 *   8. Return result
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
 * FACTORY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Factory centralises domain entity creation, encapsulating
 * construction logic and ensuring every CVMetadata entity is created
 * in a consistent, valid state.
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
 * ROLLBACK WHEN PERSISTENCE FAILS
 * ═══════════════════════════════════════════════════════════════════
 *
 * If the file uploads successfully but metadata persistence fails,
 * the uploaded file is deleted from storage to maintain consistency.
 * The InfrastructureException is then thrown to signal the failure.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NO BUSINESS LOGIC IN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════
 *
 * All orchestration, validation, and rollback logic lives here in
 * the Application Layer. The Controller (if any) only delegates
 * to this Use Case and formats the HTTP response.
 *
 * @category Application Use Case
 */

import { randomUUID } from "node:crypto";
import { IStudentProfileRepository } from "../../domain/repositories/student-profile-repository";
import { ICVRepository } from "../../domain/repositories/cv-repository";
import { CVMetadataFactory } from "../../domain/factories/cv-metadata-factory";
import { IFileStorageStrategy } from "../../../../common/interfaces/file-storage-strategy";
import { CVMetadata } from "../../domain/entities/cv-metadata";
import {
  ValidationException,
  BusinessException,
  NotFoundException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";
import { extname } from "node:path";

/**
 * Input DTO for the upload CV use‑case.
 */
export interface UploadCVCommand {
  /** The unique identifier of the student. */
  studentId: string;
  /** The original file name as uploaded by the student. */
  originalFileName: string;
  /** The MIME type of the uploaded file. */
  mimeType: string;
  /** The raw file content as a Buffer. */
  buffer: Buffer;
  /** The file size in bytes. */
  size: number;
}

/**
 * Output DTO for the upload CV use‑case.
 */
export interface UploadCVResult {
  /** Indicates whether the operation was successful. */
  success: true;
  /** The ID of the created CV metadata. */
  cvId: string;
  /** The storage path where the file was stored. */
  storagePath: string;
}

/** Maximum allowed file size in bytes (5 MB). */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Accepted MIME types for CV uploads. */
const ACCEPTED_MIME_TYPES = ["application/pdf"] as const;

export class UploadCVUseCase {
  constructor(
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly cvRepository: ICVRepository,
    private readonly cvMetadataFactory: CVMetadataFactory,
    private readonly storage: IFileStorageStrategy,
  ) {}

  /**
   * Execute the upload CV flow.
   *
   * @param command - The upload CV command containing file data.
   * @returns An UploadCVResult indicating successful operation.
   * @throws {ValidationException} If input validation fails.
   * @throws {BusinessException} If a business rule is violated.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(command: UploadCVCommand): Promise<UploadCVResult> {
    try {
      // ── 1. Validate required fields are not empty ─────────────────
      if (!command.studentId || command.studentId.trim().length === 0) {
        logger.warn("Invalid File – studentId is required");
        throw new ValidationException("studentId is required");
      }

      if (!command.originalFileName || command.originalFileName.trim().length === 0) {
        logger.warn("Invalid File – originalFileName is required");
        throw new ValidationException("originalFileName is required");
      }

      if (!command.mimeType || command.mimeType.trim().length === 0) {
        logger.warn("Invalid File – mimeType is required");
        throw new ValidationException("mimeType is required");
      }

      if (!command.buffer) {
        logger.warn("Invalid File – buffer is required");
        throw new ValidationException("buffer is required");
      }

      if (command.size <= 0) {
        logger.warn("Invalid File – size must be greater than 0");
        throw new ValidationException("size must be greater than 0");
      }

      // ── 2. Check StudentProfile exists ────────────────────────────
      const studentProfile = await this.studentProfileRepository.findByUserId(command.studentId);

      if (!studentProfile) {
        logger.warn("Student Not Found – no profile exists for the given studentId");
        throw new NotFoundException("Student profile not found");
      }

      // ── 3. Validate MIME type ─────────────────────────────────────
      if (!ACCEPTED_MIME_TYPES.includes(command.mimeType as (typeof ACCEPTED_MIME_TYPES)[number])) {
        logger.warn("Invalid File – only application/pdf is accepted");
        throw new ValidationException("Only PDF files are accepted");
      }

      // ── 4. Validate file size (max 5 MB) ──────────────────────────
      if (command.size > MAX_FILE_SIZE) {
        logger.warn("Invalid File – file size exceeds 5 MB limit");
        throw new ValidationException("File size must not exceed 5 MB");
      }

      // ── 5. Generate storage path ──────────────────────────────────
      const fileUuid = randomUUID();
      const fileExtension = extname(command.originalFileName);
      const fileName = `${fileUuid}${fileExtension}`;
      const storagePath = `uploads/cv/${command.studentId}/${fileName}`;

      // ── 6. Upload file via storage strategy ───────────────────────
      const uploadResult = await this.storage.upload(command.buffer, storagePath);

      // ── 7. Create CVMetadata via factory ──────────────────────────
      const metadata = this.cvMetadataFactory.create({
        studentId: command.studentId,
        fileName,
        originalFileName: command.originalFileName,
        mimeType: command.mimeType,
        fileSize: command.size,
        storagePath: uploadResult.path,
      });

      // ── 8. Persist metadata ───────────────────────────────────────
      let created: CVMetadata;
      try {
        created = await this.cvRepository.create(metadata);
      } catch (persistError) {
        // Rollback: delete uploaded file if metadata persistence fails
        try {
          await this.storage.delete(uploadResult.path);
        } catch (rollbackError) {
          logger.error(
            {
              storagePath: uploadResult.path,
              rollbackError:
                rollbackError instanceof Error ? rollbackError.message : "Unknown rollback error",
            },
            "Rollback Failed – unable to delete uploaded file after metadata persistence failure",
          );
        }

        const errorMessage =
          persistError instanceof Error ? persistError.message : "Unknown persistence error";
        const errorStack = persistError instanceof Error ? persistError.stack : undefined;

        logger.error(
          {
            error: errorMessage,
            ...(errorStack && { stack: errorStack }),
          },
          "Upload Failed – metadata persistence failed after file upload",
        );

        const details: Record<string, unknown> = {
          message: errorMessage,
          ...(errorStack && { stack: errorStack }),
        };

        throw new InfrastructureException("Failed to persist CV metadata", details);
      }

      // ── 9. Log success ────────────────────────────────────────────
      logger.info(
        {
          studentId: command.studentId,
          cvId: created.id,
          storagePath: uploadResult.path,
        },
        "CV Uploaded",
      );

      // TODO: Publish CVUploaded event

      return {
        success: true,
        cvId: created.id!,
        storagePath: uploadResult.path,
      };
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
        "Unexpected Error during CV upload",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("CV upload failed", details);
    }
  }
}
