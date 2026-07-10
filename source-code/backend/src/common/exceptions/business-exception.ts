import { ErrorCode } from "./error-code";

/**
 * Base class for all business exceptions.
 *
 * Every exception carries:
 *  - `code`       → Business error code (e.g. "B001")
 *  - `message`    → Human-readable description
 *  - `statusCode` → HTTP status code
 *  - `details`    → Optional structured payload for additional context
 *
 * ═══════════════════════════════════════════════════════════════════
 * Design rationale
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Global Exception Middleware (TSK-INF-205) only needs to read
 * `exception.statusCode` and `exception.toJSON()` — no if/else chains
 * required.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Usage
 * ═══════════════════════════════════════════════════════════════════
 *
 *   throw new NotFoundException(ErrorCode.RESOURCE_NOT_FOUND, "User not found");
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export class BusinessException extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details: Record<string, unknown> | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Serialise the exception to a plain object consumable by the
   * Global Exception Middleware and ultimately by the API consumer.
   */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
    };
  }
}
