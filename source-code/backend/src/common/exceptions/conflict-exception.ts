import { BusinessException } from "./business-exception";
import { ErrorCode } from "./error-code";

/**
 * Thrown when a business rule prevents the operation (duplicate, illegal state, etc.).
 *
 * ── HTTP 409 ── B005 ── Conflict ─────────────────────────────────
 *
 * @example
 *   throw new ConflictException("You have already applied to this job");
 *   throw new ConflictException("Cannot withdraw an accepted application", {
 *     currentState: "Accepted",
 *   });
 */
export class ConflictException extends BusinessException {
  public static readonly DEFAULT_MESSAGE = "Conflict";

  constructor(message?: string, details?: Record<string, unknown>) {
    super(ErrorCode.CONFLICT, message ?? ConflictException.DEFAULT_MESSAGE, 409, details);
  }
}
