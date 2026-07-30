/**
 * Application status update API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for updating application status.
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
  UpdateApplicationStatusInput,
  UpdateApplicationStatusResponse,
} from "../types/application-status.types";

/**
 * Update application status (Review, Accept, or Reject).
 *
 * Calls PATCH /employer/applicants/:applicationId/status with the status update data.
 *
 * @param applicationId - The application ID to update.
 * @param data - The status update data including status and optional reason.
 * @returns The API response containing the updated application.
 */
export async function updateApplicationStatus(
  applicationId: string,
  data: UpdateApplicationStatusInput,
): Promise<UpdateApplicationStatusResponse> {
  const response = await axiosInstance.patch<UpdateApplicationStatusResponse>(
    ENDPOINTS.EMPLOYER.APPLICANT_DETAIL(applicationId) + "/status",
    data,
  );

  return response.data;
}

/**
 * Application status update API service object.
 */
export const applicationStatusService = {
  updateApplicationStatus,
};
