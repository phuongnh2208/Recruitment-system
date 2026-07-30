/**
 * Custom hook for verifying an employer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Mutation via TanStack Query
 *   - ✅ Cache invalidation on success
 *   - ❌ Direct API calls (delegates to adminPendingService)
 *   - ❌ Business rules
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPendingService } from "../services/admin-pending.service";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Verifies an employer and invalidates the admin dashboard cache.
 *
 * @returns Mutation object with mutate, isLoading, error.
 */
export function useApproveEmployer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employerId: string) => {
      await adminPendingService.verifyEmployer(employerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.dashboard.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.pendingApprovals.all,
      });
    },
  });
}
