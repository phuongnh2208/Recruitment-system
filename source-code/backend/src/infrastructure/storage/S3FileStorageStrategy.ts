/**
 * S3FileStorageStrategy — Infrastructure Layer (Placeholder)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Placeholder implementation of {@link IFileStorageStrategy} for AWS S3 / MinIO.
 *
 * This class demonstrates the Open/Closed Principle:
 *   - New storage backends can be added WITHOUT modifying existing Use Cases.
 *   - Use Cases depend only on {@link IFileStorageStrategy}, not on concrete classes.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This is ONE of many possible strategies:
 *
 *   - LocalFileStorageStrategy  (local filesystem — fully implemented)
 *   - S3FileStorageStrategy     (AWS S3 / MinIO — this placeholder)
 *
 * To switch from local to S3, Use Case code does NOT change:
 *
 *   // Before:
 *   const storage = new LocalFileStorageStrategy();
 *
 *   // After:
 *   const storage = new S3FileStorageStrategy();
 *
 *   // Use Case remains exactly the same.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMPLEMENTATION STATUS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This is a PLACEHOLDER. AWS SDK is NOT integrated.
 *
 * When ready to implement:
 *   1. Install AWS SDK: `npm install @aws-sdk/client-s3`
 *   2. Configure S3 client with credentials from environment variables.
 *   3. Implement each method using S3 API calls.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { IFileStorageStrategy, UploadResult } from "../../common/interfaces/file-storage-strategy";
import { InfrastructureException } from "../../common/exceptions";

/**
 * AWS S3 / MinIO implementation of {@link IFileStorageStrategy}.
 *
 * **PLACEHOLDER — NOT YET IMPLEMENTED.**
 *
 * @example
 *   // Future usage (when implemented):
 *   const storage = new S3FileStorageStrategy();
 *   const result = await storage.upload(buffer, "cv/abc-123/uuid.pdf");
 */
export class S3FileStorageStrategy implements IFileStorageStrategy {
  /**
   * Upload a file to S3.
   *
   * @throws {InfrastructureException} Always — not yet implemented.
   */
  async upload(_file: Buffer, _path: string): Promise<UploadResult> {
    throw new InfrastructureException("S3FileStorageStrategy chưa được hiện thực.");
  }

  /**
   * Delete a file from S3.
   *
   * @throws {InfrastructureException} Always — not yet implemented.
   */
  async delete(_path: string): Promise<void> {
    throw new InfrastructureException("S3FileStorageStrategy chưa được hiện thực.");
  }

  /**
   * Check whether a file exists in S3.
   *
   * @throws {InfrastructureException} Always — not yet implemented.
   */
  async exists(_path: string): Promise<boolean> {
    throw new InfrastructureException("S3FileStorageStrategy chưa được hiện thực.");
  }

  /**
   * Get the public URL for a file stored in S3.
   *
   * @throws {InfrastructureException} Always — not yet implemented.
   */
  getPublicUrl(_path: string): string {
    throw new InfrastructureException("S3FileStorageStrategy chưa được hiện thực.");
  }
}
