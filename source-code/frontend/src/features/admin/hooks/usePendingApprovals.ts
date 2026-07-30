/**
 * Custom hook for fetching pending approvals data.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query
 *   - ✅ Loading / error state management
 *   - ✅ Cache management and refetch
 *   - ❌ Direct API calls (delegates to adminPendingService)
 *   - ❌ Business rules
 */

import { useQuery } from "@tanstack/react-query";
import { adminPendingService } from "../services/admin-pending.service";
import type { PendingApprovalResponse } from "../types/pending.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Fetches pending approvals (employers + jobs) via TanStack Query.
 *
 * @returns Query result with the pending data, loading state, and error.
 */
export function usePendingApprovals() {
  return useQuery<PendingApprovalResponse>({
    queryKey: queryKeys.admin.pendingApprovals.detail,
    queryFn: async () => {
      const response = await adminPendingService.getPendingApprovals();
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}
