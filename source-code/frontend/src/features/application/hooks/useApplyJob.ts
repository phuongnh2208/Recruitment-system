/**
 * Custom hook for submitting a job application.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Mutation via TanStack Query
 *   - ✅ Loading / success / error state management
 *   - ✅ Cache invalidation (application history)
 *   - ❌ Direct API calls (delegates to applicationService)
 *   - ❌ Business rules
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyJob } from "../services/application.service";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Options for the apply job mutation.
 */
export interface UseApplyJobOptions {
  /** Job ID to apply for. */
  jobId: string;
  /** Callback on successful application. */
  onSuccess?: () => void;
  /** Callback on error. */
  onError?: (error: Error) => void;
}

/**
 * Result of the apply job mutation.
 */
export interface UseApplyJobResult {
  /** Whether the mutation is in progress. */
  isLoading: boolean;
  /** Error if the mutation failed. */
  error: Error | null;
  /** Function to trigger the application. */
  apply: (cvId: string, coverLetter?: string) => Promise<void>;
}

/**
 * Custom hook for submitting a job application.
 *
 * Handles the mutation to apply for a job, including loading states,
 * error handling, and cache invalidation for application history.
 *
 * @param options - Configuration options including jobId and callbacks.
 * @returns Mutation state and apply function.
 */
export function useApplyJob({
  jobId,
  onSuccess,
  onError,
}: UseApplyJobOptions): UseApplyJobResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { cvId: string; coverLetter?: string }) => {
      return applyJob({
        jobId,
        cvId: data.cvId,
        coverLetter: data.coverLetter,
      });
    },

    onSuccess: () => {
      // Invalidate application history to reflect the new application
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.applicationHistory.all,
      });

      // Invalidate CV list in case it affects default CV selection
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.cv.all,
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
    apply: async (cvId: string, coverLetter?: string) => {
      await mutation.mutateAsync({ cvId, coverLetter });
    },
  };
}
