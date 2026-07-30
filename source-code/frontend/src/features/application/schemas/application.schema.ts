/**
 * Application feature validation schemas using Zod.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCHEMA LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Zod schemas for runtime validation
 *   - ✅ Type inference from schemas
 *   - ❌ No business logic
 *   - ❌ No API calls
 */

import { z } from "zod";

/**
 * Schema for applying to a job.
 * Validates the form input before submission.
 */
export const applyJobSchema = z.object({
  /** Selected CV ID (required). */
  cvId: z.string().min(1, "Vui lòng chọn CV"),
  /** Cover letter (optional). */
  coverLetter: z
    .string()
    .max(2000, "Thư xin việc không được vượt quá 2000 ký tự")
    .optional(),
});

/** Inferred type from the apply job schema. */
export type ApplyJobFormData = z.infer<typeof applyJobSchema>;
