/**
 * Job Search Page – implements TSK-FE-JOB-203.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGE COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays approved job postings with search and filters
 *   - ✅ Server-side pagination using TanStack Query
 *   - ✅ Loading skeleton state
 *   - ✅ Empty state
 *   - ✅ Error state with retry button
 *   - ✅ Status badges (Approved) with verification seal
 *   - ✅ Search by keyword, location, and salary range
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { JobSearchFilters } from "../types/job-search.types";
import { useJobSearch, JOB_SEARCH_PAGE_SIZE } from "../hooks/useJobSearch";
import JobSearchCard from "./JobSearchCard";
import JobSearchFilter from "./JobSearchFilter";
import JobSearchSkeleton from "./JobSearchSkeleton";
import JobSearchEmptyState from "./JobSearchEmptyState";
import ApplicantsPagination from "../../employer/components/ApplicantsPagination";

export default function JobSearchPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<JobSearchFilters>({});

  const navigate = useNavigate();

  const {
    data: searchData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useJobSearch(currentPage, JOB_SEARCH_PAGE_SIZE, filters);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handleLocationChange = (location: string) => {
    setFilters((prev) => ({ ...prev, location }));
    setCurrentPage(1);
  };

  const handleSalaryMinChange = (salaryMin: number | undefined) => {
    setFilters((prev) => ({ ...prev, salaryMin }));
    setCurrentPage(1);
  };

  const handleSalaryMaxChange = (salaryMax: number | undefined) => {
    setFilters((prev) => ({ ...prev, salaryMax }));
    setCurrentPage(1);
  };

  const handleViewDetail = (jobId: string) => {
    navigate(`/student/jobs/${jobId}`);
  };

  const handleRetry = () => {
    refetch();
  };

  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.salaryMin ||
    filters.salaryMax;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Tìm việc làm
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Khám phá các cơ hội việc làm đã được xác thực từ các doanh nghiệp uy
            tín.
          </p>
        </div>

        {/* Filters */}
        <JobSearchFilter
          filters={filters}
          onSearchChange={handleSearchChange}
          onLocationChange={handleLocationChange}
          onSalaryMinChange={handleSalaryMinChange}
          onSalaryMaxChange={handleSalaryMaxChange}
        />

        {/* Error state with retry */}
        {isError && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ?? "Không thể tải danh sách việc làm."}
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
        {isLoading && <JobSearchSkeleton />}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {searchData?.items && searchData.items.length > 0 ? (
              <>
                <div className="space-y-4">
                  {searchData.items.map((job) => (
                    <JobSearchCard
                      key={job.id}
                      job={job}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {searchData && (
                  <ApplicantsPagination
                    currentPage={searchData.page}
                    totalPages={searchData.totalPages}
                    totalItems={searchData.totalItems}
                    pageSize={searchData.size}
                    onPageChange={handlePageChange}
                    isLoading={isFetching}
                  />
                )}
              </>
            ) : (
              <JobSearchEmptyState
                message={
                  hasActiveFilters
                    ? "Không tìm thấy việc làm phù hợp với bộ lọc của bạn."
                    : undefined
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
