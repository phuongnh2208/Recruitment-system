/**
 * Withdraw Success component for displaying successful withdrawal message.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Success message display
 *   - ✅ Close button
 *   - ✅ Accessibility (aria-labels, focus management)
 *   - ✅ Follows design.md patterns
 */

import type { WithdrawApplicationResponse } from "../types/withdraw-application.types";

/** Props for the WithdrawSuccess component. */
export interface WithdrawSuccessProps {
  /** Application data after withdrawal. */
  application: WithdrawApplicationResponse["data"];
  /** Callback when the success dialog is closed. */
  onClose: () => void;
}

/**
 * WithdrawSuccess component for displaying successful withdrawal message.
 *
 * Shows a success message confirming the application has been withdrawn.
 *
 * @param props - Component props.
 * @returns The rendered success component.
 */
export default function WithdrawSuccess({
  application,
  onClose,
}: WithdrawSuccessProps) {
  return (
    <div className="w-full max-w-lg">
      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
        {/* Success icon */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary-light p-3">
            <svg
              className="h-8 w-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d="M22 11.08V12A10 10 0 1 1 10 4.94"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 4L12 14.01L9 11.01"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Success message */}
        <div className="text-center">
          <h3
            id="withdraw-success-title"
            className="font-display font-semibold text-xl text-ink"
          >
            Hủy ứng tuyển thành công
          </h3>
          <p className="mt-2 font-body text-sm text-ink/60">
            Đơn ứng tuyển của bạn đã được hủy thành công.
          </p>
          <p className="mt-1 font-mono text-xs text-ink/50">
            Mã đơn: {application.id}
          </p>
        </div>

        {/* Close button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
