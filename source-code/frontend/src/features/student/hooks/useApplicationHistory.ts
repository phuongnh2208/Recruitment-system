/**
 * Custom hook for fetching and managing the student's application history.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query with pagination
 *   - ✅ Loading / error state management
 *   - ❌ Direct API calls (delegates to applicationHistoryService)
 *   - ❌ Business rules
 */
import { useQuery } from "@tanstack/react-query";
import { applicationHistoryService } from "../services/application-history.service";
import type { ApplicationHistoryResponse } from "../types/application-history.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Default page size for application history pagination.
 */
export const APPLICATION_HISTORY_PAGE_SIZE = 10;

/**
 * Fetches the student's application history via TanStack Query with pagination.
 *
 * @param page - 1-based page number (default: 1)
 * @param size - Number of items per page (default: APPLICATION_HISTORY_PAGE_SIZE)
 * @returns Query result with the application history, loading state, and error.
 */
export function useApplicationHistory(
  page: number = 1,
  size: number = APPLICATION_HISTORY_PAGE_SIZE,
) {
  return useQuery<ApplicationHistoryResponse>({
    queryKey: queryKeys.student.applicationHistory.list(page, size),
    queryFn: async () => {
      const response = await applicationHistoryService.getHistory(page, size);
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}
