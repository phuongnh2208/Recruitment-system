/**
 * Job Search API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Job Search feature.
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
  JobSearchResponse,
  JobSearchQueryParams,
} from "../types/job-search.types";

/**
 * Search for approved job postings with pagination and filters.
 *
 * Calls GET /jobs/search with query parameters.
 *
 * @param params - Query parameters including page, size, search, location, and salary filters.
 * @returns The API response containing the paginated search results.
 */
async function searchJobs(
  params: JobSearchQueryParams,
): Promise<JobSearchResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(params.page));
  queryParams.set("limit", String(params.size));

  if (params.search) {
    queryParams.set("keyword", params.search);
  }

  if (params.location) {
    queryParams.set("location", params.location);
  }

  if (params.salaryMin !== undefined && params.salaryMin !== null) {
    queryParams.set("salaryMin", String(params.salaryMin));
  }

  if (params.salaryMax !== undefined && params.salaryMax !== null) {
    queryParams.set("salaryMax", String(params.salaryMax));
  }

  // Backend returns { success: true, data: { items, page, size, totalPages, totalItems } }
  const response = await axiosInstance.get<{
    success: true;
    data: JobSearchResponse;
  }>(`${ENDPOINTS.STUDENT.JOBS}?${queryParams.toString()}`);

  return response.data.data;
}

/**
 * Job Search API service object.
 */
export const jobSearchService = {
  searchJobs,
};
