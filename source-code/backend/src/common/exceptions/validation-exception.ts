import { BusinessException } from "./business-exception";
import { ErrorCode } from "./error-code";

/**
 * Thrown when input validation fails.
 *
 * ── HTTP 400 ── B001 ── Validation Error ─────────────────────────
 *
 * @example
 *   throw new ValidationException("Email is required");
 *   throw new ValidationException("Invalid password format", {
 *     constraints: ["minLength", "upperCase"],
 *   });
 */
export class ValidationException extends BusinessException {
  public static readonly DEFAULT_MESSAGE = "Validation error";

  constructor(message?: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message ?? ValidationException.DEFAULT_MESSAGE, 400, details);
  }
}
