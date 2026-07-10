import { BusinessException } from "./business-exception";
import { ErrorCode } from "./error-code";

/**
 * Thrown when a requested resource does not exist.
 *
 * ── HTTP 404 ── B004 ── Resource Not Found ───────────────────────
 *
 * @example
 *   throw new NotFoundException("Job posting not found");
 *   throw new NotFoundException("User", { userId: "abc-123" });
 */
export class NotFoundException extends BusinessException {
  public static readonly DEFAULT_MESSAGE = "Resource not found";

  constructor(message?: string, details?: Record<string, unknown>) {
    super(ErrorCode.RESOURCE_NOT_FOUND, message ?? NotFoundException.DEFAULT_MESSAGE, 404, details);
  }
}
