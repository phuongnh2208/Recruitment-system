/**
 * Application History Item – displays a single application in the timeline.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows job title, company, applied date, and status
 *   - ✅ Vertical timeline design following design.md
 *   - ✅ Status badge with appropriate colors
 *   - ❌ Business logic – parent component controls data
 */
import type { ApplicationHistoryItem } from "../types/application-history.types";

export interface ApplicationHistoryItemProps {
  /** Application data to display. */
  application: ApplicationHistoryItem;
  /** Whether this is the last item in the list (no connector line). */
  isLast?: boolean;
}

/** Status badge color mapping following design.md tokens. */
function getStatusClasses(status: ApplicationHistoryItem["status"]): string {
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

/** Status icon mapping. */
function getStatusIcon(
  status: ApplicationHistoryItem["status"],
): React.ReactNode {
  switch (status) {
    case "Applied":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      );
    case "Under Review":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6V12L16 14" />
        </svg>
      );
    case "Accepted":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12A10 10 0 1 1 10 4.94" />
          <path d="M22 4L12 14.01L9 11.01" />
        </svg>
      );
    case "Rejected":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case "Withdrawn":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6L18 18" />
        </svg>
      );
    default:
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
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

export default function ApplicationHistoryItem({
  application,
  isLast = false,
}: ApplicationHistoryItemProps) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline connector line */}
      <div className="flex flex-col items-center" style={{ flex: "0 0 24px" }}>
        {/* Status dot */}
        <div
          className={`relative z-10 w-4 h-4 rounded-full border-4 border-white ${
            application.status === "Accepted"
              ? "bg-primary"
              : application.status === "Rejected"
                ? "bg-danger"
                : application.status === "Under Review"
                  ? "bg-warning"
                  : application.status === "Withdrawn"
                    ? "bg-sage"
                    : "bg-primary"
          }`}
        />
        {/* Vertical line connector */}
        {!isLast && (
          <div
            className="w-0.5 flex-1 bg-sage/50 mt-1"
            style={{ marginLeft: "10px" }}
          />
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5">
          {/* Header: Job title and status */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-base text-ink truncate">
                {application.jobTitle}
              </h3>
              <p className="mt-0.5 font-body text-sm text-ink/60">
                {application.companyName}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-seal px-2.5 py-0.5 font-mono text-xs font-medium ${getStatusClasses(
                application.status,
              )} ring-1 ring-current/30 shrink-0`}
            >
              {getStatusIcon(application.status)}
              {application.status}
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
              Đã nộp: {formatDate(application.appliedDate)}
            </span>
          </div>

          {/* Application ID */}
          <div className="mt-2">
            <span className="font-mono text-xs text-ink/40">
              Mã đơn: {application.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
