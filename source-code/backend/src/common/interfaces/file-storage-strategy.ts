/**
 * File Storage Strategy Interface
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Defines the Strategy Pattern contract for file storage operations.
 *
 * This interface enables the Open/Closed Principle:
 *   - New storage backends can be added WITHOUT modifying existing Use Cases.
 *   - Use Cases depend only on this abstraction, not on concrete implementations.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   UploadCVUseCase (or any Use Case)
 *        │  depends on
 *        ▼
 *   IFileStorageStrategy  ←──────┐
 *        │                      │ implemented by
 *        ▼                      │
 *   LocalFileStorageStrategy ────┘
 *        │
 *        ▼
 *   (future) S3FileStorageStrategy
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   // Switch storage backend WITHOUT changing Use Case code:
 *
 *   const storage = new LocalFileStorageStrategy();
 *   // ... later ...
 *   const storage = new S3FileStorageStrategy();
 *
 *   // Use Case remains unchanged:
 *   class UploadCVUseCase {
 *     constructor(private readonly storage: IFileStorageStrategy) {}
 *     async execute(input: UploadCVInput): Promise<CVMetadata> {
 *       const result = await this.storage.upload(input.buffer, `cv/${studentId}/${uuid}.pdf`);
 *       return result;
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
  /** Publicly accessible URL for the file. */
  url: string;
}

/**
 * File Storage Strategy interface — completely storage-backend agnostic.
 *
 * Implementations:
 *   - {@link LocalFileStorageStrategy} (local filesystem)
 *   - {@link S3FileStorageStrategy} (AWS S3 / MinIO — placeholder)
 */
export interface IFileStorageStrategy {
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
   *         does not exist.
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
