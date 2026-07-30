/**
 * Hook for fetching and managing user list with pagination and filters.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER (TanStack Query)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Uses adminUserService for API calls
 *   - ✅ Manages query state, caching, and invalidation
 *   - ✅ Provides pagination and filter state
 *   - ❌ No direct axios calls
 *   - ❌ No business logic beyond query management
 */

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminUserService } from "../services/admin-user.service";
import type {
  UserListParams,
  UserFilters,
  PaginatedUserResponse,
} from "../types/user-management.types";

/** Default page size for user list. */
const DEFAULT_PAGE_SIZE = 10;

/** Hook return type for user management. */
export interface UseUserManagementReturn {
  /** Paginated user data. */
  data: PaginatedUserResponse | undefined;
  /** Whether the query is loading. */
  isLoading: boolean;
  /** Whether the query is fetching next page. */
  isFetching: boolean;
  /** Error if query failed. */
  error: Error | null;
  /** Current page number (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of items. */
  totalItems: number;
  /** Current page size. */
  pageSize: number;
  /** Current filters. */
  filters: UserFilters;
  /** Set current page. */
  setPage: (page: number) => void;
  /** Set page size. */
  setPageSize: (size: number) => void;
  /** Set filters. */
  setFilters: (filters: UserFilters) => void;
  /** Reset filters to default. */
  resetFilters: () => void;
  /** Refetch current data. */
  refetch: () => void;
}

/**
 * Hook for managing user list with pagination and filters.
 *
 * @returns User management state and controls.
 */
export function useUserManagement(): UseUserManagementReturn {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  // Filter state
  const [filters, setFiltersState] = useState<UserFilters>({
    search: "",
    role: "",
    status: "",
  });

  // Build query parameters
  const queryParams: UserListParams = {
    page: currentPage,
    pageSize,
    filters,
  };

  // Fetch users using TanStack Query
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [
      "admin",
      "users",
      "list",
      currentPage,
      pageSize,
      filters.search,
      filters.role,
      filters.status,
    ],
    queryFn: () => adminUserService.getUsers(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Set page with validation
  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  // Set page size and reset to first page
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  // Set filters and reset to first page
  const setFilters = useCallback((newFilters: UserFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1);
  }, []);

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFiltersState({
      search: "",
      role: "",
      status: "",
    });
    setCurrentPage(1);
  }, []);

  return {
    data,
    isLoading,
    isFetching,
    error: error as Error | null,
    currentPage,
    totalPages: data?.totalPages ?? 0,
    totalItems: data?.totalItems ?? 0,
    pageSize,
    filters,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
    refetch,
  };
}
