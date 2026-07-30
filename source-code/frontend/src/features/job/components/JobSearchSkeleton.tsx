/**
 * Skeleton loader for job search results.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Matches the structure of JobSearchCard
 *   - ✅ Uses animate-pulse for loading animation
 *   - ❌ No business logic
 */

export default function JobSearchSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-card bg-white p-5 shadow-card ring-1 ring-ink/5"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-64 animate-pulse rounded bg-sage/50" />
              <div className="h-4 w-40 animate-pulse rounded bg-sage/30" />
            </div>
            <div className="h-6 w-24 animate-pulse rounded-seal bg-sage/50" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-sage/30" />
            <div className="h-4 w-28 animate-pulse rounded bg-sage/30" />
            <div className="h-4 w-36 animate-pulse rounded bg-sage/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
