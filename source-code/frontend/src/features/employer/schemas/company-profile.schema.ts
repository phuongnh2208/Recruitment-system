/**
 * Zod validation schema for the Employer Company Profile form.
 *
 * Validation rules:
 * - companyName: required, non-empty string
 * - description: optional string
 * - website: optional valid URL if provided
 * - logoUrl: optional string
 */
import { z } from "zod";

export const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Tên công ty không được để trống"),
  description: z.string().optional().or(z.literal("")),
  website: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message:
          "Website không hợp lệ. Vui lòng nhập đầy đủ URL (ví dụ: https://example.com)",
      },
    ),
  logoUrl: z.string().optional().or(z.literal("")),
});

/** Inferred type from the Zod schema. */
export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
