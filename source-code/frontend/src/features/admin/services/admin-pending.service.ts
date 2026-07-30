/**
 * Admin Pending Approval API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Admin Pending Approval
 * feature. Components and hooks MUST NOT call axios directly — they
 * delegate to this service.
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
import type { PendingApprovalResponse } from "../types/pending.types";

/**
 * Fetch all pending approvals (employers + jobs).
 *
 * Calls GET /admin/dashboard and extracts pending items.
 *
 * @returns The API response containing pending employers and jobs.
 */
async function fetchPendingApprovals(): Promise<PendingApprovalResponse> {
  const response = await axiosInstance.get<PendingApprovalResponse>(
    ENDPOINTS.ADMIN.DASHBOARD,
  );
  return response.data;
}

/**
 * Verify an employer.
 *
 * Calls PATCH /admin/employers/:id/verify.
 *
 * @param employerId - The employer ID to verify.
 */
async function verifyEmployer(employerId: string): Promise<void> {
  await axiosInstance.patch(ENDPOINTS.ADMIN.VERIFY_EMPLOYER(employerId));
}

/**
 * Approve a job posting.
 *
 * Calls PATCH /admin/jobs/:id/approve.
 *
 * @param jobId - The job ID to approve.
 */
async function approveJob(jobId: string): Promise<void> {
  await axiosInstance.patch(ENDPOINTS.ADMIN.APPROVE_JOB(jobId));
}

/**
 * Reject a job posting with a reason.
 *
 * Calls PATCH /admin/jobs/:id/reject.
 *
 * @param jobId - The job ID to reject.
 * @param reason - The rejection reason.
 */
async function rejectJob(jobId: string, reason: string): Promise<void> {
  await axiosInstance.patch(ENDPOINTS.ADMIN.REJECT_JOB(jobId), { reason });
}

/**
 * Admin Pending Approval API service object.
 */
export const adminPendingService = {
  getPendingApprovals: fetchPendingApprovals,
  verifyEmployer,
  approveJob,
  rejectJob,
};
