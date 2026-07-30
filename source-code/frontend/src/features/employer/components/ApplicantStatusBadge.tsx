/**
 * Applicant Status Badge – displays the application status with appropriate colors.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Follows design.md color tokens for status badges
 *   - ✅ Accessible with proper aria attributes
 *   - ❌ No business logic
 */

import type { ApplicationStatus } from "../types/applicant-detail.types";

export interface ApplicantStatusBadgeProps {
  /** The application status value. */
  status: ApplicationStatus;
}

/** Status badge color mapping following design.md tokens. */
function getStatusClasses(status: ApplicationStatus): string {
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

/** Vietnamese label mapping for each status. */
const STATUS_LABELS: Record<ApplicationStatus, string> = {
  Applied: "Đã nộp",
  "Under Review": "Đang xem xét",
  Accepted: "Đã chấp nhận",
  Rejected: "Đã từ chối",
  Withdrawn: "Đã rút",
};

export default function ApplicantStatusBadge({
  status,
}: ApplicantStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-seal px-3 py-1 font-mono text-xs font-medium ${getStatusClasses(
        status,
      )} ring-1 ring-current/30`}
      aria-label={`Trạng thái: ${STATUS_LABELS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
