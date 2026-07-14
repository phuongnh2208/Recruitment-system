import { z } from "zod";
import { PASSWORD_REGEX } from "../password.constants";

/**
 * Zod validation schema for the ChangePassword endpoint.
 *
 * Validates:
 * - currentPassword: must match the password policy (8–32 chars,
 *   1 uppercase, 1 lowercase, 1 number, 1 special char)
 * - newPassword: must match the same password policy
 * - Refinement: currentPassword !== newPassword
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .regex(
        PASSWORD_REGEX,
        "Current password must be 8–32 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)",
      ),
    newPassword: z
      .string()
      .regex(
        PASSWORD_REGEX,
        "New password must be 8–32 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)",
      ),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

/** Inferred ChangePasswordDto type from the Zod schema. */
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
