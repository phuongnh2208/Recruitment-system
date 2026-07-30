/**
 * Employer Applicant Detail feature type definitions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Plain TypeScript interfaces only
 *   - ❌ No business logic
 *   - ❌ No validation rules
 */

/** Student information within the applicant detail. */
export interface StudentInfo {
  fullName: string;
  email: string;
  phone?: string | null;
  university?: string | null;
  major?: string | null;
  graduationYear?: number | null;
}

/** Application status options. */
export type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";

/** Full applicant detail response from the API. */
export interface ApplicantDetail {
  id: string;
  jobTitle: string;
  student: StudentInfo;
  coverLetter?: string | null;
  status: ApplicationStatus;
  appliedDate: string; // ISO string
  cvUrl?: string | null;
}
