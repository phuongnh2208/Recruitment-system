/**
 * Employer Job Card – displays a single job posting in the dashboard.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows job title, location, state, dates, and applicant count
 *   - ✅ Status badge with appropriate colors following design.md
 *   - ✅ Action buttons (Edit, Submit, Close)
 *   - ❌ Business logic – parent component controls data and callbacks
 */

import type { EmployerJobItem } from "../types/employer-job.types";

export interface EmployerJobCardProps {
  /** Job data to display. */
  job: EmployerJobItem;
  /** Callback when edit button is clicked. */
  onEdit: (jobId: string) => void;
  /** Callback when submit button is clicked. */
  onSubmit: (jobId: string) => void;
  /** Callback when close button is clicked. */
  onClose: (jobId: string) => void;
  /** Callback when reopen button is clicked. */
  onReopen: (jobId: string) => void;
  /** Callback when export report button is clicked. */
  onExportReport: (jobId: string) => void;
}

/** Status badge color mapping following design.md tokens. */
function getStatusClasses(state: EmployerJobItem["state"]): string {
  switch (state) {
    case "Draft":
      return "bg-sage text-ink/60";
    case "Pending":
      return "bg-warning-light text-warning";
    case "Approved":
      return "bg-primary-light text-primary";
    case "Rejected":
      return "bg-danger-light text-danger";
    case "Closed":
    case "Expired":
      return "bg-sage text-ink/50";
    default:
      return "bg-sage text-ink/50";
  }
}

/** Format date to Vietnamese locale. */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function EmployerJobCard({
  job,
  onEdit,
  onSubmit,
  onClose,
  onReopen,
  onExportReport,
}: EmployerJobCardProps) {
  const canEdit = job.state === "Draft" || job.state === "Rejected";
  const canSubmit = job.state === "Draft";
  const canClose = job.state === "Approved";
  const canReopen = job.state === "Rejected";
  const canExportReport = job.state === "Closed" || job.state === "Expired";

  return (
    <div className="rounded-card bg-white p-5 shadow-card ring-1 ring-ink/5 transition hover:shadow-raised hover:ring-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base text-ink truncate">
            {job.title}
          </h3>
          <p className="mt-0.5 font-body text-sm text-ink/60 truncate">
            {job.location}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center rounded-seal px-2.5 py-0.5 font-mono text-xs font-medium ${getStatusClasses(
            job.state,
          )} ring-1 ring-current/30 shrink-0`}
        >
          {job.state}
        </span>
      </div>

      {/* Job details */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Applicant count */}
        <div className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4 text-ink/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span className="font-body text-sm text-ink/60">
            {job.applicantCount} ứng viên
          </span>
        </div>

        {/* Created date */}
        <div className="flex items-center gap-1.5">
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
            Tạo: {formatDate(job.createdAt)}
          </span>
        </div>

        {/* Expiry date */}
        <div className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4 text-ink/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-body text-sm text-ink/60">
            Hạn: {formatDate(job.expiresAt)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit(job.id)}
            className="rounded-seal border border-primary px-4 py-1.5 font-body text-sm font-medium text-primary transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Chỉnh sửa
          </button>
        )}
        {canSubmit && (
          <button
            type="button"
            onClick={() => onSubmit(job.id)}
            className="rounded-seal bg-primary px-4 py-1.5 font-body text-sm font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Gửi duyệt
          </button>
        )}
        {canClose && (
          <button
            type="button"
            onClick={() => onClose(job.id)}
            className="rounded-seal border border-ink/15 px-4 py-1.5 font-body text-sm font-medium text-ink/70 transition hover:bg-sage/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Đóng tin
          </button>
        )}
        {canReopen && (
          <button
            type="button"
            onClick={() => onReopen(job.id)}
            className="rounded-seal border border-primary px-4 py-1.5 font-body text-sm font-medium text-primary transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Mở lại
          </button>
        )}
        {canExportReport && (
          <button
            type="button"
            onClick={() => onExportReport(job.id)}
            className="rounded-seal border border-ink/15 px-4 py-1.5 font-body text-sm font-medium text-ink/70 transition hover:bg-sage/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Xuất báo cáo
          </button>
        )}
      </div>
    </div>
  );
}
