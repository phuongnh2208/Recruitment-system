/**
 * Job Search feature type definitions.
 */

import type { JobPosting } from "./job.types";

/** Single job posting item in search results. */
export interface JobSearchItem extends Omit<JobPosting, "employerId"> {
  /** Company/employer name. */
  companyName: string;
}

/** Paginated response from the job search API. */
export interface JobSearchResponse {
  items: JobSearchItem[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}

/** Filter parameters for job search. */
export interface JobSearchFilters {
  search?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
}

/** Query parameters for the job search API. */
export interface JobSearchQueryParams {
  page: number;
  size: number;
  search?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
}
