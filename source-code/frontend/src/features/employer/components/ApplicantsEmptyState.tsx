/**
 * Empty state component for when the employer has no applicants.
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

export interface ApplicantsEmptyStateProps {
  /** Optional custom message. */
  message?: string;
  /** Optional action button. */
  action?: ReactNode;
}

export default function ApplicantsEmptyState({
  message,
  action,
}: ApplicantsEmptyStateProps) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5 text-center">
      <svg
        className="mx-auto h-12 w-12 text-ink/20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
      <p className="mt-4 font-body text-base text-ink/70">
        {message ??
          "Chưa có ứng viên nào nộp hồ sơ vào tin tuyển dụng của bạn."}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
