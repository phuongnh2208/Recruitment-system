/**
 * Custom hook for withdrawing a job application.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Mutation via TanStack Query
 *   - ✅ Loading / success / error state management
 *   - ✅ Cache invalidation (application history and application detail)
 *   - ❌ Direct API calls (delegates to withdrawApplicationService)
 *   - ❌ Business rules
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawApplication } from "../services/withdraw-application.service";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Options for the withdraw application mutation.
 */
export interface UseWithdrawApplicationOptions {
  /** Application ID to withdraw. */
  applicationId: string;
  /** Callback on successful withdrawal. */
  onSuccess?: () => void;
  /** Callback on error. */
  onError?: (error: Error) => void;
}

/**
 * Result of the withdraw application mutation.
 */
export interface UseWithdrawApplicationResult {
  /** Whether the mutation is in progress. */
  isLoading: boolean;
  /** Error if the mutation failed. */
  error: Error | null;
  /** Function to trigger the withdrawal. */
  withdraw: () => Promise<void>;
}

/**
 * Custom hook for withdrawing a job application.
 *
 * Handles the mutation to withdraw an application, including loading states,
 * error handling, and cache invalidation for application history and detail.
 *
 * @param options - Configuration options including applicationId and callbacks.
 * @returns Mutation state and withdraw function.
 */
export function useWithdrawApplication({
  applicationId,
  onSuccess,
  onError,
}: UseWithdrawApplicationOptions): UseWithdrawApplicationResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return withdrawApplication(applicationId);
    },

    onSuccess: () => {
      // Invalidate application history to reflect the withdrawal
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.applicationHistory.all,
      });

      // Invalidate application detail if it exists
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.application.all,
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
    withdraw: async () => {
      await mutation.mutateAsync();
    },
  };
}
