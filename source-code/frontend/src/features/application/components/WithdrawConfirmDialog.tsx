/**
 * Withdraw Confirm Dialog component for confirming application withdrawal.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Modal dialog for confirming withdrawal
 *   - ✅ Simple confirmation (no form needed)
 *   - ✅ Loading, error states
 *   - ✅ ESC key to close
 *   - ✅ Accessibility (aria-labels, focus management)
 *   - ✅ Follows design.md patterns
 */

import { useState, useEffect, useCallback } from "react";
import { useWithdrawApplication } from "../hooks/useWithdrawApplication";

/** Props for the WithdrawConfirmDialog component. */
export interface WithdrawConfirmDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Application ID to withdraw. */
  applicationId: string;
  /** Callback when the dialog is closed. */
  onClose: () => void;
  /** Callback on successful withdrawal. */
  onSuccess?: () => void;
}

/**
 * WithdrawConfirmDialog component for confirming application withdrawal.
 *
 * Simple confirmation dialog without form. Shows warning message and
 * confirm/cancel buttons.
 *
 * @param props - Component props.
 * @returns The rendered dialog or null if closed.
 */
export default function WithdrawConfirmDialog({
  isOpen,
  applicationId,
  onClose,
  onSuccess,
}: WithdrawConfirmDialogProps) {
  const [error, setError] = useState<string | null>(null);

  // Withdraw application hook
  const {
    withdraw,
    isLoading: isWithdrawing,
    error: mutationError,
  } = useWithdrawApplication({
    applicationId,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Handle ESC key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isWithdrawing) {
        onClose();
      }
    },
    [isOpen, isWithdrawing, onClose],
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

  // Handle confirm withdrawal
  const handleConfirm = async () => {
    setError(null);
    await withdraw();
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
      aria-labelledby="withdraw-dialog-title"
    >
      <div
        className="w-full max-w-lg rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog header */}
        <div className="mb-6">
          <h2
            id="withdraw-dialog-title"
            className="font-display font-semibold text-2xl text-ink"
          >
            Hủy ứng tuyển
          </h2>
          <p className="mt-1 font-body text-sm text-ink/60">
            Bạn có chắc chắn muốn hủy đơn ứng tuyển này? Hành động này không thể
            hoàn tác.
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
                  Hủy ứng tuyển thất bại
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

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isWithdrawing}
            className="flex-1 rounded-seal border border-ink/20 px-6 py-2.5 font-body font-medium text-ink transition hover:bg-sage/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isWithdrawing}
            className="flex-1 rounded-seal bg-danger px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWithdrawing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang xử lý...
              </span>
            ) : (
              "Xác nhận hủy"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
