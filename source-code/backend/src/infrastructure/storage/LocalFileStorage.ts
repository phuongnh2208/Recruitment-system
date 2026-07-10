/**
 * LocalFileStorage — Infrastructure Layer
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements {@link IFileStorage} on the local filesystem.
 *
 * Files are stored under:
 *   {UPLOAD_ROOT}/cv/{studentId}/{uuid}.pdf   – CVs
 *   {UPLOAD_ROOT}/avatar/{userId}/{uuid}.ext   – Avatars
 *
 * The root directory is read from the `UPLOAD_ROOT` environment variable
 * and defaults to `"uploads"` when not set.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * VALIDATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * | Use case | Allowed MIME types          |
 * |----------|-----------------------------|
 * | CV       | application/pdf             |
 * | Avatar   | image/jpeg, image/png       |
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * All file-system errors are wrapped in {@link InfrastructureException}
 * so callers never need to catch raw Node.js `Error` instances.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { mkdir, unlink, access, constants, writeFile } from "node:fs/promises";
import path from "node:path";

import { IFileStorage, UploadResult } from "../../common/interfaces/IFileStorage";
import { InfrastructureException } from "../../common/exceptions";
import { logger } from "../../common/logger";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Default upload root when `UPLOAD_ROOT` env var is not set. */
const DEFAULT_UPLOAD_ROOT = "uploads";

/** Allowed MIME types for CV documents. */
const ALLOWED_CV_TYPES = new Set(["application/pdf"]);

/** Allowed MIME types for avatar images. */
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png"]);

// ── Helper: determine upload category from path ───────────────────────────────

/**
 * Extract the top-level category from a relative path.
 *
 * Examples:
 *   "cv/abc-123/file.pdf"     → "cv"
 *   "avatar/user-456/pic.jpg" → "avatar"
 *
 * @param relativePath - The path passed to {@link upload}.
 * @returns The first segment of the path.
 */
function extractCategory(relativePath: string): string {
  const normalized = relativePath.split("/").filter(Boolean);
  return normalized[0] ?? "";
}

// ── Class ─────────────────────────────────────────────────────────────────────

/**
 * Local filesystem implementation of {@link IFileStorage}.
 *
 * @example
 *   const storage = new LocalFileStorage();
 *   const result = await storage.upload(buffer, "cv/abc-123/uuid.pdf");
 */
export class LocalFileStorage implements IFileStorage {
  /** Resolved absolute path to the upload root directory. */
  private readonly uploadRoot: string;

  constructor() {
    const envRoot = process.env.UPLOAD_ROOT?.trim();
    this.uploadRoot = path.resolve(envRoot || DEFAULT_UPLOAD_ROOT);
    logger.info({ uploadRoot: this.uploadRoot }, "LocalFileStorage initialized");
  }

  // ── upload ──────────────────────────────────────────────────────────────────

  /**
   * Upload a file to the local filesystem.
   *
   * @param file - File content as a Buffer.
   * @param destinationPath - Relative destination path (forward-slash separated,
   *                          e.g. `"cv/abc-123/uuid.pdf"`).
   * @throws {InfrastructureException} If the path category is unknown, the MIME type
   *         (inferred from the file extension) is not allowed for that category, or
   *         the file-system write fails.
   */
  async upload(file: Buffer, destinationPath: string): Promise<UploadResult> {
    const category = extractCategory(destinationPath);

    // ── Validate category ────────────────────────────────────────────────
    this.validateCategory(category);

    // ── Validate MIME type via file extension ─────────────────────────────
    const ext = path.extname(destinationPath).toLowerCase();
    const mimeType = this.extensionToMime(ext);
    this.validateMimeType(category, mimeType, file);

    // ── Resolve full path & ensure directory exists ──────────────────────
    const absolutePath = path.join(this.uploadRoot, ...destinationPath.split("/"));
    const dir = path.dirname(absolutePath);

    try {
      await mkdir(dir, { recursive: true });
    } catch (mkdirError: unknown) {
      const message = mkdirError instanceof Error ? mkdirError.message : "Unknown error";
      logger.error(
        { category, destinationPath, error: message },
        "Failed to create upload directory",
      );
      throw new InfrastructureException(`Cannot create directory: ${message}`, {
        category,
        destinationPath,
      });
    }

    // ── Write file ───────────────────────────────────────────────────────
    try {
      await writeFile(absolutePath, file);
    } catch (writeError: unknown) {
      const message = writeError instanceof Error ? writeError.message : "Unknown error";
      logger.error({ category, destinationPath, error: message }, "Failed to write file");
      throw new InfrastructureException(`Cannot write file: ${message}`, {
        category,
        destinationPath,
      });
    }

    logger.info({ category, destinationPath, size: file.length }, "File uploaded successfully");

    return {
      path: absolutePath,
      url: this.getPublicUrl(destinationPath),
    };
  }

  // ── delete ──────────────────────────────────────────────────────────────────

  /**
   * Delete a file at the given absolute path.
   *
   * @param filePath - The absolute path of the file to delete (as returned
   *                   by the `path` field of {@link UploadResult}).
   * @throws {InfrastructureException} If the deletion fails.
   */
  async delete(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      logger.info({ filePath }, "File deleted successfully");
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Unknown error";
      logger.error({ filePath, error: message }, "Failed to delete file");
      throw new InfrastructureException(`Cannot delete file: ${message}`, {
        filePath,
      });
    }
  }

  // ── exists ──────────────────────────────────────────────────────────────────

  /**
   * Check whether a file exists at the given path.
   *
   * @param filePath - The path to check.
   * @returns `true` if a regular file exists, `false` otherwise.
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  // ── getPublicUrl ────────────────────────────────────────────────────────────

  /**
   * Get the public serving URL for a stored file.
   *
   * For local storage this returns a relative URL rooted at `/uploads/`.
   *
   * @param destinationPath - The relative path passed to {@link upload}
   *                          (e.g. `"cv/abc-123/uuid.pdf"`).
   * @returns A URL string like `"/uploads/cv/abc-123/uuid.pdf"`.
   */
  getPublicUrl(destinationPath: string): string {
    return `/${DEFAULT_UPLOAD_ROOT}/${destinationPath.replace(/\\/g, "/")}`;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Validate that the category is one of the known types.
   */
  private validateCategory(category: string): void {
    if (category !== "cv" && category !== "avatar") {
      logger.warn({ category }, "Unknown upload category");
      throw new InfrastructureException(
        `Unknown upload category "${category}". Allowed: "cv", "avatar".`,
        { category },
      );
    }
  }

  /**
   * Map a file extension to a MIME type.
   */
  private extensionToMime(ext: string): string {
    const map: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };
    return map[ext] ?? "application/octet-stream";
  }

  /**
   * Validate that the MIME type is allowed for the given category.
   *
   * For non-CV / non-avatar categories, a warning is logged but no error is
   * thrown — the caller decides which category to use.
   */
  private validateMimeType(category: string, mimeType: string, _file: Buffer): void {
    const allowed = category === "cv" ? ALLOWED_CV_TYPES : ALLOWED_AVATAR_TYPES;

    if (!allowed.has(mimeType)) {
      logger.warn({ category, mimeType }, "Invalid file type for category");
      throw new InfrastructureException(
        `Invalid file type "${mimeType}" for category "${category}". ` +
          `Allowed: ${Array.from(allowed).join(", ")}.`,
        { category, mimeType },
      );
    }
  }
}
