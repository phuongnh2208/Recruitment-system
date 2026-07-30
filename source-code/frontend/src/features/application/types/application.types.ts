/**
 * Application feature type definitions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data shapes for Application entities and API payloads
 *   - ❌ No business logic
 *   - ❌ No validation schemas
 */

/** Input for applying to a job. */
export interface ApplyJobInput {
  /** Job ID to apply for. */
  jobId: string;
  /** Selected CV ID. */
  cvId: string;
  /** Optional cover letter. */
  coverLetter?: string;
}

/** Response from the apply job API. */
export interface ApplyJobResponse {
  success: boolean;
  data: {
    /** Application ID. */
    id: string;
    /** Job ID. */
    jobId: string;
    /** Student ID. */
    studentId: string;
    /** CV ID used. */
    cvId: string;
    /** Cover letter. */
    coverLetter?: string;
    /** Application state. */
    state: string;
    /** Applied timestamp. */
    appliedAt: string;
  };
}

/** Application summary for history list. */
export interface ApplicationSummary {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  cvId: string;
  cvFileName: string;
  coverLetter?: string;
  state: string;
  appliedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}
