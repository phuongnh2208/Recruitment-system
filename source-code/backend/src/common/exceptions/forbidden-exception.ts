import { BusinessException } from "./business-exception";
import { ErrorCode } from "./error-code";

/**
 * Thrown when the authenticated user lacks the required role / permission.
 *
 * ── HTTP 403 ── B003 ── Forbidden ────────────────────────────────
 *
 * @example
 *   throw new ForbiddenException("Only employers can perform this action");
 */
export class ForbiddenException extends BusinessException {
  public static readonly DEFAULT_MESSAGE = "Forbidden";

  constructor(message?: string, details?: Record<string, unknown>) {
    super(ErrorCode.FORBIDDEN, message ?? ForbiddenException.DEFAULT_MESSAGE, 403, details);
  }
}
