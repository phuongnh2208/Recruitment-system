/**
 * Custom hook for fetching applicant detail data.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query
 *   - ✅ Loading / error / retry state management
 *   - ❌ Direct API calls (delegates to employerApplicantService)
 *   - ❌ Business rules
 */

import { useQuery } from "@tanstack/react-query";
import { employerApplicantService } from "../services/employer-applicant.service";
import type { ApplicantDetail } from "../types/applicant-detail.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Fetches the full detail of a specific applicant by application ID.
 *
 * @param applicationId - The application ID to fetch details for.
 * @returns Query result with the applicant detail, loading, error, and retry.
 */
export function useApplicantDetail(applicationId: string) {
  return useQuery<ApplicantDetail>({
    queryKey: queryKeys.employer.applicantDetail.detail(applicationId),
    queryFn: async () => {
      const response =
        await employerApplicantService.getApplicantDetail(applicationId);
      return response;
    },
    enabled: !!applicationId,
  });
}
