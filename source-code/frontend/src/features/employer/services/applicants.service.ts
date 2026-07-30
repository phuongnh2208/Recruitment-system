/**
 * Employer Applicants API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Employer Applicants feature.
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
  ApplicantsResponse,
  ApplicantsQueryParams,
} from "../types/applicants.types";

/**
 * Fetch the employer's applicants with pagination and optional filters.
 *
 * Calls GET /employer/applicants with query parameters.
 *
 * @param params - Query parameters including page, size, search, and status filters.
 * @returns The API response containing the paginated applicants list.
 */
async function fetchApplicants(
  params: ApplicantsQueryParams,
): Promise<ApplicantsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(params.page));
  queryParams.set("size", String(params.size));

  if (params.search) {
    queryParams.set("search", params.search);
  }

  if (params.status) {
    queryParams.set("status", params.status);
  }

  const response = await axiosInstance.get<ApplicantsResponse>(
    `${ENDPOINTS.EMPLOYER.APPLICANTS}?${queryParams.toString()}`,
  );

  return response.data;
}

/**
 * Employer Applicants API service object.
 */
export const applicantsService = {
  getApplicants: fetchApplicants,
};
