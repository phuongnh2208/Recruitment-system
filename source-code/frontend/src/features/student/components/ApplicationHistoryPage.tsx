/**
 * Student Application History Page - implements TSK-FE-ST-203.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useApplicationHistory,
  APPLICATION_HISTORY_PAGE_SIZE,
} from "../hooks/useApplicationHistory";
import ApplicationHistoryItem from "./ApplicationHistoryItem";
import ApplicationHistoryEmptyState from "./ApplicationHistoryEmptyState";
import ApplicationHistorySkeleton from "./ApplicationHistorySkeleton";
import ApplicationHistoryPagination from "./ApplicationHistoryPagination";

export default function ApplicationHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const {
    data: historyData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApplicationHistory(currentPage, APPLICATION_HISTORY_PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    refetch();
  };

  const handleWithdrawSuccess = () => {
    refetch();
  };

  const handleFindJobs = () => {
    navigate("/student/jobs");
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Lich su ung tuyen
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Theo doi trang thai cac don ung tuyen cua ban.
          </p>
        </div>

        {/* Error state with retry */}
        {isError && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ?? "Khong the tai lich su ung tuyen."}
            </p>
            <button
              onClick={handleRetry}
              className="mt-2 rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition hover:bg-danger/10"
            >
              Thu lai
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && <ApplicationHistorySkeleton />}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {historyData?.items && historyData.items.length > 0 ? (
              <div className="space-y-6">
                {historyData.items.map((application, index) => (
                  <ApplicationHistoryItem
                    key={application.id}
                    application={application}
                    isLast={index === historyData.items.length - 1}
                    onWithdrawSuccess={handleWithdrawSuccess}
                  />
                ))}
              </div>
            ) : (
              <ApplicationHistoryEmptyState
                action={
                  <button
                    onClick={handleFindJobs}
                    className="rounded-seal bg-primary px-6 py-2.5 font-body text-white hover:bg-primary-dark"
                  >
                    Tim viec lam
                  </button>
                }
              />
            )}

            {/* Pagination */}
            {historyData && (
              <ApplicationHistoryPagination
                currentPage={historyData.page}
                totalPages={historyData.totalPages}
                totalItems={historyData.totalItems}
                pageSize={historyData.size}
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
