/**
 * File Storage Interface — DEPRECATED
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * @deprecated Since TSK-INF-211A — Use {@link IFileStorageStrategy} instead.
 *
 * This interface is kept for backward compatibility only.
 * It will be removed in a future version.
 *
 * All new code MUST depend on {@link IFileStorageStrategy} from
 * `./file-storage-strategy` to support the Strategy Pattern.
 *
 * Migration:
 *   import { IFileStorage } from "./IFileStorage";
 *   → import { IFileStorageStrategy } from "./file-storage-strategy";
 *   const storage: IFileStorage = new LocalFileStorage();
 *   → const storage: IFileStorageStrategy = new LocalFileStorageStrategy();
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Result of a successful upload operation.
 *
 * @deprecated Use {@link import('./file-storage-strategy').UploadResult} instead.
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
 * @deprecated Since TSK-INF-211A — Use {@link IFileStorageStrategy} instead.
 *             This interface will be removed in a future version.
 *
 * Implementations:
 *   - {@link LocalFileStorage} (removed) — use {@link LocalFileStorageStrategy}
 *   - S3FileStorage (removed) — use {@link S3FileStorageStrategy}
 */
export interface IFileStorage {
  /**
   * Upload a file (raw buffer) to the given path.
   *
   * @deprecated Use {@link IFileStorageStrategy#upload} instead.
   */
  upload(file: Buffer, path: string): Promise<UploadResult>;

  /**
   * Delete a file at the given absolute path.
   *
   * @deprecated Use {@link IFileStorageStrategy#delete} instead.
   */
  delete(path: string): Promise<void>;

  /**
   * Check whether a file exists at the given path.
   *
   * @deprecated Use {@link IFileStorageStrategy#exists} instead.
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get the publicly-accessible URL for a stored file.
   *
   * @deprecated Use {@link IFileStorageStrategy#getPublicUrl} instead.
   */
  getPublicUrl(path: string): string;
}
