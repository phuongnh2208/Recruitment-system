/**
 * Job Detail API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Job Detail feature.
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
  JobDetailResponse,
  JobDetailParams,
} from "../types/job-detail.types";

/**
 * Fetch job detail by job ID.
 *
 * Calls GET /student/jobs/:jobId with the job ID parameter.
 *
 * @param params - Job detail parameters including jobId.
 * @returns The API response containing the job detail.
 */
async function getJobDetail(
  params: JobDetailParams,
): Promise<JobDetailResponse> {
  const response = await axiosInstance.get<JobDetailResponse>(
    ENDPOINTS.STUDENT.JOB_DETAIL(params.jobId),
  );

  return response.data;
}

/**
 * Job Detail API service object.
 */
export const jobDetailService = {
  getJobDetail,
};
