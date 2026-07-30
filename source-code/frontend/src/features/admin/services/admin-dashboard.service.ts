/**
 * Admin Dashboard API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Admin Dashboard feature.
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
import type { DashboardResponse } from "../types/dashboard.types";

/**
 * Fetch the admin dashboard data including statistics, pending employers,
 * and pending jobs.
 *
 * Calls GET /admin/dashboard.
 *
 * @returns The API response containing dashboard stats and pending items.
 */
async function fetchDashboard(): Promise<DashboardResponse> {
  const response = await axiosInstance.get<DashboardResponse>(
    ENDPOINTS.ADMIN.DASHBOARD,
  );
  return response.data;
}

/**
 * Admin Dashboard API service object.
 */
export const adminDashboardService = {
  getDashboard: fetchDashboard,
};
