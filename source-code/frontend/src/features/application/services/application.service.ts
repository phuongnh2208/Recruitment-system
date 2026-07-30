/**
 * Application API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Application feature.
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
  ApplyJobInput,
  ApplyJobResponse,
} from "../types/application.types";

/**
 * Submit a job application.
 *
 * Calls POST /applications with the application data.
 *
 * @param data - The application data including jobId, cvId, and optional coverLetter.
 * @returns The API response containing the created application.
 */
export async function applyJob(data: ApplyJobInput): Promise<ApplyJobResponse> {
  const response = await axiosInstance.post<ApplyJobResponse>(
    ENDPOINTS.STUDENT.APPLICATIONS,
    data,
  );

  return response.data;
}

/**
 * Application API service object.
 */
export const applicationService = {
  applyJob,
};
