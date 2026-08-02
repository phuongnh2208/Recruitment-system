/**
 * Custom hook for fetching the student's profile.
 *
 * ══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Data fetching via TanStack Query
 *   - ✅ Loading / error state management
 *   - ❌ Direct API calls (delegates to student.service)
 *   - ❌ Business rules
 */
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../services/student.service";
import type { StudentProfile } from "../types/student.types";
import { queryKeys } from "../../../core/query/queryKeys";

/**
 * Fetches the student's profile via TanStack Query.
 *
 * @returns Query result with the profile, loading state, and error.
 */
export function useProfile() {
  return useQuery<{ profile: StudentProfile | null; exists: boolean }>({
    queryKey: queryKeys.student.profile,
    queryFn: async () => {
      const response = await getProfile();
      return response.data;
    },
  });
}
