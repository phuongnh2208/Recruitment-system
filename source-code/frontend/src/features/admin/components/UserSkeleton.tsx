/**
 * User Skeleton component for loading state.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays skeleton placeholders for user list
 *   - ✅ Uses design.md skeleton patterns
 *   - ❌ No business logic
 */

export default function UserSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Đang tải danh sách người dùng"
    >
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="rounded-card bg-white p-4 shadow-card border border-ink/10 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-ink/10 flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-ink/10 rounded" />
                  <div className="h-4 w-1/2 bg-ink/10 rounded" />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="h-5 w-20 bg-ink/10 rounded-seal" />
                  <div className="h-5 w-20 bg-ink/10 rounded-seal" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 w-24 bg-ink/10 rounded font-mono" />
              </div>
            </div>
            <div className="h-6 w-24 bg-ink/10 rounded-seal flex-shrink-0" />
          </div>
        </article>
      ))}
    </div>
  );
}
