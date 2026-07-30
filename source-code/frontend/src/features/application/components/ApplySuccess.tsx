/**
 * Apply Success component displayed after successful job application.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows success message
 *   - ✅ Displays application details
 *   - ✅ Follows design.md patterns
 */

import type { ApplyJobResponse } from "../types/application.types";

/** Props for the ApplySuccess component. */
export interface ApplySuccessProps {
  /** Application response data. */
  application: ApplyJobResponse["data"];
  /** Callback when the user clicks "Close". */
  onClose: () => void;
}

/**
 * ApplySuccess component for displaying successful application confirmation.
 *
 * @param props - Component props.
 * @returns The rendered success message.
 */
export default function ApplySuccess({
  application,
  onClose,
}: ApplySuccessProps) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5">
      {/* Success icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
        <svg
          className="h-8 w-8 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M5 13l4 4L19 7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Success message */}
      <div className="text-center">
        <h3 className="font-display font-semibold text-2xl text-ink">
          Ứng tuyển thành công!
        </h3>
        <p className="mt-2 font-body text-sm text-ink/60">
          Hồ sơ ứng tuyển của bạn đã được gửi đi. Nhà tuyển dụng sẽ xem xét và
          phản hồi sớm nhất có thể.
        </p>
      </div>

      {/* Application details */}
      <div className="mt-6 rounded-lg bg-sage/30 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-ink/60">Mã ứng tuyển:</span>
            <span className="font-mono text-sm font-medium text-ink">
              {application.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-ink/60">Trạng thái:</span>
            <span className="rounded-seal bg-primary-light px-2.5 py-0.5 font-mono text-xs text-primary">
              {application.state}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-ink/60">
              Ngày ứng tuyển:
            </span>
            <span className="font-body text-sm text-ink">
              {new Date(application.appliedAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Close button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
