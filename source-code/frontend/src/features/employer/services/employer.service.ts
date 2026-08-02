/**
 * Employer API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Employer feature. Components
 * and hooks MUST NOT call axios directly — they delegate to this service.
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
  UpdateCompanyProfileInput,
  UpdateCompanyProfileResponse,
  GetCompanyProfileResponse,
} from "../types/company-profile.types";

/**
 * Update the authenticated employer's company profile.
 *
 * Calls PATCH /employer/company-profile with the provided profile data.
 *
 * @param data - The company profile fields to update.
 * @returns The API response containing success status and profile ID.
 */
export async function updateCompanyProfile(
  data: UpdateCompanyProfileInput,
): Promise<UpdateCompanyProfileResponse> {
  const response = await axiosInstance.patch<UpdateCompanyProfileResponse>(
    ENDPOINTS.EMPLOYER.COMPANY_PROFILE,
    data,
  );
  return response.data;
}

/**
 * Fetch the authenticated employer's company profile.
 *
 * Calls GET /employer/company-profile
 *
 * @returns The API response containing the profile data.
 */
export async function getCompanyProfile(): Promise<GetCompanyProfileResponse> {
  const response = await axiosInstance.get<GetCompanyProfileResponse>(
    ENDPOINTS.EMPLOYER.COMPANY_PROFILE,
  );
  return response.data;
}
