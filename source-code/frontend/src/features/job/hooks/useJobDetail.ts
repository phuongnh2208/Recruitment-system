/**
 * Custom hook for fetching and managing job detail.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query
 *   - ✅ Loading / error state management
 *   - ❌ Direct API calls (delegates to jobDetailService)
 *   - ❌ Business rules
 */

import { useQuery } from "@tanstack/react-query";
import { jobDetailService } from "../services/job-detail.service";
import { queryKeys } from "../../../core/query/queryKeys";
import type { JobDetailParams } from "../types/job-detail.types";

/**
 * Fetches job detail via TanStack Query.
 *
 * @param params - Job detail parameters including jobId.
 * @returns Query result with the job detail, loading state, and error.
 */
export function useJobDetail(params: JobDetailParams) {
  return useQuery({
    queryKey: queryKeys.job.detail.detail(params.jobId),
    queryFn: async () => {
      const response = await jobDetailService.getJobDetail(params);
      return response;
    },
    enabled: !!params.jobId,
  });
}
