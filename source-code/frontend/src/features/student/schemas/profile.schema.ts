/**
 * Zod validation schema for the Student Profile form.
 *
 * Validation rules:
 * - fullName: required, non-empty string
 * - phone:    required, non-empty string
 * - address:  optional string
 * - university: optional string
 * - major:    optional string
 * - graduationYear: optional string
 */
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(1, "Họ và tên không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  address: z.string().optional().or(z.literal("")),
  university: z.string().optional().or(z.literal("")),
  major: z.string().optional().or(z.literal("")),
  graduationYear: z.string().optional().or(z.literal("")),
});

/** Inferred type from the Zod schema. */
export type ProfileFormValues = z.infer<typeof profileSchema>;
