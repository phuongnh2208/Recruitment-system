/**
 * CV-related type definitions for the Student feature.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data shapes for CV entities and API payloads
 *   - ❌ No business logic
 *   - ❌ No validation schemas
 */

/** Metadata for a single CV document. */
export interface CVMetadata {
  id: string;
  studentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isDefault: boolean;
  uploadedAt: string;
}

/** Response from the CV list API. */
export interface CvListResponse {
  success: boolean;
  data: CVMetadata[];
}

/** Response from the CV upload API. */
export interface CvUploadResponse {
  success: boolean;
  data: CVMetadata;
}

/** Response from set-default / delete APIs. */
export interface CvActionResponse {
  success: boolean;
}
