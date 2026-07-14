import { z } from "zod";

/**
 * Zod validation schema for the Logout endpoint.
 *
 * Validates:
 * - refreshToken: must be a non-empty string
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token must not be empty"),
});

/** Inferred LogoutDto type from the Zod schema. */
export type LogoutDto = z.infer<typeof logoutSchema>;
