/**
 * Skeleton loader for the admin dashboard.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Matches the structure of the dashboard page
 *   - ✅ Uses animate-pulse for loading animation
 *   - ❌ No business logic
 */

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-seal bg-sage/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-sage/30" />
                <div className="h-6 w-16 animate-pulse rounded bg-sage/50" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-sage/50" />
        <div className="rounded-card bg-white ring-1 ring-ink/5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-sage/50 px-4 py-3 last:border-b-0"
            >
              <div className="h-4 w-40 animate-pulse rounded bg-sage/30" />
              <div className="h-4 w-32 animate-pulse rounded bg-sage/20" />
              <div className="h-4 w-24 animate-pulse rounded bg-sage/20" />
              <div className="h-4 w-20 animate-pulse rounded bg-sage/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
