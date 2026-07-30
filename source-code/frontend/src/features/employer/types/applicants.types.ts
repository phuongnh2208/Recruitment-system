/**
 * Employer Applicants feature type definitions.
 */

/** Single applicant item in the list. */
export interface ApplicantItem {
  id: string;
  applicantName: string;
  jobTitle: string;
  appliedDate: string; // ISO string
  status: "Applied" | "Under Review" | "Accepted" | "Rejected" | "Withdrawn";
}

/** Paginated response from the applicants API. */
export interface ApplicantsResponse {
  items: ApplicantItem[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}

/** Filter parameters for the applicants query. */
export interface ApplicantsFilters {
  search?: string;
  status?: string;
}

/** Query parameters for the applicants API. */
export interface ApplicantsQueryParams {
  page: number;
  size: number;
  search?: string;
  status?: string;
}
