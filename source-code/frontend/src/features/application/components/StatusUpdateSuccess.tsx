/**
 * Status Update Success component for displaying success message.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Success message display
 *   - ✅ Follows design.md patterns
 *   - ✅ Accessibility (aria-labels)
 */

import type { UpdateApplicationStatusResponse } from "../types/application-status.types";

/** Props for the StatusUpdateSuccess component. */
export interface StatusUpdateSuccessProps {
  /** The response data from the status update API. */
  application: UpdateApplicationStatusResponse["data"];
  /** Callback when the user closes the success message. */
  onClose: () => void;
}

/**
 * StatusUpdateSuccess component for displaying success message after updating application status.
 *
 * @param props - Component props.
 * @returns The rendered success message.
 */
export default function StatusUpdateSuccess({
  application,
  onClose,
}: StatusUpdateSuccessProps) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5">
      {/* Success icon */}
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-primary-light p-3">
          <svg
            className="h-12 w-12 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Success message */}
      <h3
        id="status-update-success-title"
        className="font-display text-center font-semibold text-xl text-ink"
      >
        Cập nhật trạng thái thành công
      </h3>
      <p className="mt-2 text-center font-body text-sm text-ink/60">
        Trạng thái hồ sơ ứng tuyển đã được cập nhật.
      </p>

      {/* Application details */}
      <div className="mt-6 rounded-lg bg-sage/30 p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-body text-sm text-ink/60">Mã ứng tuyển:</span>
            <span className="font-mono text-sm text-ink">{application.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-body text-sm text-ink/60">Trạng thái:</span>
            <span className="font-body text-sm font-medium text-primary">
              {application.state}
            </span>
          </div>
          {application.reviewedAt && (
            <div className="flex justify-between">
              <span className="font-body text-sm text-ink/60">Thời gian:</span>
              <span className="font-body text-sm text-ink">
                {new Date(application.reviewedAt).toLocaleString("vi-VN")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="mt-6 w-full rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        Đóng
      </button>
    </div>
  );
}
