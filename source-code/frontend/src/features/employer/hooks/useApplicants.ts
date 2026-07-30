/**
 * Custom hook for fetching and managing the employer's applicants list.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query with pagination
 *   - ✅ Loading / error state management
 *   - ✅ Search and filter state management
 *   - ❌ Direct API calls (delegates to applicantsService)
 *   - ❌ Business rules
 */

import { useQuery } from "@tanstack/react-query";
import { applicantsService } from "../services/applicants.service";
import type {
  ApplicantsResponse,
  ApplicantsFilters,
} from "../types/applicants.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Default page size for applicants pagination.
 */
export const APPLICANTS_PAGE_SIZE = 10;

/**
 * Fetches the employer's applicants via TanStack Query with pagination and filters.
 *
 * @param page - 1-based page number (default: 1)
 * @param size - Number of items per page (default: APPLICANTS_PAGE_SIZE)
 * @param filters - Optional search and status filters
 * @returns Query result with the applicants list, loading state, and error.
 */
export function useApplicants(
  page: number = 1,
  size: number = APPLICANTS_PAGE_SIZE,
  filters: ApplicantsFilters = {},
) {
  return useQuery<ApplicantsResponse>({
    queryKey: queryKeys.employer.applicants.list(
      page,
      size,
      filters.search,
      filters.status,
    ),
    queryFn: async () => {
      const response = await applicantsService.getApplicants({
        page,
        size,
        search: filters.search,
        status: filters.status,
      });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}
