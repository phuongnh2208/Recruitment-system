/**
 * Custom hook for updating application status.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Mutation via TanStack Query
 *   - ✅ Loading / success / error state management
 *   - ✅ Cache invalidation (applicant detail and list)
 *   - ❌ Direct API calls (delegates to applicationStatusService)
 *   - ❌ Business rules
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateApplicationStatus } from "../services/application-status.service";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Options for the update application status mutation.
 */
export interface UseApplicationStatusOptions {
  /** Application ID to update. */
  applicationId: string;
  /** Callback on successful status update. */
  onSuccess?: () => void;
  /** Callback on error. */
  onError?: (error: Error) => void;
}

/**
 * Result of the update application status mutation.
 */
export interface UseApplicationStatusResult {
  /** Whether the mutation is in progress. */
  isLoading: boolean;
  /** Error if the mutation failed. */
  error: Error | null;
  /** Function to trigger the status update. */
  updateStatus: (
    status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED",
    reason?: string,
  ) => Promise<void>;
}

/**
 * Custom hook for updating application status.
 *
 * Handles the mutation to update application status, including loading states,
 * error handling, and cache invalidation for applicant detail and list.
 *
 * @param options - Configuration options including applicationId and callbacks.
 * @returns Mutation state and updateStatus function.
 */
export function useApplicationStatus({
  applicationId,
  onSuccess,
  onError,
}: UseApplicationStatusOptions): UseApplicationStatusResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: {
      status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
      reason?: string;
    }) => {
      return updateApplicationStatus(applicationId, data);
    },

    onSuccess: () => {
      // Invalidate applicant detail to reflect the updated status
      queryClient.invalidateQueries({
        queryKey: queryKeys.employer.applicantDetail.detail(applicationId),
      });

      // Invalidate applicants list to reflect the updated status
      queryClient.invalidateQueries({
        queryKey: queryKeys.employer.applicants.all,
      });

      onSuccess?.();
    },

    onError: (error: Error) => {
      onError?.(error);
    },
  });

  return {
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    updateStatus: async (
      status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED",
      reason?: string,
    ) => {
      await mutation.mutateAsync({ status, reason });
    },
  };
}
