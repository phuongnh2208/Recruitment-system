/**
 * Pending Approval feature Zod schemas.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCHEMA LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Rejection reason validation
 *   - ❌ No business logic
 */

import { z } from "zod";

/**
 * Schema for the job rejection reason form.
 */
export const rejectJobSchema = z.object({
  reason: z
    .string()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do từ chối tối đa 1000 ký tự"),
});

/** TypeScript type infered from the reject job schema. */
export type RejectJobFormData = z.infer<typeof rejectJobSchema>;
