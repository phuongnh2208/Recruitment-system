/**
 * Empty state component for when the student has no application history.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows an informational message
 *   - ✅ Follows design.md empty state pattern
 *   - ❌ Business logic – parent component controls visibility
 */
import type { ReactNode } from "react";

export interface ApplicationHistoryEmptyStateProps {
  /** Optional custom message. */
  message?: string;
  /** Optional action button. */
  action?: ReactNode;
}

export default function ApplicationHistoryEmptyState({
  message,
  action,
}: ApplicationHistoryEmptyStateProps) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5 text-center">
      <svg
        className="mx-auto h-12 w-12 text-ink/20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="mt-4 font-body text-base text-ink/70">
        {message ??
          "Bạn chưa nộp đơn ứng tuyển nào. Hãy tìm kiếm việc làm phù hợp và nộp đơn ngay hôm nay!"}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
