/**
 * Job Detail feature type definitions.
 */

import type { JobPosting } from "./job.types";

/** Response from the job detail API. */
export interface JobDetailResponse {
  job: JobPosting & {
    /** Company/employer name. */
    companyName: string;
    /** Company description. */
    companyDescription?: string;
    /** Company website. */
    website?: string;
    /** Company address. */
    companyAddress?: string;
    /** Company logo URL. */
    logoUrl?: string;
    /** Whether the employer is verified. */
    employerVerified: boolean;
  };
}

/** Input parameters for fetching job detail. */
export interface JobDetailParams {
  jobId: string;
}
