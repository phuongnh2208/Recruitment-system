/**
 * Job API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Job feature. Components
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
  CreateJobPostingInput,
  UpdateJobPostingInput,
  JobPostingResponse,
} from "../types/job.types";

/**
 * Create a new job posting in DRAFT state.
 *
 * Calls POST /jobs with the provided job data.
 *
 * @param data - The job posting fields to create.
 * @returns The API response containing success status and job posting ID.
 */
export async function createJobPosting(
  data: CreateJobPostingInput,
): Promise<JobPostingResponse> {
  const response = await axiosInstance.post<JobPostingResponse>(
    ENDPOINTS.JOB.CREATE,
    data,
  );
  return response.data;
}

/**
 * Update an existing job posting.
 *
 * Calls PATCH /jobs/:jobId with the provided job data.
 *
 * @param data - The job posting fields to update, including the jobPostingId.
 * @returns The API response containing success status and job posting ID.
 */
export async function updateJobPosting(
  data: UpdateJobPostingInput,
): Promise<JobPostingResponse> {
  const response = await axiosInstance.patch<JobPostingResponse>(
    ENDPOINTS.JOB.UPDATE(data.jobPostingId),
    data,
  );
  return response.data;
}
