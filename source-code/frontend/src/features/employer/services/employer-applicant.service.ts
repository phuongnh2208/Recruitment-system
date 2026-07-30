/**
 * Employer Applicant Detail API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Employer Applicant Detail feature.
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
import type { ApplicantDetail } from "../types/applicant-detail.types";

/**
 * Fetch the full detail of a specific applicant by application ID.
 *
 * Calls GET /employer/applicants/:applicationId.
 *
 * @param applicationId - The ID of the application to fetch details for.
 * @returns The API response containing the applicant detail.
 */
async function fetchApplicantDetail(
  applicationId: string,
): Promise<ApplicantDetail> {
  const response = await axiosInstance.get<ApplicantDetail>(
    ENDPOINTS.EMPLOYER.APPLICANT_DETAIL(applicationId),
  );

  return response.data;
}

/**
 * Employer Applicant Detail API service object.
 */
export const employerApplicantService = {
  getApplicantDetail: fetchApplicantDetail,
};
