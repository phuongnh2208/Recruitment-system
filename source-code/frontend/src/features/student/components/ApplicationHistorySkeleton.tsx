/**
 * Skeleton loader for application history items.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Matches the structure of ApplicationHistoryItem
 *   - ✅ Uses animate-pulse for loading animation
 *   - ❌ No business logic
 */
export default function ApplicationHistorySkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative pl-6 pb-6 before:absolute before:left-2 before:top-0 before:h-full before:w-0.5 before:bg-sage/30"
        >
          <div className="rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-32 animate-pulse rounded bg-sage/30" />
              </div>
              <div className="h-6 w-24 animate-pulse rounded-seal bg-sage/50" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-sage/50" />
              <div className="h-4 w-24 animate-pulse rounded bg-sage/30" />
            </div>
            <div className="mt-2">
              <div className="h-3 w-16 animate-pulse rounded bg-sage/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
