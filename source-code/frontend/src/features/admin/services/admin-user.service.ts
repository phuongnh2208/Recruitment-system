/**
 * Admin User Management API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Admin User Management
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
import type {
  PaginatedUserResponse,
  UserListParams,
  UpdateUserStatusInput,
} from "../types/user-management.types";

/**
 * Fetch paginated list of users with filters.
 *
 * Calls GET /admin/users with query parameters.
 *
 * @param params - Pagination and filter parameters.
 * @returns Paginated user response.
 */
async function fetchUsers(
  params: UserListParams,
): Promise<PaginatedUserResponse> {
  const { page, pageSize, filters } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", pageSize.toString());

  if (filters.search) {
    searchParams.set("search", filters.search);
  }
  if (filters.role) {
    searchParams.set("role", filters.role);
  }
  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  const response = await axiosInstance.get<{
    success: true;
    data: PaginatedUserResponse;
  }>(`${ENDPOINTS.ADMIN.USERS}?${searchParams.toString()}`);
  return response.data.data;
}

/**
 * Update user status (enable/disable).
 *
 * Calls PATCH /admin/users/:userId/status.
 *
 * @param input - User ID and new status.
 * @returns Promise that resolves when update is complete.
 */
async function updateUserStatus(input: UpdateUserStatusInput): Promise<void> {
  await axiosInstance.patch(ENDPOINTS.ADMIN.UPDATE_USER_STATUS(input.userId), {
    isActive: input.isActive,
  });
}

/**
 * Admin User Management API service object.
 */
export const adminUserService = {
  getUsers: fetchUsers,
  updateUserStatus,
};
