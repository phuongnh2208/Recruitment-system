/**
 * Pending Approval feature type definitions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Pending employer types
 *   - ✅ Pending job types
 *   - ✅ Rejection input types
 *   - ❌ No business logic
 *   - ❌ No API calls
 */

/** A pending employer awaiting verification. */
export interface PendingEmployer {
  id: string;
  companyName: string;
  representativeName: string;
  email: string;
  website?: string | null;
  registeredAt: string; // ISO string
}

/** A pending job posting awaiting approval. */
export interface PendingJob {
  id: string;
  title: string;
  employerName: string;
  employerId: string;
  createdAt: string; // ISO string
  state: "Pending";
}

/** Full response from the pending approval API. */
export interface PendingApprovalResponse {
  pendingEmployers: PendingEmployer[];
  pendingJobs: PendingJob[];
}

/** Input for rejecting a job posting. */
export interface RejectJobInput {
  jobId: string;
  reason: string;
}
