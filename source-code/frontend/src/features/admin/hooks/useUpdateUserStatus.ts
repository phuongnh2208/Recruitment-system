/**
 * Hook for updating user status (enable/disable).
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER (TanStack Query Mutation)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Uses adminUserService for API calls
 *   - ✅ Manages mutation state and cache invalidation
 *   - ✅ Invalidates user list query on success
 *   - ❌ No direct axios calls
 *   - ❌ No business logic beyond mutation management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUserService } from "../services/admin-user.service";
import type { UpdateUserStatusInput } from "../types/user-management.types";

/** Hook return type for update user status mutation. */
export interface UseUpdateUserStatusReturn {
  /** Mutation function to update user status. */
  mutate: (input: UpdateUserStatusInput) => void;
  /** Mutation function with async/await support. */
  mutateAsync: (input: UpdateUserStatusInput) => Promise<void>;
  /** Whether the mutation is in progress. */
  isPending: boolean;
  /** Whether the mutation is in a success state. */
  isSuccess: boolean;
  /** Whether the mutation is in an error state. */
  isError: boolean;
  /** Error if mutation failed. */
  error: Error | null;
  /** Reset mutation state. */
  reset: () => void;
}

/**
 * Hook for updating user status (enable/disable).
 *
 * @returns Mutation state and controls.
 */
export function useUpdateUserStatus(): UseUpdateUserStatusReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: UpdateUserStatusInput) =>
      adminUserService.updateUserStatus(input),
    onSuccess: () => {
      // Invalidate user list query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "list"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
