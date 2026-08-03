/**
 * Job Detail Page – displays full details of a job posting.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGE COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays job title, company, location, salary, expiry, status
 *   - ✅ Shows description and requirements
 *   - ✅ Sidebar with company info, apply button, save button
 *   - ✅ Loading skeleton state
 *   - ✅ Error state with retry
 *   - ✅ Responsive layout
 *   - ✅ Follows design.md patterns
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJobDetail } from "../hooks/useJobDetail";
import JobDetailHeader from "./JobDetailHeader";
import JobDescriptionCard from "./JobDescriptionCard";
import JobRequirementCard from "./JobRequirementCard";
import JobInformationCard from "./JobInformationCard";
import JobApplyCard from "./JobApplyCard";
import JobDetailSkeleton from "./JobDetailSkeleton";
import JobDetailErrorState from "./JobDetailErrorState";
import ApplyJobDialog from "../../application/components/ApplyJobDialog";

export default function JobDetailPage() {
  const navigate = useNavigate();
  const { jobId = "" } = useParams<{ jobId: string }>();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const {
    data: jobData,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobDetail({ jobId });

  const handleBack = () => {
    navigate("/student/jobs");
  };

  const handleApply = () => {
    setIsApplyDialogOpen(true);
  };

  const handleApplyDialogClose = () => {
    setIsApplyDialogOpen(false);
  };

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (isError || !jobData) {
    return (
      <JobDetailErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={refetch}
      />
    );
  }

  const { job } = jobData;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 font-body text-sm text-ink/60 transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Quay lại tìm kiếm
        </button>

        {/* Job header */}
        <JobDetailHeader job={job} />

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Job details */}
          <div className="space-y-6 lg:col-span-2">
            <JobInformationCard
              location={job.location}
              salaryMin={job.salaryMin}
              salaryMax={job.salaryMax}
              currency={job.currency}
              expiresAt={job.expiresAt}
            />

            <JobDescriptionCard description={job.description} />

            <JobRequirementCard requirements={job.requirements} />
          </div>

          {/* Right column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <JobApplyCard
                companyName={job.companyName}
                companyDescription={job.companyDescription}
                website={job.website}
                companyAddress={job.companyAddress}
                employerVerified={job.employerVerified}
                onApply={handleApply}
              />
            </div>
          </div>
        </div>

        {/* Apply Job Dialog */}
        <ApplyJobDialog
          isOpen={isApplyDialogOpen}
          jobId={jobId}
          onClose={handleApplyDialogClose}
        />
      </div>
    </div>
  );
}
