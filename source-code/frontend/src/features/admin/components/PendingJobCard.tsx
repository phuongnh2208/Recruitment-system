/**
 * Pending job card component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays a single pending job with approve and reject buttons
 *   - ✅ Uses design.md card patterns (rounded-card, shadow-card, hover)
 *   - ✅ Accessibility (aria-label, focus-visible)
 *   - ❌ No business logic
 */

import type { PendingJob } from "../types/pending.types";

interface PendingJobCardProps {
  job: PendingJob;
  onApprove: (jobId: string) => void;
  onReject: (job: PendingJob) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export default function PendingJobCard({
  job,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: PendingJobCardProps) {
  return (
    <div
      className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 transition hover:shadow-raised"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg text-ink">
            {job.title}
          </h3>
          <p className="mt-1 font-body text-sm text-ink/70">
            {job.employerName}
          </p>
          <p className="mt-2 font-mono text-xs text-ink/50">
            Ngày tạo: {new Date(job.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <span className="shrink-0 rounded-seal bg-warning-light px-2.5 py-0.5 font-mono text-xs font-medium text-warning ring-1 ring-warning/20">
          Pending
        </span>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => onApprove(job.id)}
          disabled={isApproving || isRejecting}
          aria-label={`Phê duyệt tin tuyển dụng ${job.title}`}
          className="flex-1 rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApproving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Đang duyệt...
            </span>
          ) : (
            "Phê duyệt"
          )}
        </button>
        <button
          type="button"
          onClick={() => onReject(job)}
          disabled={isApproving || isRejecting}
          aria-label={`Từ chối tin tuyển dụng ${job.title}`}
          className="flex-1 rounded-seal border border-danger px-6 py-2.5 font-body font-medium text-danger shadow-card transition hover:bg-danger/10 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRejecting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-danger border-t-transparent"></div>
              Đang xử lý...
            </span>
          ) : (
            "Từ chối"
          )}
        </button>
      </div>
    </div>
  );
}
