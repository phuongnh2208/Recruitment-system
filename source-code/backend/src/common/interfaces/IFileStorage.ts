/**
 * File Storage Interface
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Defines the contract for file storage operations (upload, delete, check
 * existence, get public URL).
 *
 * This interface sits in the Shared Kernel (`common/interfaces`) so that
 * Application Layer Use Cases can depend on it WITHOUT knowing whether the
 * underlying implementation is local disk, AWS S3, MinIO, or any other
 * storage backend.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   UploadCVUseCase
 *        │  depends on
 *        ▼
 *   IFileStorage  ←──────┐
 *        │               │ implemented by
 *        ▼               │
 *   LocalFileStorage ─────┘
 *        │
 *        ▼
 *   (future) S3FileStorage
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   import { IFileStorage } from "../../common/interfaces/IFileStorage";
 *
 *   class UploadCVUseCase {
 *     constructor(private readonly storage: IFileStorage) {}
 *     async execute(input: UploadCVInput): Promise<CVMetadata> {
 *       const url = await this.storage.upload(input.buffer, `cv/${studentId}/${uuid}.pdf`);
 *       // ...
 *     }
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Result of a successful upload operation.
 */
export interface UploadResult {
  /** The absolute or relative path where the file was stored. */
  path: string;
  /** Publicly accessible URL for the file (or a relative serving path in local mode). */
  url: string;
}

/**
 * File Storage interface — completely storage-backend agnostic.
 *
 * Implementations:
 *   - {@link LocalFileStorage} (MVP — local filesystem)
 *   - S3FileStorage       (future — AWS S3 / MinIO)
 */
export interface IFileStorage {
  /**
   * Upload a file (raw buffer) to the given path.
   *
   * @param file   - The file content as a Buffer.
   * @param path   - Destination path **relative** to the storage root
   *                 (e.g. `cv/abc-123/uuid.pdf`).
   *                 Must use forward slashes (`/`) regardless of host OS.
   * @returns Metadata about the stored file.
   * @throws {InfrastructureException} If the write fails.
   */
  upload(file: Buffer, path: string): Promise<UploadResult>;

  /**
   * Delete a file at the given absolute path (as returned by `upload`).
   *
   * @param path - Full path to the file to delete.
   * @throws {InfrastructureException} If the delete fails or the file
   *         does not exist (for consistency: callers should use `exists`
   *         first if they need to distinguish "not found" from "error").
   */
  delete(path: string): Promise<void>;

  /**
   * Check whether a file exists at the given path.
   *
   * @param path - Full path to check.
   * @returns `true` if a regular file exists at that path, `false` otherwise.
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get the publicly-accessible URL for a stored file.
   *
   * For local storage this will be a relative serving path
   * (e.g. `/uploads/cv/abc/uuid.pdf`).
   * For S3 this would be a full HTTPS URL.
   *
   * @param path - The absolute path (as returned by `upload`).
   * @returns The public URL string.
   */
  getPublicUrl(path: string): string;
}
