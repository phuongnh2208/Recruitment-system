/**
 * Employer Job Dashboard - main page component for managing job postings.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { JobState } from "../types/employer-job.types";
import {
  useEmployerJobs,
  EMPLOYER_JOBS_PAGE_SIZE,
} from "../hooks/useEmployerJobs";
import { useSubmitJobPosting } from "../hooks/useEmployerJobs";
import { useCloseJobPosting } from "../hooks/useEmployerJobs";
import { useReopenJobPosting } from "../hooks/useEmployerJobs";
import { employerJobService } from "../services/employer-job.service";
import EmployerJobCard from "./EmployerJobCard";
import EmployerJobFilter from "./EmployerJobFilter";
import EmployerJobSkeleton from "./EmployerJobSkeleton";
import EmployerJobEmptyState from "./EmployerJobEmptyState";
import ApplicantsPagination from "../../employer/components/ApplicantsPagination";

export default function EmployerJobDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [state, setState] = useState<"" | JobState>("");

  const navigate = useNavigate();

  const {
    data: jobsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useEmployerJobs(currentPage, EMPLOYER_JOBS_PAGE_SIZE, { search, state });

  const submitMutation = useSubmitJobPosting();
  const closeMutation = useCloseJobPosting();
  const reopenMutation = useReopenJobPosting();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStateChange = (value: string) => {
    setState(value as "" | JobState);
    setCurrentPage(1);
  };

  const handleEdit = (jobId: string) => {
    navigate(`/employer/jobs/${jobId}/edit`);
  };

  const handleSubmit = async (jobId: string) => {
    try {
      await submitMutation.mutateAsync(jobId);
    } catch {
      // Error is handled by the mutation onError callback
    }
  };

  const handleClose = async (jobId: string) => {
    try {
      await closeMutation.mutateAsync(jobId);
    } catch {
      // Error is handled by the mutation onError callback
    }
  };

  const handleReopen = async (jobId: string) => {
    try {
      await reopenMutation.mutateAsync(jobId);
    } catch {
      // Error is handled by the mutation onError callback
    }
  };

  const handleExportReport = async (jobId: string) => {
    try {
      await employerJobService.downloadRecruitmentReport(jobId);
    } catch {
      // Error is handled by the interceptor / global error handler
    }
  };

  const handleCreateNew = () => {
    navigate("/employer/jobs/create");
  };

  const isMutating =
    submitMutation.isPending ||
    closeMutation.isPending ||
    reopenMutation.isPending;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
              Quản lý tin tuyển dụng
            </h1>
            <p className="mt-1 font-body text-sm text-ink/60">
              Xem va quan ly danh sach tin tuyen dung cua doanh nghiep ban.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Tao tin moi
          </button>
        </div>

        {/* Filters */}
        <EmployerJobFilter
          filters={{ search, state }}
          onSearchChange={handleSearchChange}
          onStateChange={handleStateChange}
        />

        {/* Error state with retry */}
        {isError && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ??
                "Khong the tai danh sach tin tuyen dung."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition hover:bg-danger/10"
            >
              Thu lai
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && <EmployerJobSkeleton />}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {jobsData?.items && jobsData.items.length > 0 ? (
              <>
                <div className="space-y-4">
                  {jobsData.items.map((job) => (
                    <EmployerJobCard
                      key={job.id}
                      job={job}
                      onEdit={handleEdit}
                      onSubmit={handleSubmit}
                      onClose={handleClose}
                      onReopen={handleReopen}
                      onExportReport={handleExportReport}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {jobsData && (
                  <ApplicantsPagination
                    currentPage={jobsData.page}
                    totalPages={jobsData.totalPages}
                    totalItems={jobsData.totalItems}
                    pageSize={jobsData.size}
                    onPageChange={handlePageChange}
                    isLoading={isFetching || isMutating}
                  />
                )}
              </>
            ) : (
              <EmployerJobEmptyState
                message={
                  search || state
                    ? "Khong tim thay tin tuyen dung phu hop voi bo loc cua ban."
                    : undefined
                }
                action={
                  !search && !state ? (
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className="rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      Tao tin tuyen dung dau tien
                    </button>
                  ) : undefined
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
