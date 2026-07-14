/**
 * Shared password validation constants for the Authentication Module.
 *
 * This constant defines the regex pattern for password validation used across
 * all Zod schemas in the Presentation Layer. It enforces:
 *
 * - 8–32 characters total length
 * - At least one uppercase letter (A–Z)
 * - At least one lowercase letter (a–z)
 * - At least one digit (0–9)
 * - At least one special character from the set: @$!%*?&#
 * - No whitespace allowed
 *
 * Defined as a single source of truth to avoid regex duplication.
 */
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,32}$/;
