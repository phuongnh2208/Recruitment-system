/**
 * Custom hook for fetching and managing job search results.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query with pagination
 *   - ✅ Loading / error state management
 *   - ✅ Search and filter state management
 *   - ❌ Direct API calls (delegates to jobSearchService)
 *   - ❌ Business rules
 */

import { useQuery } from "@tanstack/react-query";
import { jobSearchService } from "../services/job-search.service";
import type { JobSearchFilters } from "../types/job-search.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Default page size for job search pagination.
 */
export const JOB_SEARCH_PAGE_SIZE = 10;

/**
 * Fetches job search results via TanStack Query with pagination and filters.
 *
 * @param page - 1-based page number (default: 1)
 * @param size - Number of items per page (default: JOB_SEARCH_PAGE_SIZE)
 * @param filters - Optional search and filter parameters
 * @returns Query result with the jobs list, loading state, and error.
 */
export function useJobSearch(
  page: number = 1,
  size: number = JOB_SEARCH_PAGE_SIZE,
  filters: JobSearchFilters = {},
) {
  return useQuery({
    queryKey: queryKeys.job.search.list(
      page,
      size,
      filters.search,
      filters.location,
      filters.salaryMin,
      filters.salaryMax,
    ),
    queryFn: async () => {
      const response = await jobSearchService.searchJobs({
        page,
        size,
        search: filters.search,
        location: filters.location,
        salaryMin: filters.salaryMin,
        salaryMax: filters.salaryMax,
      });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}
