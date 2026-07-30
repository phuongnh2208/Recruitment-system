/**
 * Job feature type definitions.
 */

/** Job posting data matching the backend JobPosting entity. */
export interface JobPosting {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  state: JobState;
  expiresAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Job state enum matching backend. */
export type JobState =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Closed"
  | "Expired";

/** Input for creating a new job posting. */
export interface CreateJobPostingInput {
  title: string;
  description: string;
  requirements: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  expiresAt: Date | string;
}

/** Input for updating an existing job posting. */
export interface UpdateJobPostingInput {
  jobPostingId: string;
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  expiresAt?: Date | string;
}

/** Response from create/update job posting API. */
export interface JobPostingResponse {
  success: true;
  jobPostingId: string;
}
