/**
 * Zod validation schemas for CV upload.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCHEMAS LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ File validation rules (PDF only, max 5 MB)
 *   - ❌ No business logic
 *   - ❌ No API calls
 */
import { z } from "zod";

/** Maximum allowed file size in bytes (5 MB). */
export const MAX_CV_SIZE = 5 * 1024 * 1024;

/** Allowed MIME type for CV uploads. */
export const ALLOWED_CV_MIME = "application/pdf";

/**
 * Validates a File object for CV upload.
 * Returns the file if valid, or a ZodError if invalid.
 */
export const cvFileSchema = z
  .instanceof(File, { message: "Vui lòng chọn một tệp tin." })
  .refine((file) => file.size <= MAX_CV_SIZE, {
    message: "Kích thước tệp tối đa là 5 MB.",
  })
  .refine((file) => file.type === ALLOWED_CV_MIME, {
    message: "Chỉ chấp nhận tệp PDF.",
  });

/** Inferred type for a validated CV file. */
export type CvFile = z.infer<typeof cvFileSchema>;
