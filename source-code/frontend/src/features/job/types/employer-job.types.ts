/**
 * Employer Job Dashboard feature type definitions.
 */

/** Single job posting item in the employer's dashboard. */
export interface EmployerJobItem {
  id: string;
  title: string;
  description: string;
  location: string;
  state: JobState;
  expiresAt: string;
  createdAt: string;
  applicantCount: number;
}

/** Job state enum matching backend. */
export type JobState =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Closed"
  | "Expired";

/** Paginated response from the employer jobs API. */
export interface EmployerJobsResponse {
  items: EmployerJobItem[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}

/** Filter parameters for the employer jobs query. */
export interface EmployerJobsFilters {
  search?: string;
  state?: JobState | "";
}

/** Query parameters for the employer jobs API. */
export interface EmployerJobsQueryParams {
  page: number;
  size: number;
  search?: string;
  state?: JobState | "";
}
