/**
 * User Management Page – implements TSK-FE-AD-203.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGE COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays user list with pagination and filters
 *   - ✅ Search, Role filter, Status filter
 *   - ✅ Table view (desktop) and Card view (mobile)
 *   - ✅ Loading skeleton state
 *   - ✅ Empty state
 *   - ✅ Error state with retry button
 *   - ✅ Status change dialog (enable/disable)
 *   - ✅ Responsive layout (Desktop, Tablet, Mobile)
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */

import { useState, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUserManagement } from "../hooks/useUserManagement";
import { useUpdateUserStatus } from "../hooks/useUpdateUserStatus";
import UserTable from "./UserTable";
import UserCard from "./UserCard";
import UserSkeleton from "./UserSkeleton";
import UserEmptyState from "./UserEmptyState";
import type {
  User,
  UserRole,
  UserStatus,
} from "../types/user-management.types";

export default function UserManagementPage() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    filters,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
    refetch,
  } = useUserManagement();

  const { mutate: updateUserStatus, isPending: isStatusChanging } =
    useUpdateUserStatus();

  const [showFilters, setShowFilters] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.search || filters.role || filters.status,
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters({ ...filters, search: value });
    },
    [filters, setFilters],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      setFilters({ ...filters, role: value as UserRole | "" });
    },
    [filters, setFilters],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setFilters({ ...filters, status: value as UserStatus | "" });
    },
    [filters, setFilters],
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleStatusChangeRequest = useCallback(
    (user: User) => {
      updateUserStatus({
        userId: user.id,
        isActive: user.status !== "ACTIVE",
      });
    },
    [updateUserStatus],
  );

  const users = data?.users ?? [];

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Quản lý người dùng
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Quản lý tài khoản người dùng trong hệ thống.
          </p>
        </div>

        {/* Error state with retry */}
        {error && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ??
                "Không thể tải danh sách người dùng."}
            </p>
            <button
              onClick={handleRetry}
              className="mt-2 rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition hover:bg-danger/10"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Filters section */}
        <section className="mb-6" aria-label="Bộ lọc người dùng">
          <div className="rounded-card bg-white p-4 shadow-card border border-ink/10">
            {/* Search and filter toggles */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Tìm kiếm theo tên, email..."
                  className="w-full rounded-seal border border-ink/15 bg-white px-10 py-2 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  aria-label="Tìm kiếm người dùng"
                />
              </div>

              {/* Filter controls */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* Role filter */}
                <div className="relative">
                  <FunnelIcon
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40"
                    aria-hidden="true"
                  />
                  <select
                    value={filters.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="appearance-none rounded-seal border border-ink/15 bg-white px-10 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    aria-label="Lọc theo vai trò"
                  >
                    <option value="">Tất cả vai trò</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="EMPLOYER">Nhà tuyển dụng</option>
                    <option value="STUDENT">Sinh viên</option>
                  </select>
                </div>

                {/* Status filter */}
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="appearance-none rounded-seal border border-ink/15 bg-white px-10 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    aria-label="Lọc theo trạng thái"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="DISABLED">Đã vô hiệu hóa</option>
                  </select>
                </div>

                {/* Clear filters button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex items-center gap-1.5 rounded-seal px-4 py-2 font-body text-sm text-ink/60 transition hover:text-ink/90 hover:bg-sage/50"
                    aria-label="Xóa bộ lọc"
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                    Xóa lọc
                  </button>
                )}

                {/* Mobile filter toggle */}
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-1.5 rounded-seal px-4 py-2 font-body text-sm text-ink/60 transition hover:text-ink/90 hover:bg-sage/50"
                  aria-expanded={showFilters}
                  aria-controls="mobile-filters"
                >
                  <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                  Bộ lọc
                </button>
              </div>
            </div>

            {/* Mobile filter panel */}
            {showFilters && (
              <div
                id="mobile-filters"
                className="mt-4 space-y-3 md:hidden animate-slide-down"
              >
                <div className="relative">
                  <FunnelIcon
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40"
                    aria-hidden="true"
                  />
                  <select
                    value={filters.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="appearance-none w-full rounded-seal border border-ink/15 bg-white px-10 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    aria-label="Lọc theo vai trò"
                  >
                    <option value="">Tất cả vai trò</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="EMPLOYER">Nhà tuyển dụng</option>
                    <option value="STUDENT">Sinh viên</option>
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="appearance-none w-full rounded-seal border border-ink/15 bg-white px-10 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    aria-label="Lọc theo trạng thái"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="DISABLED">Đã vô hiệu hóa</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-1.5 rounded-seal px-4 py-2 font-body text-sm text-ink/60 transition hover:text-ink/90 hover:bg-sage/50"
                >
                  <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  Xóa lọc
                </button>
              </div>
            )}
          </div>
        </section>

        {/* User list */}
        <section aria-label="Danh sách người dùng">
          {/* Loading state */}
          {isLoading && <UserSkeleton count={pageSize} />}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {users.length > 0 ? (
                <>
                  {/* Desktop table view */}
                  <div className="hidden md:block">
                    <UserTable
                      users={users}
                      onStatusChange={handleStatusChangeRequest}
                      isStatusChanging={isStatusChanging}
                    />
                  </div>

                  {/* Mobile card view */}
                  <div className="md:hidden space-y-4">
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onStatusChange={handleStatusChangeRequest}
                        isStatusChanging={isStatusChanging}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav
                      className="mt-6 flex items-center justify-between"
                      aria-label="Phân trang"
                    >
                      <div className="font-body text-sm text-ink/60">
                        Hiển thị{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * pageSize + 1}
                        </span>
                        –{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * pageSize, totalItems)}
                        </span>{" "}
                        của <span className="font-medium">{totalItems}</span>{" "}
                        kết quả
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(currentPage - 1)}
                          disabled={currentPage === 1 || isFetching}
                          className="rounded-seal border border-ink/15 px-3 py-1.5 font-body text-sm text-ink/70 transition hover:bg-sage/50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Trang trước"
                        >
                          Trước
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum: number;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  disabled={isFetching}
                                  className={`rounded-seal px-3 py-1.5 font-body text-sm transition ${
                                    pageNum === currentPage
                                      ? "bg-primary text-white"
                                      : "text-ink/70 hover:bg-sage/50"
                                  } disabled:cursor-not-allowed disabled:opacity-50`}
                                  aria-label={`Trang ${pageNum}`}
                                  aria-current={
                                    pageNum === currentPage ? "page" : undefined
                                  }
                                >
                                  {pageNum}
                                </button>
                              );
                            },
                          )}
                        </div>
                        <button
                          onClick={() => setPage(currentPage + 1)}
                          disabled={currentPage === totalPages || isFetching}
                          className="rounded-seal border border-ink/15 px-3 py-1.5 font-body text-sm text-ink/70 transition hover:bg-sage/50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Trang sau"
                        >
                          Sau
                        </button>
                      </div>
                    </nav>
                  )}

                  {/* Page size selector */}
                  <div className="mt-4 flex items-center justify-end gap-2 md:justify-start">
                    <label className="font-body text-sm text-ink/60">
                      Hiển thị:
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="ml-2 rounded-seal border border-ink/15 bg-white px-3 py-1.5 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        aria-label="Số mục mỗi trang"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </label>
                  </div>
                </>
              ) : (
                <UserEmptyState
                  hasFilters={hasActiveFilters}
                  onResetFilters={handleClearFilters}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
