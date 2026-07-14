import { z } from "zod";
import { PASSWORD_REGEX } from "../password.constants";

/**
 * Zod validation schema for the Register endpoint.
 *
 * Validates:
 * - email: must be a valid e-mail format
 * - password: 8–32 chars, with at least 1 uppercase, 1 lowercase,
 *   1 number, and 1 special character (@$!%*?&#)
 * - role: must be either "STUDENT" or "EMPLOYER"
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Password must be 8–32 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)",
    ),
  role: z.enum(["STUDENT", "EMPLOYER"] as const),
});

/** Inferred RegisterDto type from the Zod schema. */
export type RegisterDto = z.infer<typeof registerSchema>;
