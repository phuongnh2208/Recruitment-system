/**
 * Employer Job Dashboard API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Employer Job Dashboard feature.
 * Components and hooks MUST NOT call axios directly — they delegate
 * to this service.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ API calls only (axios instance + endpoint constants)
 *   - ❌ No business logic
 *   - ❌ No form state management
 *   - ❌ No React hooks
 */

import { axiosInstance } from "../../../core/api/axios";
import { ENDPOINTS } from "../../../core/api/endpoints";
import type {
  EmployerJobsResponse,
  EmployerJobsQueryParams,
} from "../types/employer-job.types";

/**
 * Fetch the employer's job postings with pagination and optional filters.
 *
 * Calls GET /employer/jobs with query parameters.
 *
 * @param params - Query parameters including page, size, search, and state filters.
 * @returns The API response containing the paginated jobs list.
 */
async function fetchEmployerJobs(
  params: EmployerJobsQueryParams,
): Promise<EmployerJobsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(params.page));
  queryParams.set("limit", String(params.size));

  if (params.search) {
    queryParams.set("keyword", params.search);
  }

  if (params.state) {
    queryParams.set("state", params.state);
  }

  // Backend returns { success: true, data: { items, page, size, totalPages, totalItems } }
  const response = await axiosInstance.get<{
    success: true;
    data: EmployerJobsResponse;
  }>(`${ENDPOINTS.EMPLOYER_JOB.LIST}?${queryParams.toString()}`);

  return response.data.data;
}

/**
 * Submit a job posting for admin review.
 *
 * Calls POST /employer/jobs/:jobId/submit
 *
 * @param jobId - The job posting ID to submit.
 * @returns The API response containing success status.
 */
async function submitJobPosting(jobId: string): Promise<{ success: true }> {
  const response = await axiosInstance.post<{ success: true }>(
    ENDPOINTS.EMPLOYER_JOB.SUBMIT(jobId),
  );

  return response.data;
}

/**
 * Close an approved job posting.
 *
 * Calls POST /employer/jobs/:jobId/close
 *
 * @param jobId - The job posting ID to close.
 * @returns The API response containing success status.
 */
async function closeJobPosting(jobId: string): Promise<{ success: true }> {
  const response = await axiosInstance.post<{ success: true }>(
    ENDPOINTS.EMPLOYER_JOB.CLOSE(jobId),
  );

  return response.data;
}

/**
 * Employer Job Dashboard API service object.
 */
export const employerJobService = {
  getEmployerJobs: fetchEmployerJobs,
  submitJobPosting,
  closeJobPosting,
};
