import { z } from "zod";

/**
 * Zod validation schema for the Login endpoint.
 *
 * Validates:
 * - email: must be a valid e-mail format
 * - password: must be a non-empty string
 *
 * NOTE: The full password policy (uppercase, lowercase, digit, special char,
 * 8–32 length) is NOT enforced here. This avoids blocking login when:
 *   - Password policies change after registration
 *   - Users are imported from legacy systems
 *   This follows production patterns used by Google, Microsoft, GitHub, etc.
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password must not be empty"),
});

/** Inferred LoginDto type from the Zod schema. */
export type LoginDto = z.infer<typeof loginSchema>;
