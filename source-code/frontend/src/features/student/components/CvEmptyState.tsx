/**
 * Empty state component for when the student has no CVs.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows an informational message and a call‑to‑action button
 *   - ✅ Button opens the upload zone (handled by parent)
 *   - ❌ Business logic – parent component controls visibility
 */
import type { ReactNode } from "react";

export interface CvEmptyStateProps {
  /** Optional custom message. */
  message?: string;
  /** Render prop for the primary action button. */
  action: ReactNode;
}

export default function CvEmptyState({ message, action }: CvEmptyStateProps) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5 text-center">
      <p className="font-body text-base text-ink/70 mb-4">
        {message ?? "Bạn chưa có CV nào. Hãy tải lên để bắt đầu."}
      </p>
      {action}
    </div>
  );
}
