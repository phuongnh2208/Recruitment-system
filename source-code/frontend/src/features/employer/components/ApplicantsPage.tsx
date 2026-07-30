/**
 * Employer Applicants Management Page – implements TSK-FE-EM-202.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGE COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays applicants list with search and status filter
 *   - ✅ Server-side pagination using TanStack Query
 *   - ✅ Loading skeleton state
 *   - ✅ Empty state
 *   - ✅ Error state with retry button
 *   - ✅ Status badges following design.md
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */

import { useState } from "react";
import { useApplicants, APPLICANTS_PAGE_SIZE } from "../hooks/useApplicants";
import ApplicantRow from "./ApplicantRow";
import ApplicantsEmptyState from "./ApplicantsEmptyState";
import ApplicantsSkeleton from "./ApplicantsSkeleton";
import ApplicantsPagination from "./ApplicantsPagination";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Applied", label: "Đã nộp" },
  { value: "Under Review", label: "Đang xem xét" },
  { value: "Accepted", label: "Đã chấp nhận" },
  { value: "Rejected", label: "Đã từ chối" },
  { value: "Withdrawn", label: "Đã rút" },
];

export default function ApplicantsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const {
    data: applicantsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApplicants(currentPage, APPLICANTS_PAGE_SIZE, { search, status });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Quản lý ứng viên
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Xem và quản lý hồ sơ ứng viên đã nộp vào tin tuyển dụng của bạn.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Tìm kiếm ứng viên
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                id="search"
                type="search"
                placeholder="Tìm kiếm theo tên ứng viên hoặc vị trí..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white pl-10 pr-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="sm:w-48">
            <label htmlFor="status" className="sr-only">
              Lọc theo trạng thái
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error state with retry */}
        {isError && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ?? "Không thể tải danh sách ứng viên."}
            </p>
            <button
              onClick={handleRetry}
              className="mt-2 rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition hover:bg-danger/10"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && <ApplicantsSkeleton />}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {applicantsData?.items && applicantsData.items.length > 0 ? (
              <div className="space-y-4">
                {applicantsData.items.map((applicant) => (
                  <ApplicantRow key={applicant.id} applicant={applicant} />
                ))}
              </div>
            ) : (
              <ApplicantsEmptyState
                message={
                  search || status
                    ? "Không tìm thấy ứng viên phù hợp với bộ lọc của bạn."
                    : undefined
                }
              />
            )}

            {/* Pagination */}
            {applicantsData && (
              <ApplicantsPagination
                currentPage={applicantsData.page}
                totalPages={applicantsData.totalPages}
                totalItems={applicantsData.totalItems}
                pageSize={applicantsData.size}
                onPageChange={handlePageChange}
                isLoading={isFetching}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
