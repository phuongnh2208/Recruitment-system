/**
 * Empty state component for the pending approval page.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays a message when there are no pending approvals
 *   - ✅ Uses design.md styling
 *   - ❌ No business logic
 */

interface ApprovalEmptyStateProps {
  message?: string;
}

export default function ApprovalEmptyState({
  message,
}: ApprovalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-seal bg-sage/50"
        aria-hidden="true"
      >
        <svg
          className="h-8 w-8 text-ink/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">
        Không có mục chờ duyệt
      </h3>
      <p className="mt-1 font-body text-sm text-ink/60">
        {message ?? "Tất cả doanh nghiệp và tin tuyển dụng đã được xử lý."}
      </p>
    </div>
  );
}
