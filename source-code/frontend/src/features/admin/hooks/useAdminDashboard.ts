/**
 * Custom hook for fetching the admin dashboard data.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query
 *   - ✅ Loading / error state management
 *   - ✅ Cache management and refetch
 *   - ❌ Direct API calls (delegates to adminDashboardService)
 *   - ❌ Business rules
 */

import { useQuery } from "@tanstack/react-query";
import { adminDashboardService } from "../services/admin-dashboard.service";
import type { DashboardResponse } from "../types/dashboard.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Fetches the admin dashboard data via TanStack Query.
 *
 * @returns Query result with the dashboard data, loading state, and error.
 */
export function useAdminDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: queryKeys.admin.dashboard.detail,
    queryFn: async () => {
      const response = await adminDashboardService.getDashboard();
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}
