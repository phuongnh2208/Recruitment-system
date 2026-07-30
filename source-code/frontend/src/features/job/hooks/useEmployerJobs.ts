/**
 * Custom hook for fetching and managing the employer's job postings list.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query with pagination
 *   - ✅ Loading / error state management
 *   - ✅ Search and filter state management
 *   - ❌ Direct API calls (delegates to employerJobService)
 *   - ❌ Business rules
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employerJobService } from "../services/employer-job.service";
import type {
  EmployerJobsResponse,
  EmployerJobsFilters,
} from "../types/employer-job.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Default page size for employer jobs pagination.
 */
export const EMPLOYER_JOBS_PAGE_SIZE = 10;

/**
 * Fetches the employer's job postings via TanStack Query with pagination and filters.
 *
 * @param page - 1-based page number (default: 1)
 * @param size - Number of items per page (default: EMPLOYER_JOBS_PAGE_SIZE)
 * @param filters - Optional search and state filters
 * @returns Query result with the jobs list, loading state, and error.
 */
export function useEmployerJobs(
  page: number = 1,
  size: number = EMPLOYER_JOBS_PAGE_SIZE,
  filters: EmployerJobsFilters = {},
) {
  return useQuery<EmployerJobsResponse>({
    queryKey: queryKeys.employerJob.list(
      page,
      size,
      filters.search,
      filters.state,
    ),
    queryFn: async () => {
      const response = await employerJobService.getEmployerJobs({
        page,
        size,
        search: filters.search,
        state: filters.state,
      });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Mutation for submitting a job posting for admin review.
 */
export function useSubmitJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => employerJobService.submitJobPosting(jobId),
    onSuccess: () => {
      // Invalidate and refetch the jobs list
      queryClient.invalidateQueries({ queryKey: queryKeys.employerJob.all });
    },
  });
}

/**
 * Mutation for closing an approved job posting.
 */
export function useCloseJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => employerJobService.closeJobPosting(jobId),
    onSuccess: () => {
      // Invalidate and refetch the jobs list
      queryClient.invalidateQueries({ queryKey: queryKeys.employerJob.all });
    },
  });
}
