/**
 * Employer Applicant Detail Page – implements TSK-FE-EM-203.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGE COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays student information, cover letter, application status,
 *       submitted date, and PDF viewer for CV
 *   - ✅ Loading skeleton state
 *   - ✅ Error state with retry button
 *   - ✅ Uses browser PDF viewer via iframe
 *   - ✅ Follows design.md for styling and accessibility
 *   - ✅ Responsive layout
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */

import { useParams, useNavigate } from "react-router-dom";
import { useApplicantDetail } from "../hooks/useApplicantDetail";
import ApplicantInfoCard from "./ApplicantInfoCard";
import CoverLetterCard from "./CoverLetterCard";
import ApplicantStatusBadge from "./ApplicantStatusBadge";
import PdfViewer from "./PdfViewer";
import LoadingSkeleton from "./LoadingSkeleton";
import ErrorState from "./ErrorState";
import ApplicationActionPanel from "../../application/components/ApplicationActionPanel";

/** Format date to Vietnamese locale. */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApplicantDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const {
    data: applicantDetail,
    isLoading,
    isError,
    error,
    refetch,
  } = useApplicantDetail(applicationId ?? "");

  const handleRetry = () => {
    refetch();
  };

  const handleGoBack = () => {
    navigate("/employer/applicants");
  };

  const handleStatusUpdated = () => {
    // Refetch applicant detail to show updated status
    refetch();
  };

  // Invalid or missing application ID
  if (!applicationId) {
    return <ErrorState message="Mã đơn ứng tuyển không hợp lệ." />;
  }

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        message={
          (error as Error)?.message ?? "Không thể tải thông tin ứng viên."
        }
        onRetry={handleRetry}
      />
    );
  }

  // Empty state – data not available even without error
  if (!applicantDetail) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Back navigation */}
        <button
          onClick={handleGoBack}
          className="mb-6 inline-flex items-center gap-2 font-body text-sm text-ink/60 transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg px-2 py-1"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Quay lại danh sách ứng viên
        </button>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
                {applicantDetail.student.fullName}
              </h1>
              <p className="mt-1 font-body text-sm text-ink/60">
                {applicantDetail.jobTitle}
              </p>
            </div>
            <ApplicantStatusBadge status={applicantDetail.status} />
          </div>

          {/* Submitted date */}
          <div className="mt-3 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-ink/40 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="font-body text-sm text-ink/60">
              Ngày nộp: {formatDate(applicantDetail.appliedDate)}
            </span>
          </div>

          {/* Application ID */}
          <div className="mt-1">
            <span className="font-mono text-xs text-ink/40">
              Mã đơn: {applicantDetail.id}
            </span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Student info */}
          <div className="lg:col-span-1 space-y-6">
            <ApplicantInfoCard student={applicantDetail.student} />
          </div>

          {/* Right column: Cover letter + CV + Actions */}
          <div className="lg:col-span-2 space-y-6">
            <CoverLetterCard coverLetter={applicantDetail.coverLetter} />

            <PdfViewer
              pdfUrl={applicantDetail.cvUrl}
              applicantName={applicantDetail.student.fullName}
            />

            {/* Application Action Panel */}
            <ApplicationActionPanel
              applicationId={applicantDetail.id}
              currentState={applicantDetail.status}
              onStatusUpdated={handleStatusUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
