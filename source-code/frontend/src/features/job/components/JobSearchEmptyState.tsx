/**
 * Empty state component for when no jobs match the search criteria.
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

export interface JobSearchEmptyStateProps {
  /** Optional custom message. */
  message?: string;
  /** Optional action button. */
  action?: ReactNode;
}

export default function JobSearchEmptyState({
  message,
  action,
}: JobSearchEmptyStateProps) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5 text-center">
      <svg
        className="mx-auto h-12 w-12 text-ink/20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 18h.01M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="mt-4 font-body text-base text-ink/70">
        {message ?? "Không tìm thấy việc làm phù hợp với tiêu chí của bạn."}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
