/**
 * Application status update type definitions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data shapes for application status update API
 *   - ❌ No business logic
 *   - ❌ No validation schemas
 */

/**
 * Input for updating application status.
 */
export interface UpdateApplicationStatusInput {
  /** Application status: UNDER_REVIEW, ACCEPTED, or REJECTED */
  status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  /** Reason for rejection (required when status is REJECTED) */
  reason?: string;
}

/**
 * Response from the update application status API.
 */
export interface UpdateApplicationStatusResponse {
  success: boolean;
  data: {
    /** Application ID */
    id: string;
    /** Updated application state */
    state: string;
    /** Rejection reason (if applicable) */
    rejectionReason?: string;
    /** Review timestamp */
    reviewedAt: string;
  };
}
