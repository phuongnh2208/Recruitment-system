/**
 * Skeleton loader for the pending approval page.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Matches the structure of the pending approval page
 *   - ✅ Uses animate-pulse for loading animation
 *   - ❌ No business logic
 */

export default function ApprovalSkeleton() {
  return (
    <div className="space-y-8">
      {/* Pending employers skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-sage/50" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5"
            >
              <div className="space-y-3">
                <div className="h-5 w-40 animate-pulse rounded bg-sage/30" />
                <div className="h-4 w-32 animate-pulse rounded bg-sage/20" />
                <div className="h-4 w-48 animate-pulse rounded bg-sage/20" />
                <div className="h-9 w-28 animate-pulse rounded-seal bg-sage/30" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending jobs skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-sage/50" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5"
            >
              <div className="space-y-3">
                <div className="h-5 w-48 animate-pulse rounded bg-sage/30" />
                <div className="h-4 w-36 animate-pulse rounded bg-sage/20" />
                <div className="h-4 w-28 animate-pulse rounded bg-sage/20" />
                <div className="flex gap-2">
                  <div className="h-9 w-24 animate-pulse rounded-seal bg-sage/30" />
                  <div className="h-9 w-24 animate-pulse rounded-seal bg-sage/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
