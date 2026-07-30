/**
 * Applicant Row – displays a single applicant in the table.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows applicant name, job title, applied date, and status
 *   - ✅ Status badge with appropriate colors following design.md
 *   - ❌ Business logic – parent component controls data
 */

import { useNavigate } from "react-router-dom";
import type { ApplicantItem } from "../types/applicants.types";

export interface ApplicantRowProps {
  /** Applicant data to display. */
  applicant: ApplicantItem;
}

/** Status badge color mapping following design.md tokens. */
function getStatusClasses(status: ApplicantItem["status"]): string {
  switch (status) {
    case "Applied":
      return "bg-primary-light text-primary";
    case "Under Review":
      return "bg-warning-light text-warning";
    case "Accepted":
      return "bg-primary-light text-primary";
    case "Rejected":
      return "bg-danger-light text-danger";
    case "Withdrawn":
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

export default function ApplicantRow({ applicant }: ApplicantRowProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/employer/applicants/${applicant.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/employer/applicants/${applicant.id}`);
    }
  };

  return (
    <div
      className="rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5 transition hover:shadow-raised hover:ring-primary/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết ứng viên ${applicant.applicantName}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Applicant info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base text-ink truncate">
            {applicant.applicantName}
          </h3>
          <p className="mt-0.5 font-body text-sm text-ink/60 truncate">
            {applicant.jobTitle}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center rounded-seal px-2.5 py-0.5 font-mono text-xs font-medium ${getStatusClasses(
            applicant.status,
          )} ring-1 ring-current/30 shrink-0`}
        >
          {applicant.status}
        </span>
      </div>

      {/* Applied date */}
      <div className="mt-3 flex items-center gap-2">
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
          Đã nộp: {formatDate(applicant.appliedDate)}
        </span>
      </div>

      {/* Application ID */}
      <div className="mt-2">
        <span className="font-mono text-xs text-ink/40">
          Mã đơn: {applicant.id}
        </span>
      </div>
    </div>
  );
}
