/**
 * Applicant Detail Zod schema for runtime validation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCHEMAS LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Zod schema for API response validation
 *   - ✅ TypeScript type inference from schema
 *   - ❌ No business logic
 *   - ❌ No API calls
 */

import { z } from "zod";

/** Status enum for application states. */
const ApplicationStatus = z.enum([
  "Applied",
  "Under Review",
  "Accepted",
  "Rejected",
  "Withdrawn",
]);

/** Student info sub-schema. */
const StudentInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  university: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  graduationYear: z.number().int().nullable().optional(),
});

/** Full applicant detail schema. */
export const applicantDetailSchema = z.object({
  id: z.string(),
  jobTitle: z.string(),
  student: StudentInfoSchema,
  coverLetter: z.string().nullable().optional(),
  status: ApplicationStatus,
  appliedDate: z.string(),
  cvUrl: z.string().nullable().optional(),
});
