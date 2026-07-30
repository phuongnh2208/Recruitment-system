/**
 * User Empty State component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays empty state when no users found
 *   - ✅ Uses design.md empty state patterns
 *   - ✅ Accessibility (semantic HTML)
 *   - ❌ No business logic
 */

interface UserEmptyStateProps {
  /** Whether filters are currently applied. */
  hasFilters?: boolean;
  /** Callback to reset filters. */
  onResetFilters?: () => void;
}

export default function UserEmptyState({
  hasFilters = false,
  onResetFilters,
}: UserEmptyStateProps) {
  return (
    <div
      className="rounded-card bg-white p-12 text-center shadow-card border border-ink/10"
      role="status"
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-sage/30 flex items-center justify-center mb-4">
        <svg
          className="h-8 w-8 text-ink/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink mb-2">
        {hasFilters ? "Không tìm thấy người dùng" : "Chưa có người dùng nào"}
      </h3>
      <p className="font-body text-sm text-ink/60 mb-4 max-w-sm mx-auto">
        {hasFilters
          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm người dùng."
          : "Hệ thống chưa có người dùng nào được tạo."}
      </p>
      {hasFilters && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="rounded-seal px-4 py-2 font-body text-sm font-medium text-primary hover:text-primary-dark transition"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
