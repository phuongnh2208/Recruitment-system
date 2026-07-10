import { BusinessException } from "./business-exception";
import { ErrorCode } from "./error-code";

/**
 * Thrown when authentication fails (missing / invalid credentials).
 *
 * ── HTTP 401 ── B002 ── Authentication Failed ────────────────────
 *
 * @example
 *   throw new AuthenticationException("Invalid email or password");
 */
export class AuthenticationException extends BusinessException {
  public static readonly DEFAULT_MESSAGE = "Authentication failed";

  constructor(message?: string, details?: Record<string, unknown>) {
    super(
      ErrorCode.AUTHENTICATION_FAILED,
      message ?? AuthenticationException.DEFAULT_MESSAGE,
      401,
      details,
    );
  }
}
