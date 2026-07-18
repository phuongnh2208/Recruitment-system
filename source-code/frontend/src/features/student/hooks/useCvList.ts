/**
 * Custom hook for fetching and managing the student's CV list.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query
 *   - ✅ Mutation handling (delete, set default)
 *   - ✅ Loading / error state management
 *   - ❌ Direct API calls (delegates to student.service)
 *   - ❌ Business rules
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCvList, deleteCv, setDefaultCv } from "../services/student.service";
import type { CVMetadata } from "../types/cv.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Fetches the student's CV list via TanStack Query.
 *
 * @returns Query result with the CV list, loading state, and error.
 */
export function useCvList() {
  return useQuery<CVMetadata[]>({
    queryKey: queryKeys.student.cv.all,
    queryFn: async () => {
      const response = await getCvList();
      return response.data;
    },
  });
}

/**
 * Provides a mutation to delete a CV.
 * Automatically invalidates the CV list query on success.
 *
 * @returns Mutation object for deleting a CV.
 */
export function useDeleteCv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cvId: string) => {
      await deleteCv(cvId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.student.cv.all });
    },
  });
}

/**
 * Provides a mutation to set a CV as the default CV.
 * Automatically invalidates the CV list query on success.
 *
 * @returns Mutation object for setting a default CV.
 */
export function useSetDefaultCv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cvId: string) => {
      await setDefaultCv(cvId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.student.cv.all });
    },
  });
}
