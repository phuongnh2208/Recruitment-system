/**
 * Custom hook for rejecting a job posting.
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
 * Rejects a job posting with a reason and invalidates the admin
 * dashboard cache.
 *
 * @returns Mutation object with mutate, isLoading, error.
 */
export function useRejectJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      reason,
    }: {
      jobId: string;
      reason: string;
    }) => {
      await adminPendingService.rejectJob(jobId, reason);
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
