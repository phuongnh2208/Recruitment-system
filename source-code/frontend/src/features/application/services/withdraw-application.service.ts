/**
 * Withdraw application API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for withdrawing an application.
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
import type { WithdrawApplicationResponse } from "../types/withdraw-application.types";

/**
 * Withdraw a job application.
 *
 * Calls PATCH /applications/:applicationId/withdraw to withdraw the application.
 *
 * @param applicationId - The application ID to withdraw.
 * @returns The API response confirming the withdrawal.
 */
export async function withdrawApplication(
  applicationId: string,
): Promise<WithdrawApplicationResponse> {
  const response = await axiosInstance.patch<WithdrawApplicationResponse>(
    ENDPOINTS.STUDENT.APPLICATIONS + `/${applicationId}/withdraw`,
  );

  return response.data;
}

/**
 * Withdraw application API service object.
 */
export const withdrawApplicationService = {
  withdrawApplication,
};
