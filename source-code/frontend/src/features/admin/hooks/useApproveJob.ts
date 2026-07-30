/**
 * Custom hook for approving a job posting.
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
 * Approves a job posting and invalidates the admin dashboard cache.
 *
 * @returns Mutation object with mutate, isLoading, error.
 */
export function useApproveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      await adminPendingService.approveJob(jobId);
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
