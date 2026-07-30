/**
 * Application Action Panel component for managing application status.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Action buttons: Review, Accept, Reject
 *   - ✅ Reject button opens RejectDialog
 *   - ✅ Loading and error states
 *   - ✅ Accessibility (aria-labels, focus management)
 *   - ✅ Follows design.md patterns
 */

import { useState } from "react";
import { useApplicationStatus } from "../hooks/useApplicationStatus";
import RejectDialog from "./RejectDialog";
import StatusUpdateSuccess from "./StatusUpdateSuccess";
import type { UpdateApplicationStatusResponse } from "../types/application-status.types";

/** Props for the ApplicationActionPanel component. */
export interface ApplicationActionPanelProps {
  /** Application ID to manage. */
  applicationId: string;
  /** Current application state. */
  currentState: string;
  /** Callback when status is updated successfully. */
  onStatusUpdated?: () => void;
}

/**
 * ApplicationActionPanel component for managing application status.
 *
 * Provides buttons to review, accept, or reject an application.
 * When reject is clicked, opens a dialog to enter rejection reason.
 *
 * @param props - Component props.
 * @returns The rendered action panel.
 */
export default function ApplicationActionPanel({
  applicationId,
  currentState,
  onStatusUpdated,
}: ApplicationActionPanelProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [updatedApplication, setUpdatedApplication] = useState<
    UpdateApplicationStatusResponse["data"] | null
  >(null);

  // Update application status hook
  const {
    updateStatus,
    isLoading: isUpdating,
    error,
  } = useApplicationStatus({
    applicationId,
    onSuccess: () => {
      setShowSuccess(true);
      onStatusUpdated?.();
    },
    onError: (error) => {
      console.error("Failed to update application status:", error);
    },
  });

  // Handle status update
  const handleStatusUpdate = async (
    status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED",
    reason?: string,
  ) => {
    await updateStatus(status, reason);
  };

  // Handle success close
  const handleSuccessClose = () => {
    setShowSuccess(false);
    setUpdatedApplication(null);
  };

  // Handle reject button click
  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  // Handle reject dialog close
  const handleRejectClose = () => {
    setIsRejectDialogOpen(false);
  };

  // Handle reject success
  const handleRejectSuccess = () => {
    setUpdatedApplication({
      id: applicationId,
      state: "REJECTED",
      reviewedAt: new Date().toISOString(),
    });
    setIsRejectDialogOpen(false);
  };

  // Don't show actions if already accepted or rejected
  if (
    currentState === "ACCEPTED" ||
    currentState === "REJECTED" ||
    currentState === "WITHDRAWN"
  ) {
    return null;
  }

  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
      <h3 className="font-display font-semibold text-lg text-ink mb-4">
        Hành động
      </h3>

      {/* Error message */}
      {error && (
        <div
          className="mb-4 rounded-lg bg-danger-light p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-danger shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="font-body text-sm font-medium text-danger">
                Cập nhật thất bại
              </p>
              <p className="mt-1 font-body text-sm text-danger">
                {(error as Error)?.message ||
                  "Đã có lỗi xảy ra. Vui lòng thử lại."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {/* Review button */}
        <button
          onClick={() => handleStatusUpdate("UNDER_REVIEW")}
          disabled={isUpdating}
          className="rounded-seal border border-primary px-6 py-2.5 font-body font-medium text-primary transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Đang xử lý...
            </span>
          ) : (
            "Đánh giá"
          )}
        </button>

        {/* Accept button */}
        <button
          onClick={() => handleStatusUpdate("ACCEPTED")}
          disabled={isUpdating}
          className="rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Đang xử lý...
            </span>
          ) : (
            "Chấp nhận"
          )}
        </button>

        {/* Reject button */}
        <button
          onClick={handleRejectClick}
          disabled={isUpdating}
          className="rounded-seal border border-danger px-6 py-2.5 font-body font-medium text-danger transition hover:bg-danger-light focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Từ chối
        </button>
      </div>

      {/* Reject Dialog */}
      <RejectDialog
        isOpen={isRejectDialogOpen}
        applicationId={applicationId}
        onClose={handleRejectClose}
        onSuccess={handleRejectSuccess}
      />

      {/* Success Modal */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          onClick={handleSuccessClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-success-title"
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <StatusUpdateSuccess
              application={
                updatedApplication || {
                  id: applicationId,
                  state: currentState,
                  reviewedAt: new Date().toISOString(),
                }
              }
              onClose={handleSuccessClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
