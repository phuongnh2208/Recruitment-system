/**
 * Withdraw application type definitions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data shapes for withdraw application API
 *   - ❌ No business logic
 *   - ❌ No validation schemas
 */

/**
 * Response from the withdraw application API.
 */
export interface WithdrawApplicationResponse {
  success: boolean;
  data: {
    /** Application ID */
    id: string;
    /** Updated application state */
    state: string;
    /** Withdrawal timestamp */
    withdrawnAt: string;
  };
}
