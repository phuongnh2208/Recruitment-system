/**
 * Business Error Codes
 *
 * Centralised enum for all business error codes used across the system.
 * Each code maps to a specific business rule violation or system error.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Convention
 * ═══════════════════════════════════════════════════════════════════
 *
 *   B001 – B099: Validation errors
 *   B100 – B199: Authentication / Authorization errors
 *   B200 – B299: Resource errors
 *   B300 – B399: Conflict errors
 *   B900 – B999: Infrastructure / System errors
 *
 * ═══════════════════════════════════════════════════════════════════
 * Usage
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import { ErrorCode } from "../common/exceptions/error-code";
 *   throw new ValidationException(ErrorCode.VALIDATION_ERROR);
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export enum ErrorCode {
  // ── Validation (B001 – B099) ──────────────────────────────────
  VALIDATION_ERROR = "B001",

  // ── Authentication / Authorization (B100 – B199) ──────────────
  AUTHENTICATION_FAILED = "B002",
  FORBIDDEN = "B003",

  // ── Resource (B200 – B299) ────────────────────────────────────
  RESOURCE_NOT_FOUND = "B004",

  // ── Conflict (B300 – B399) ────────────────────────────────────
  CONFLICT = "B005",

  // ── Infrastructure / System (B900 – B999) ─────────────────────
  INTERNAL_ERROR = "B999",
}
