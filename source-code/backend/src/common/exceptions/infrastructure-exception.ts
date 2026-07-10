import { BusinessException } from "./business-exception";
import { ErrorCode } from "./error-code";

/**
 * Thrown when an infrastructure / system-level error occurs
 * (database connection failure, file I/O error, external service unavailable, etc.).
 *
 * ── HTTP 500 ── B999 ── Internal Error ───────────────────────────
 *
 * @example
 *   throw new InfrastructureException("Database connection failed");
 *   throw new InfrastructureException("Failed to upload file", {
 *     path: "/uploads/cv/abc.pdf",
 *   });
 */
export class InfrastructureException extends BusinessException {
  public static readonly DEFAULT_MESSAGE = "Internal server error";

  constructor(message?: string, details?: Record<string, unknown>) {
    super(
      ErrorCode.INTERNAL_ERROR,
      message ?? InfrastructureException.DEFAULT_MESSAGE,
      500,
      details,
    );
  }
}
