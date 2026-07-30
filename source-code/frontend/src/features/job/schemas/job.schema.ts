/**
 * Zod validation schema for the Job Posting form.
 *
 * Validation rules:
 * - title: required, 1-120 characters
 * - description: required, non-empty string
 * - requirements: required, non-empty string
 * - location: required, non-empty string
 * - salaryMin: optional, non-negative integer
 * - salaryMax: optional, non-negative integer
 * - expiresAt: required, future date
 */
import { z } from "zod";

export const jobSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(120, "Tiêu đề không được vượt quá 120 ký tự"),
  description: z.string().min(1, "Mô tả không được để trống"),
  requirements: z.string().min(1, "Yêu cầu không được để trống"),
  location: z.string().min(1, "Địa điểm không được để trống"),
  salaryMin: z.coerce
    .number()
    .int()
    .nonnegative("Lương tối thiểu phải là số nguyên không âm")
    .optional()
    .nullable(),
  salaryMax: z.coerce
    .number()
    .int()
    .nonnegative("Lương tối đa phải là số nguyên không âm")
    .optional()
    .nullable(),
  expiresAt: z.string().min(1, "Hạn nộp không được để trống"),
});

/** Inferred type from the Zod schema. */
export type JobFormValues = z.infer<typeof jobSchema>;
