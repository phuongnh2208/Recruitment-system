import { Request, Response, NextFunction } from "express";
import { BusinessException } from "../exceptions/business-exception";
import { ErrorCode } from "../exceptions/error-code";
import { logger } from "../logger";

/**
 * Express error-handling middleware that catches all thrown exceptions
 * and normalises them into a consistent JSON response structure.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Caught exception types
 * ═══════════════════════════════════════════════════════════════════
 *
 *  - BusinessException (and all subclasses):
 *    ValidationException, AuthenticationException, ForbiddenException,
 *    NotFoundException, ConflictException, InfrastructureException
 *  - Generic Error (unexpected / unhandled errors)
 *  - Unknown runtime errors
 *
 * ═══════════════════════════════════════════════════════════════════
 * Response shape
 * ═══════════════════════════════════════════════════════════════════
 *
 *   {
 *     "success": false,
 *     "error": {
 *       "code": "...",      // Business error code (e.g. "B001")
 *       "message": "...",   // Human-readable description
 *       "details": {}       // Optional structured payload
 *     },
 *     "meta": {
 *       "timestamp": "...", // ISO-8601 timestamp
 *       "requestId": "..."  // Unique correlation id per request
 *     }
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════
 * Usage (register AFTER all routes in main.ts)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import { AllExceptionsFilter } from "./common/filters";
 *   app.use(AllExceptionsFilter);
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export function AllExceptionsFilter(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Determine the error code, HTTP status, message, and details ──
  const { statusCode, code, message, details } = normalizeError(err);

  // ── Extract requestId from pino-http (set via genReqId) ────────
  const requestId: string =
    ((req as unknown as Record<string, unknown>).id as string | undefined) ?? "unknown";

  // ── Log the error with structured JSON ──────────────────────────
  if (statusCode >= 500) {
    // Server errors: log at error level with full stack trace
    logger.error(
      {
        err,
        requestId,
        statusCode,
        errorCode: code,
        method: req.method,
        url: req.url,
      },
      `Unhandled exception: ${message}`,
    );
  } else {
    // Client errors: log at warn level without stack trace
    logger.warn(
      {
        requestId,
        statusCode,
        errorCode: code,
        method: req.method,
        url: req.url,
      },
      `Handled business exception: ${message}`,
    );
  }

  // ── Build the standardised error response ───────────────────────
  const errorResponse = {
    success: false as const,
    error: {
      code,
      message,
      details: details ?? {},
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  res.status(statusCode).json(errorResponse);
}

// ── Internal helpers ─────────────────────────────────────────────────

interface NormalisedError {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly details: Record<string, unknown> | undefined;
}

/**
 * Convert any thrown value into a normalised error structure.
 *
 * - BusinessException subclasses → use their own code / status / message / details
 * - Generic Error                → HTTP 500, B999, generic message
 * - Anything else (unknown)      → HTTP 500, B999, "An unexpected error occurred"
 */
function normalizeError(err: unknown): NormalisedError {
  if (err instanceof BusinessException) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    };
  }

  // Unexpected / unhandled Error instances
  if (err instanceof Error) {
    return {
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "An unexpected error occurred",
      details: undefined,
    };
  }

  // Truly unknown (e.g. thrown string, number, etc.)
  return {
    statusCode: 500,
    code: ErrorCode.INTERNAL_ERROR,
    message: "An unexpected error occurred",
    details: undefined,
  };
}
