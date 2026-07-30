/**
 * Empty state component for the admin dashboard.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays a message when there is no dashboard data
 *   - ✅ Uses design.md styling
 *   - ❌ No business logic
 */

interface DashboardEmptyStateProps {
  message?: string;
}

export default function DashboardEmptyState({
  message,
}: DashboardEmptyStateProps) {
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
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">
        Chưa có dữ liệu
      </h3>
      <p className="mt-1 font-body text-sm text-ink/60">
        {message ?? "Dashboard chưa có dữ liệu để hiển thị."}
      </p>
    </div>
  );
}
