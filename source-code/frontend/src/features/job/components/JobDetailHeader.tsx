/**
 * Job Detail Header – displays job title, company, and status.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows job title, company name, and verification badge
 *   - ✅ Displays job ID in mono font
 *   - ✅ Follows design.md typography and badge patterns
 */

import type { JobDetailResponse } from "../types/job-detail.types";

export interface JobDetailHeaderProps {
  /** Job detail data. */
  job: JobDetailResponse["job"];
}

/** Format date to Vietnamese locale. */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function JobDetailHeader({ job }: JobDetailHeaderProps) {
  return (
    <div className="mb-8">
      {/* Job title and status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-semibold text-3xl text-ink md:text-4xl leading-tight">
            {job.title}
          </h1>
          <p className="mt-2 font-body text-lg text-ink/70">
            {job.companyName}
          </p>
        </div>

        {/* Status badge */}
        <span
          className="inline-flex items-center gap-1.5 rounded-seal bg-primary-light px-3 py-1 font-mono text-xs font-medium text-primary ring-1 ring-primary/30 shrink-0"
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

      {/* Job ID and expiry date */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs text-ink/50">
          JOB-{job.id.slice(0, 8).toUpperCase()}
        </span>
        <span className="text-ink/30">•</span>
        <span className="font-body text-sm text-ink/60">
          Hạn nộp: {formatDate(job.expiresAt)}
        </span>
      </div>
    </div>
  );
}
