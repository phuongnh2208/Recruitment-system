import { z } from "zod";

/**
 * Zod validation schema for the VerifyEmail endpoint.
 *
 * Validates:
 * - token: must be a non-empty string
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token must not be empty"),
});

/** Inferred VerifyEmailDto type from the Zod schema. */
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
