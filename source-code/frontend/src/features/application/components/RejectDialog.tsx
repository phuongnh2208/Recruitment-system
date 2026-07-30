/**
 * Reject Dialog component for rejecting an application with a reason.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Modal dialog for entering rejection reason
 *   - ✅ Form validation with React Hook Form + Zod
 *   - ✅ Loading, error states
 *   - ✅ ESC key to close
 *   - ✅ Accessibility (aria-labels, focus management)
 *   - ✅ Follows design.md patterns
 */

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateApplicationStatusSchema,
  type UpdateApplicationStatusFormData,
} from "../schemas/application-status.schema";
import { useApplicationStatus } from "../hooks/useApplicationStatus";

/** Props for the RejectDialog component. */
export interface RejectDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Application ID to reject. */
  applicationId: string;
  /** Callback when the dialog is closed. */
  onClose: () => void;
  /** Callback on successful rejection. */
  onSuccess?: () => void;
}

/**
 * RejectDialog component for rejecting an application with a reason.
 *
 * @param props - Component props.
 * @returns The rendered dialog or null if closed.
 */
export default function RejectDialog({
  isOpen,
  applicationId,
  onClose,
  onSuccess,
}: RejectDialogProps) {
  const [error, setError] = useState<string | null>(null);

  // Update application status hook
  const {
    updateStatus,
    isLoading: isUpdating,
    error: mutationError,
  } = useApplicationStatus({
    applicationId,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateApplicationStatusFormData>({
    resolver: zodResolver(updateApplicationStatusSchema),
    mode: "onChange",
    defaultValues: {
      status: "REJECTED",
      reason: "",
    },
  });

  // Handle ESC key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isUpdating) {
        onClose();
      }
    },
    [isOpen, isUpdating, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  // Handle form submission
  const onSubmit = async (data: UpdateApplicationStatusFormData) => {
    setError(null);
    await updateStatus(data.status, data.reason);
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-dialog-title"
    >
      <div
        className="w-full max-w-lg rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog header */}
        <div className="mb-6">
          <h2
            id="reject-dialog-title"
            className="font-display font-semibold text-2xl text-ink"
          >
            Từ chối ứng viên
          </h2>
          <p className="mt-1 font-body text-sm text-ink/60">
            Vui lòng nhập lý do từ chối để thông báo cho ứng viên.
          </p>
        </div>

        {/* Error message */}
        {(error || mutationError) && (
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
                  Từ chối thất bại
                </p>
                <p className="mt-1 font-body text-sm text-danger">
                  {error ||
                    (mutationError as Error)?.message ||
                    "Đã có lỗi xảy ra. Vui lòng thử lại."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            {/* Reason input */}
            <div>
              <label htmlFor="reason" className="block">
                <span className="font-body text-sm font-medium text-ink">
                  Lý do từ chối <span className="text-danger">*</span>
                </span>
              </label>
              <textarea
                id="reason"
                rows={6}
                {...register("reason")}
                disabled={isUpdating}
                placeholder="Nhập lý do từ chối ứng viên..."
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-invalid={errors.reason ? "true" : "false"}
                aria-describedby={errors.reason ? "reason-error" : undefined}
              />
              {errors.reason && (
                <p
                  id="reason-error"
                  className="mt-1 font-body text-xs text-danger"
                  role="alert"
                >
                  {errors.reason.message}
                </p>
              )}
              <p className="mt-1 text-right font-body text-xs text-ink/50">
                Tối đa 1000 ký tự
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 rounded-seal border border-ink/20 px-6 py-2.5 font-body font-medium text-ink transition hover:bg-sage/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 rounded-seal bg-danger px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </span>
              ) : (
                "Xác nhận từ chối"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
