/**
 * Pending Approval Page – implements TSK-FE-AD-202.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGE COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays pending employers with verify button
 *   - ✅ Displays pending jobs with approve and reject buttons
 *   - ✅ Loading skeleton state
 *   - ✅ Empty state
 *   - ✅ Error state with retry button
 *   - ✅ Reject dialog with reason form
 *   - ✅ Responsive layout (Desktop, Tablet, Mobile)
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */

import { useState } from "react";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { useApproveEmployer } from "../hooks/useApproveEmployer";
import { useApproveJob } from "../hooks/useApproveJob";
import PendingEmployerCard from "./PendingEmployerCard";
import PendingJobCard from "./PendingJobCard";
import RejectJobDialog from "./RejectJobDialog";
import ApprovalSkeleton from "./ApprovalSkeleton";
import ApprovalEmptyState from "./ApprovalEmptyState";
import type { PendingJob } from "../types/pending.types";

export default function PendingApprovalPage() {
  const {
    data: pendingData,
    isLoading,
    isError,
    error,
    refetch,
  } = usePendingApprovals();

  const { mutate: verifyEmployer, isPending: isVerifyingEmployer } =
    useApproveEmployer();

  const { mutate: approveJob, isPending: isApprovingJob } = useApproveJob();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);

  const handleRetry = () => {
    refetch();
  };

  const handleVerifyEmployer = (employerId: string) => {
    verifyEmployer(employerId);
  };

  const handleApproveJob = (jobId: string) => {
    approveJob(jobId);
  };

  const handleRejectJob = (job: PendingJob) => {
    setSelectedJob(job);
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setSelectedJob(null);
  };

  const handleRejectSuccess = () => {
    // Cache invalidation is handled in the hook
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Chờ duyệt
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Quản lý doanh nghiệp và tin tuyển dụng chờ phê duyệt.
          </p>
        </div>

        {/* Error state with retry */}
        {isError && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ?? "Không thể tải dữ liệu."}
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
        {isLoading && <ApprovalSkeleton />}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {pendingData ? (
              <div className="space-y-8">
                {/* Pending employers */}
                <section aria-label="Doanh nghiệp chờ duyệt">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Doanh nghiệp chờ duyệt
                  </h2>
                  {pendingData.pendingEmployers.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {pendingData.pendingEmployers.map((employer) => (
                        <PendingEmployerCard
                          key={employer.id}
                          employer={employer}
                          onVerify={handleVerifyEmployer}
                          isVerifying={isVerifyingEmployer}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 font-body text-sm text-ink/60">
                      Không có doanh nghiệp nào chờ duyệt.
                    </p>
                  )}
                </section>

                {/* Pending jobs */}
                <section aria-label="Tin tuyển dụng chờ duyệt">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Tin tuyển dụng chờ duyệt
                  </h2>
                  {pendingData.pendingJobs.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {pendingData.pendingJobs.map((job) => (
                        <PendingJobCard
                          key={job.id}
                          job={job}
                          onApprove={handleApproveJob}
                          onReject={handleRejectJob}
                          isApproving={isApprovingJob}
                          isRejecting={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 font-body text-sm text-ink/60">
                      Không có tin tuyển dụng nào chờ duyệt.
                    </p>
                  )}
                </section>

                {/* Empty state when no pending items */}
                {pendingData.pendingEmployers.length === 0 &&
                  pendingData.pendingJobs.length === 0 && (
                    <ApprovalEmptyState />
                  )}
              </div>
            ) : (
              <ApprovalEmptyState />
            )}
          </>
        )}

        {/* Reject Job Dialog */}
        <RejectJobDialog
          isOpen={rejectDialogOpen}
          job={selectedJob}
          onClose={handleRejectDialogClose}
          onSuccess={handleRejectSuccess}
        />
      </div>
    </div>
  );
}
