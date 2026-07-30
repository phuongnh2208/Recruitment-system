/**
 * Application status update validation schemas using Zod.
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
 * Schema for updating application status.
 * Validates the status and optional reason.
 */
export const updateApplicationStatusSchema = z.object({
  /** Application status: UNDER_REVIEW, ACCEPTED, or REJECTED */
  status: z.enum(["UNDER_REVIEW", "ACCEPTED", "REJECTED"]),
  /** Reason for rejection (required when status is REJECTED) */
  reason: z
    .string()
    .max(1000, "Lý do từ chối không được vượt quá 1000 ký tự")
    .optional(),
});

/** Inferred type from the update application status schema. */
export type UpdateApplicationStatusFormData = z.infer<
  typeof updateApplicationStatusSchema
>;
