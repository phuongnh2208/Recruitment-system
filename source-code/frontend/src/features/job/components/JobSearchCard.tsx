/**
 * Job Search Card – displays a single approved job posting in search results.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows job title, company, location, salary, expiry date
 *   - ✅ Status badge (Approved) with verification seal
 *   - ✅ "Xem chi tiết" button
 *   - ✅ Follows design.md card pattern with hover animation
 *   - ❌ Business logic – parent component controls data and callbacks
 */

import type { JobSearchItem } from "../types/job-search.types";

export interface JobSearchCardProps {
  /** Job data to display. */
  job: JobSearchItem;
  /** Callback when view detail button is clicked. */
  onViewDetail: (jobId: string) => void;
}

/** Format date to Vietnamese locale. */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Format salary range for display. */
function formatSalary(
  min?: number | null,
  max?: number | null,
  currency?: string,
): string {
  if (!min && !max) return "Thỏa thuận";

  const curr = currency || "VND";
  const formatNumber = (num: number) => num.toLocaleString("vi-VN");

  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)} ${curr}`;
  }
  if (min) {
    return `Từ ${formatNumber(min)} ${curr}`;
  }
  if (max) {
    return `Đến ${formatNumber(max)} ${curr}`;
  }
  return "Thỏa thuận";
}

export default function JobSearchCard({
  job,
  onViewDetail,
}: JobSearchCardProps) {
  return (
    <div className="rounded-card bg-white p-5 shadow-card ring-1 ring-ink/5 transition hover:shadow-raised hover:ring-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base text-ink truncate">
            {job.title}
          </h3>
          <p className="mt-0.5 font-body text-sm text-ink/60 truncate">
            {job.companyName}
          </p>
        </div>

        {/* Status badge - Approved with verification seal */}
        <span
          className="inline-flex items-center gap-1.5 rounded-seal bg-primary-light px-2.5 py-0.5 font-mono text-xs font-medium text-primary ring-1 ring-primary/30 shrink-0"
          aria-label="Đã duyệt"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
            <path
              d="M8 12.5l2.5 2.5L16 9.5"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Đã duyệt
        </span>
      </div>

      {/* Job details */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4 text-ink/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-body text-sm text-ink/60">{job.location}</span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4 text-ink/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          <span className="font-body text-sm text-ink/60">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
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
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-body text-sm text-ink/60">
            Hạn: {formatDate(job.expiresAt)}
          </span>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onViewDetail(job.id)}
          className="rounded-seal border border-primary px-4 py-1.5 font-body text-sm font-medium text-primary transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={`Xem chi tiết công việc ${job.title}`}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
