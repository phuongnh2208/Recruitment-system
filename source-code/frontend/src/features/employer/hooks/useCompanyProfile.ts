/**
 * Custom hook for fetching the employer's company profile.
 *
 * ══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query
 *   - ✅ Loading / error state management
 *   - ❌ Direct API calls (delegates to employer.service)
 *   - ❌ Business rules
 */
import { useQuery } from "@tanstack/react-query";
import { getCompanyProfile } from "../services/employer.service";
import type { EmployerProfile } from "../types/company-profile.types";

/**
 * Fetches the employer's company profile via TanStack Query.
 *
 * @returns Query result with the profile, loading state, and error.
 */
export function useCompanyProfile() {
  return useQuery<{ profile: EmployerProfile | null; exists: boolean }>({
    queryKey: ["employer", "company-profile"],
    queryFn: async () => {
      const response = await getCompanyProfile();
      return response.data;
    },
  });
}
